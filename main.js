const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 保持窗口对象的全局引用，避免被垃圾回收
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载应用的index.html
  mainWindow.loadFile('index.html');

  // 打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 窗口关闭事件
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时触发
app.on('ready', createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在macOS上，点击dock图标重新创建窗口
app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC通信：打开音乐文件对话框
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '音乐文件', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'] }
    ]
  }).then(result => {
    if (!result.canceled) {
      event.reply('selected-files', result.filePaths);
    }
  }).catch(err => {
    console.error('打开文件对话框错误:', err);
  });
});

// IPC通信：打开文件夹对话框
ipcMain.on('open-folder-dialog', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      // 读取文件夹中的音乐文件
      const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'];
      const files = [];
      
      function readDirectory(directory) {
        const items = fs.readdirSync(directory);
        for (const item of items) {
          const fullPath = path.join(directory, item);
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            readDirectory(fullPath); // 递归读取子文件夹
          } else if (audioExtensions.some(ext => item.toLowerCase().endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
      
      try {
        readDirectory(folderPath);
        event.reply('selected-folder-files', files);
      } catch (err) {
        console.error('读取文件夹错误:', err);
        event.reply('selected-folder-files', []);
      }
    }
  }).catch(err => {
    console.error('打开文件夹对话框错误:', err);
  });
});

// 用户数据文件路径
const usersFilePath = path.join(__dirname, 'users.json');

// 读取用户数据
function getUsers() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('读取用户数据错误:', err);
    return [];
  }
}

// 保存用户数据
function saveUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('保存用户数据错误:', err);
    return false;
  }
}

// IPC通信：获取用户数据
ipcMain.on('get-users', (event) => {
  const users = getUsers();
  event.reply('users-data', users);
});

// IPC通信：添加新用户
ipcMain.on('add-user', (event, user) => {
  try {
    const users = getUsers();
    // 检查用户名是否已存在
    if (users.some(u => u.username === user.username)) {
      event.reply('add-user-result', { success: false, message: '用户名已存在' });
      return;
    }
    // 添加新用户
    users.push(user);
    const success = saveUsers(users);
    event.reply('add-user-result', { success: success });
  } catch (err) {
    console.error('添加用户错误:', err);
    event.reply('add-user-result', { success: false, message: '添加用户失败' });
  }
});

// IPC通信：验证用户登录
ipcMain.on('verify-user', (event, { username, password }) => {
  try {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      event.reply('verify-user-result', { success: true, user });
    } else {
      event.reply('verify-user-result', { success: false, message: '用户名或密码错误' });
    }
  } catch (err) {
    console.error('验证用户登录错误:', err);
    event.reply('verify-user-result', { success: false, message: '验证失败' });
  }
});

// IPC通信：删除用户
ipcMain.on('delete-user', (event, username) => {
    try {
        const users = getUsers();
        const filteredUsers = users.filter(u => u.username !== username);
        const success = saveUsers(filteredUsers);
        event.reply('delete-user-result', { success: success });
    } catch (err) {
        console.error('删除用户错误:', err);
        event.reply('delete-user-result', { success: false, message: '删除用户失败' });
    }
});

// IPC通信：获取用户便签数据
ipcMain.on('get-user-todos', (event, username) => {
    try {
        const users = getUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            event.reply('user-todos-data', { success: true, todos: user.todos || [], alarms: user.alarms || [] });
        } else {
            event.reply('user-todos-data', { success: false, message: '用户不存在' });
        }
    } catch (err) {
        console.error('获取用户便签数据错误:', err);
        event.reply('user-todos-data', { success: false, message: '获取便签数据失败' });
    }
});

// IPC通信：保存用户便签数据
ipcMain.on('save-user-todos', (event, { username, todos, alarms }) => {
    try {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            // 更新用户的便签数据
            users[userIndex].todos = todos;
            users[userIndex].alarms = alarms;
            const success = saveUsers(users);
            event.reply('save-user-todos-result', { success: success });
        } else {
            event.reply('save-user-todos-result', { success: false, message: '用户不存在' });
        }
    } catch (err) {
        console.error('保存用户便签数据错误:', err);
        event.reply('save-user-todos-result', { success: false, message: '保存便签数据失败' });
    }
});

// IPC通信：获取用户数量
ipcMain.on('get-user-count', (event) => {
    try {
        const users = getUsers();
        const userCount = users.length;
        event.reply('user-count-data', { success: true, count: userCount });
    } catch (err) {
        console.error('获取用户数量错误:', err);
        event.reply('user-count-data', { success: false, message: '获取用户数量失败' });
    }
});