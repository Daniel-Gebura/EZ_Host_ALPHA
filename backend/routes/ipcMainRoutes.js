const { dialog, ipcMain } = require('electron'); // Electron modules for application
const { fileExists } = require('../utils/validateUtilFunctions');

/**
 * Handle the choose-directory IPC call
 */
ipcMain.handle('choose-directory', async (res) => {
const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
});
if (result) {
    res.status(200).json({
    status: 'success',
    message: 'Directory chosen successfully.',
    data: result.filePaths[0],
    });
} else {
    res.status(404).json({
    status: 'error',
    message: 'Directory not found.',
    error: 'An error occured while choosing a directory',
    });
}
});

/**
 * Handle the check-file-existence IPC call
 */
ipcMain.handle('check-file-existence', async (event, dir, filename) => {
return await fileExists(dir, filename);
});

/**
 * Handle the choose-file IPC call
 */
ipcMain.handle('choose-file', async () => {
const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
});
return result.filePaths[0];
});