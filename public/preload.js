const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVaultFiles: (vaultPath) => ipcRenderer.invoke('get-vault-files'),
  readFile: (vaultPath, fileName) => ipcRenderer.invoke('read-file', fileName),
  writeFile: (vaultPath, fileName, content) => ipcRenderer.invoke('write-file', fileName, content),
  createNote: (noteName) => ipcRenderer.invoke('create-note', noteName),
  deleteFile: (fileName) => ipcRenderer.invoke('delete-note', fileName),
  getVaultPath: () => ipcRenderer.invoke('get-vault-path'),
  openVault: () => ipcRenderer.invoke('open-vault'),
  onVaultOpened: (callback) => ipcRenderer.on('vault-opened', callback),
  onFileAdded: (callback) => ipcRenderer.on('file-added', callback),
  onFileChanged: (callback) => ipcRenderer.on('file-changed', callback),
  onFileDeleted: (callback) => ipcRenderer.on('file-deleted', callback),
  onNewNote: (callback) => ipcRenderer.on('new-note', callback),
  onToggleCommandPalette: (callback) => ipcRenderer.on('toggle-command-palette', callback),
  onToggleQuickSwitcher: (callback) => ipcRenderer.on('toggle-quick-switcher', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
