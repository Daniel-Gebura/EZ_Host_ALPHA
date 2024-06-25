/**
 * preload.js
 * 
 * Preload script for the Electron application.
 * This script is used to expose specific APIs to the renderer process
 * through the context bridge to enhance security.
 * 
 * @file preload.js
 * @description Preload script for Electron application
 * @version 1.0
 */

const { contextBridge, ipcRenderer } = require('electron'); // Electron modules for context bridging and IPC

/**
 * Expose IPC renderer methods to the renderer process
 */
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data), // Send IPC message to main process
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)), // Listen for IPC message from main process
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel), // Remove all listeners for a specific channel
});

/**
 * Expose API methods for interacting with the backend server
 */
contextBridge.exposeInMainWorld('api', {
  /**
   * Get the list of servers
   * @returns {Promise<Array>} List of servers
   */
  getServers: async () => {
    const response = await fetch('http://localhost:5000/api/servers');
    return response.json();
  },

  /**
   * Add a new server
   * @param {Object} server - Server details
   * @returns {Promise<Object>} The added server
   */
  addServer: async (server) => {
    const response = await fetch('http://localhost:5000/api/servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });
    return response.json();
  },

  /**
   * Update a server by ID
   * @param {string} id - Server ID
   * @param {Object} server - Server details
   * @returns {Promise<Object>} The updated server
   */
  updateServer: async (id, server) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });
    return response.json();
  },

  /**
   * Delete a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<void>}
   */
  deleteServer: async (id) => {
    await fetch(`http://localhost:5000/api/servers/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Start a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<string>} Response from the server
   */
  startServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/start`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Save a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<string>} Response from the server
   */
  saveServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/save`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Restart a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<string>} Response from the server
   */
  restartServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/restart`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Stop a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<string>} Response from the server
   */
  stopServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/stop`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Open a directory chooser dialog
   * @returns {Promise<string>} The selected directory path
   */
  chooseDirectory: async () => {
    const result = await ipcRenderer.invoke('choose-directory');
    return result;
  },

  /**
   * Open a file chooser dialog
   * @returns {Promise<string>} The selected file path
   */
  chooseFile: async () => {
    const result = await ipcRenderer.invoke('choose-file');
    return result;
  },
});
