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
const { app, BrowserWindow, Notification, ipcMain } = require('electron'); // Electron modules for application
const url = require('url'); // Module for URL handling
const path = require('path'); // Module for file path handling

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
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'), // Preload script for additional security
    },
  });

  // DEBUGGING: Open DevTools
  //mainWindow.webContents.openDevTools();

  // Define the start URL for the main window
  const startUrl = url.format({
    pathname: path.join(__dirname, './app/build/index.html'),
    protocol: 'file:',
    slashes: true, // Ensures proper URL formatting across platforms
  });

  // Load the start URL in the main window
  mainWindow.loadURL(startUrl);

  // Handle full-screen events
  mainWindow.on('enter-full-screen', () => {
    console.log('Entered full-screen mode');
    // Add any additional logic here, such as notifying the renderer process
    mainWindow.webContents.send('full-screen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    console.log('Exited full-screen mode');
    // Add any additional logic here, such as notifying the renderer process
    mainWindow.webContents.send('full-screen-changed', false);
  });
}

// START UP CALL: Application ready event
app.whenReady().then(() => {
  createMainWindow(); // Create the main window when the app is ready
  // createServer(); // Uncomment to start the API server if needed
});
