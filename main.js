const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const chokidar = require('chokidar');
const { startApiServer } = require('./server/api');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'EZ Host',
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, 'app/build/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  const watcher = chokidar.watch(path.join(__dirname, 'server', 'servers.json'), {
    persistent: true,
  });

  watcher.on('change', () => {
    if (mainWindow) {
      mainWindow.webContents.send('servers-json-changed');
    }
  });

  const logMessage = (message) => {
    if (mainWindow) {
      mainWindow.webContents.send('log-message', message);
    }
  };

  // Example of sending log messages
  logMessage('Server started successfully');

  // Replace this with your own logic to log messages from the server
  setInterval(() => {
    logMessage('Periodic log message');
  }, 10000);
}

ipcMain.handle('choose-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('choose-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
  });
  return result.filePaths[0];
});

app.whenReady().then(() => {
  createMainWindow();
  startApiServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
