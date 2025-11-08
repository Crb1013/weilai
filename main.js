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