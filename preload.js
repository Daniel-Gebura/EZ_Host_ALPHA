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
   * Get the current IPv4 address
   * @returns {Promise<string>} The IPv4 address
   */
  getIpAddress: async () => {
    const response = await fetch('http://localhost:5000/api/ip-address');
    if (!response.ok) {
      throw new Error('Failed to fetch IP address');
    }
    const { ipAddress } = await response.json();
    return ipAddress;
  },

  /**
   * Get the list of servers
   * @returns {Promise<Array>} List of servers
   */
  getServers: async () => {
    const response = await fetch('http://localhost:5000/api/servers');
    return response.json();
  },

  /**
   * Get a specific server by ID
   * @param {string} id - Server ID
   * @returns {Promise<Object>} The server details
   */
  getServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}`);
    if (!response.ok) {
      throw new Error('Server not found');
    }
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
   * Check the status of all servers
   * @returns {Promise<void>}
   */
  checkServerStatus: async () => {
    const response = await fetch('http://localhost:5000/api/servers/check-status', {
      method: 'POST',
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
   * Init a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<string>} Response from the server
   */
  initServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/initServer`, {
      method: 'POST',
    });
    return response.text();
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

  /**
   * Get server properties by ID
   * @param {string} id - Server ID
   * @returns {Promise<Object>} The server properties
   */
  getServerProperties: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/properties`);
    if (!response.ok) {
      throw new Error('Server properties not found');
    }
    return response.json();
  },

  /**
   * Save server properties by ID
   * @param {string} id - Server ID
   * @param {Object} properties - The updated properties
   * @returns {Promise<void>}
   */
  saveServerProperties: async (id, properties) => {
    await fetch(`http://localhost:5000/api/servers/${id}/properties`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(properties),
    });
  },

  /**
   * Get RAM allocation from variables.txt
    * @param {string} id - Server ID
    * @returns {Promise<number>} The RAM allocation in GB
    */
  getRamAllocation: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/ram`);
    if (!response.ok) {
      throw new Error('Failed to fetch RAM allocation');
    }
    const { ram } = await response.json();
    return ram;
  },

  updateRamAllocation: async (id, ram) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/ram`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ram }),
    });
    if (!response.ok) {
      throw new Error('Failed to update RAM allocation');
    }
    return response.text();
  },

  /**
   * Send an RCON command to the server
   * @param {string} id - Server ID
   * @param {string} command - The RCON command to send
   * @returns {Promise<string>} The server response
   */
  sendRconCommand: async (id, command) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/rcon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    return response.text();
  },
});
