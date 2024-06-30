/**
 * main.js
 * 
 * Entry point for the Electron application.
 * This script handles the backend lifecycle events of the application.
 * 
 * @file main.js
 * @description Main process of the Electron application
 * @version 1.0
 */
const { app, BrowserWindow, dialog, ipcMain } = require('electron'); // Electron modules for application
const url = require('url'); // Module for URL handling
const path = require('path'); // Module for file path handling
const { startApiServer } = require('./server/api'); // Import the API server starter function
const WebSocket = require('ws');

let mainWindow;

/**
 * Create the main application window.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'EZ Host',
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // Disable nodeIntegration for security
      preload: path.join(__dirname, 'preload.js'), // Preload script for additional security
    },
    autoHideMenuBar: true, // This line hides the menu bar
  });
  

  // DEBUGGING: Open DevTools
  //mainWindow.webContents.openDevTools();

  // Define the start URL for the main window
  const startUrl = url.format({
    pathname: path.join(__dirname, 'app/build/index.html'),
    protocol: 'file:',
    slashes: true, // Ensures proper URL formatting across platforms
  });

  // Load the start URL in the main window
  mainWindow.loadURL(startUrl);

  // Handle full-screen events
  mainWindow.on('enter-full-screen', () => {
    console.log('Entered full-screen mode');
    mainWindow.webContents.send('full-screen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    console.log('Exited full-screen mode');
    mainWindow.webContents.send('full-screen-changed', false);
  });
}

/**
 * Handle the choose-directory IPC call
 */
ipcMain.handle('choose-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

/**
 * Handle the choose-file IPC call
 */
ipcMain.handle('choose-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
  });
  return result.filePaths[0];
});

// START UP CALL: Application ready event
app.whenReady().then(() => {
  createMainWindow(); // Create the main window when the app is ready
  startApiServer(); // Start the API server

  const ws = new WebSocket('ws://localhost:5000');

  ws.on('open', () => {
    console.log('WebSocket connection established');
  });

  ws.on('message', (message) => {
    if (message === 'update') {
      mainWindow.webContents.send('update');
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Handle application re-activation (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Handle all windows being closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
