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
   * @returns {Promise<{ success: boolean, message: string, data?: any }>} List of servers
   */
  getServers: async () => {
    const response = await fetch('http://localhost:5000/api/servers');
    const data = await response.json();
    return { success: response.ok, message: response.ok ? 'Servers fetched successfully' : data.message, data };
  },

  /**
   * Get a specific server by ID
   * @param {string} id - Server ID
   * @returns {Promise<{ success: boolean, message: string, data?: any }>} The server details
   */
  getServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}`);
    const data = await response.json();
    return { success: response.ok, message: response.ok ? 'Server fetched successfully' : data.message, data };
  },

  /**
   * Add a new server
   * @param {Object} server - Server details
   * @returns {Promise<{ success: boolean, message: string, data?: any }>} The added server
   */
  addServer: async (server) => {
    const response = await fetch('http://localhost:5000/api/servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });
    const data = await response.json();
    return { success: response.ok, message: response.ok ? 'Server added successfully' : data.message, data };
  },

  /**
   * Update a server by ID
   * @param {string} id - Server ID
   * @param {Object} server - Server details
   * @returns {Promise<{ success: boolean, message: string, data?: any }>} The updated server
   */
  updateServer: async (id, server) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });
    const data = await response.json();
    return { success: response.ok, message: response.ok ? 'Server updated successfully' : data.message, data };
  },

  /**
   * Delete a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return { success: response.ok, message: response.ok ? 'Server deleted successfully' : data.message };
  },

  /**
   * Init a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  initServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/initServer`, {
      method: 'POST',
    });
    const data = await response.text();
    return { success: response.ok, message: data };
  },

  /**
   * Start a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  startServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/start`, {
      method: 'POST',
    });
    const data = await response.text();
    return { success: response.ok, message: data };
  },

  /**
   * Save a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  saveServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/save`, {
      method: 'POST',
    });
    const data = await response.text();
    return { success: response.ok, message: data };
  },

  /**
   * Restart a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  restartServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/restart`, {
      method: 'POST',
    });
    const data = await response.text();
    return { success: response.ok, message: data };
  },

  /**
   * Stop a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  stopServer: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/stop`, {
      method: 'POST',
    });
    const data = await response.text();
    return { success: response.ok, message: data };
  },

  /**
   * Open a directory chooser dialog
   * @returns {Promise<{ success: boolean, message: string, path?: string }>}
   */
  chooseDirectory: async () => {
    const result = await ipcRenderer.invoke('choose-directory');
    return { success: true, message: 'Directory chosen successfully', path: result };
  },

  /**
   * Open a file chooser dialog
   * @returns {Promise<{ success: boolean, message: string, path?: string }>}
   */
  chooseFile: async () => {
    const result = await ipcRenderer.invoke('choose-file');
    return { success: true, message: 'File chosen successfully', path: result };
  },
});
