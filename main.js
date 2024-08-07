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
const chokidar = require('chokidar'); // Module for watching file changes

let mainWindow;
let watcher; // Declare watcher at the top level to ensure proper cleanup

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
    autoHideMenuBar: true, // Hide the menu bar for a cleaner interface
  });

  // DEBUGGING: Open DevTools
  // mainWindow.webContents.openDevTools();

  // Define the start URL for the main window
  const startUrl = url.format({
    pathname: path.join(__dirname, 'frontend/build/index.html'),
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

  // Initialize the watcher for the servers.json file
  watcher = chokidar.watch(path.join(__dirname, 'backend', 'myServers.json'), {
    persistent: true,
  });

  watcher.on('change', () => {
    if (mainWindow) {
      // Send a message to the renderer process to refresh
      mainWindow.webContents.send('servers-json-changed');
    }
  });

  mainWindow.on('closed', () => {
    // Dereference the window object and close the watcher
    mainWindow = null;
    if (watcher) {
      watcher.close();
    }
  });
}

/**
 * START UP CALL: Application ready event
 */
app.whenReady().then(() => {
  createMainWindow(); // Create the main window when the app is ready
  require('./backend/api'); // Start the API server
});

/**
 * Handle application re-activation (macOS)
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

/**
 * Handle all windows being closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
