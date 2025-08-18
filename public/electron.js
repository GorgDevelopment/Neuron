const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

let mainWindow;
let vaultPath = null;
let fileWatcher = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: app.isPackaged 
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../src/preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      console.log('Dev server not running, loading from build files');
      mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }
  

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (fileWatcher) {
      fileWatcher.close();
    }
  });

  Menu.setApplicationMenu(null);
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Vault',
          accelerator: 'CmdOrCtrl+O',
          click: openVault
        },
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('new-note')
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Command Palette',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow.webContents.send('toggle-command-palette')
        },
        {
          label: 'Quick Switcher',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => mainWindow.webContents.send('toggle-quick-switcher')
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function openVault() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Vault Folder'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    vaultPath = result.filePaths[0];
    setupFileWatcher();
    mainWindow.webContents.send('vault-opened', vaultPath);
  }
}

function setupFileWatcher() {
  if (fileWatcher) {
    fileWatcher.close();
  }

  fileWatcher = chokidar.watch(vaultPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  fileWatcher
    .on('add', (filePath) => {
      if (path.extname(filePath) === '.md') {
        mainWindow.webContents.send('file-added', filePath);
      }
    })
    .on('change', (filePath) => {
      if (path.extname(filePath) === '.md') {
        mainWindow.webContents.send('file-changed', filePath);
      }
    })
    .on('unlink', (filePath) => {
      if (path.extname(filePath) === '.md') {
        mainWindow.webContents.send('file-deleted', filePath);
      }
    });
}

ipcMain.handle('get-vault-files', async () => {
  if (!vaultPath) return [];
  
  const files = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (path.extname(item) === '.md') {
        const relativePath = path.relative(vaultPath, fullPath);
        files.push({
          name: path.basename(item, '.md'),
          path: relativePath,
          fullPath: fullPath,
          modified: stat.mtime
        });
      }
    }
  }
  
  try {
    scanDirectory(vaultPath);
    return files;
  } catch (error) {
    return [];
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fullPath = path.join(vaultPath, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return content;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    const fullPath = path.join(vaultPath, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('create-note', async (event, noteName) => {
  if (!vaultPath) return null;
  
  const fileName = `${noteName}.md`;
  const filePath = path.join(vaultPath, fileName);
  
  if (fs.existsSync(filePath)) {
    return null;
  }
  
  const content = `# ${noteName}\n\n`;
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return fileName;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('delete-note', async (event, filePath) => {
  try {
    const fullPath = path.join(vaultPath, filePath);
    fs.unlinkSync(fullPath);
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('rename-file', async (event, oldPath, newPath) => {
  try {
    const oldFullPath = path.join(vaultPath, oldPath);
    const newFullPath = path.join(vaultPath, newPath);
    
    if (fs.existsSync(newFullPath)) {
      throw new Error('File with new name already exists');
    }
    
    fs.renameSync(oldFullPath, newFullPath);
    return true;
  } catch (error) {
    console.error('Rename error:', error);
    return false;
  }
});

ipcMain.handle('get-vault-path', () => vaultPath);

ipcMain.handle('open-vault', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Vault Folder'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      vaultPath = result.filePaths[0];
      setupFileWatcher();
      console.log('Vault path set to:', vaultPath);
      return vaultPath;
    }
    console.log('Vault selection canceled');
    return null;
  } catch (error) {
    console.error('Error opening vault:', error);
    return null;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
