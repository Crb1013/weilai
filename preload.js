const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 打开文件对话框
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  // 打开文件夹对话框
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  // 监听选择的文件
  onSelectedFiles: (callback) => ipcRenderer.on('selected-files', (event, ...args) => callback(...args)),
  // 监听选择的文件夹中的文件
  onSelectedFolderFiles: (callback) => ipcRenderer.on('selected-folder-files', (event, ...args) => callback(...args)),
  // 移除监听器
  removeListeners: () => {
    ipcRenderer.removeAllListeners('selected-files');
    ipcRenderer.removeAllListeners('selected-folder-files');
  }
});