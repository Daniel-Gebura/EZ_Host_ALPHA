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
   * @typedef {Object} ApiResponse
   * @property {'success' | 'error'} status - The status of the response
   * @property {string} message - A message detailing the result
   * @property {any} [data] - Optional data payload
   * @property {string} [error] - Optional error message
   */

  /**
   * Get the current IPv4 address
   * @returns {Promise<string>} The IPv4 address
   */
  getIpAddress: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/servers/ip-address');

      // Parse the JSON response
      const data = await response.json();

      // Handle the HTTP response codes and return a structured object
      if (response.ok) {
        // Success response
        return {
          status: 'success',
          message: data.message,
          data: data.data,
        };
      } else {
        // Error response
        return {
          status: 'error',
          message: data.message || 'Failed to retrieve IPv4 address.',
          error: data.error || 'An error occurred while fetching the internal local IPv4 address.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching IPv4 address:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Get the list of servers
   * @returns {Promise<Array>} List of servers
   */
  getServers: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/servers');

      // Parse the JSON response
      const data = await response.json();

      // Handle the HTTP response codes and return a structured object
      if (response.ok) {
        // Success response
        return {
          status: 'success',
          message: data.message,
          data: data.data,
        };
      } else {
        // Error response
        return {
          status: 'error',
          message: data.message || 'Failed to retrieve server list.',
          error: data.error || 'An error occurred while fetching the server list.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching list of servers', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Get a specific server by ID
   * @param {string} id - Server ID
   * @returns {Promise<Object>} The server details wrapped in a structured response
   */
  getServer: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}`);

      // Parse the JSON response
      const data = await response.json();

      // Handle the HTTP response codes and return a structured object
      if (response.ok) {
        // Success response
        return {
          status: 'success',
          message: data.message,
          data: data.data,
        };
      } else {
        // Error response
        return {
          status: 'error',
          message: data.message || 'Failed to retrieve server.',
          error: data.error || 'An error occurred while fetching the server.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching server:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
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
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(server),
      });

      // Parse the JSON response
      const data = await response.json();

      // Handle the HTTP response codes and return a structured object
      if (response.ok) {
        // Success response
        return {
          status: 'success',
          message: data.message,
          data: data.data,
        };
      } else {
        // Error response
        return {
          status: 'error',
          message: data.message || 'Failed to retrieve server.',
          error: data.error || 'An error occurred while fetching the server.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching server:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Check the status of all servers
   * @returns {Promise<void>}
   */
  checkServerStatus: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/servers/check-status', {
        method: 'POST',
      });

      // Parse the JSON response
      const data = await response.json();

      // Handle the HTTP response codes and return a structured object
      if (response.ok) {
        // Success response
        return {
          status: 'success',
          message: data.message,
          data: data.data,
        };
      } else {
        // Error response
        return {
          status: 'error',
          message: data.message || 'Failed to update server statuses.',
          error: data.error || 'An error occurred while updating the server statuses.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching server:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Delete a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<void>}
   */
  deleteServer: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}`, {
        method: 'DELETE',
      });
  
      // Parse the JSON response
      const data = await response.json();

      // Handle the HTTP response codes and return a structured object
      if (response.ok) {
        // Success response
        return {
          status: 'success',
          message: data.message,
        };
      } else {
        // Error response
        return {
          status: 'error',
          message: data.message || 'Failed to delete server.',
          error: data.error || 'An error occurred while deleteing the server.',
        };
      }
    } catch (error) { 
      // Handle any network or unexpected errors
      console.error('Error fetching server:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
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
   * @returns {Promise<{ status: number, data: { message: string } }>} Response from the server
   */
  startServer: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/start`, {
        method: 'POST',
      });
  
      const data = await response.json();
  
      if (response.ok) {
        return { status: 'success', message: data.message, data: data.data };
      } else {
        return { status: 'error', message: data.message, error: data.error };
      }
    } catch (error) {
      console.error('Error starting server:', error);
      return {
        status: 'error',
        message: 'Failed to start server. Please try again later.',
        error: error.message,
      };
    }
  },

  /**
   * Save a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<object>} Response from the server
   */
  saveServer: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/save`, {
        method: 'POST',
      });

      const data = await response.json();

      // Check for HTTP status and handle accordingly
      if (response.ok) {
        return { status: 'success', message: data.message, data: data.output };
      } else {
        return { status: 'error', message: data.message, error: data.error || 'Unknown error occurred' };
      }
    } catch (error) {
      console.error('Error saving server:', error);
      return { status: 'error', message: 'Failed to connect to server', error: error.message };
    }
  },

  /**
   * Stop a server by ID
   * @param {string} id - Server ID
   * @returns {Promise<string>} Response from the server
   */
  stopServer: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/stop`, {
        method: 'POST',
      });

      const data = await response.json();

      // Check for HTTP status and handle accordingly
      if (response.ok) {
        return { status: 'success', message: data.message, data: data.output };
      } else {
        return { status: 'error', message: data.message, error: data.error || 'Unknown error occurred' };
      }
    } catch (error) {
      console.error('Error stopping server:', error);
      return { status: 'error', message: 'Failed to connect to server', error: error.message };
    }
  },

  /**
   * Open a directory chooser dialog
   * @returns {Promise<string>} The selected directory path
   */
  chooseDirectory: async () => {
    try {
      const response = await ipcRenderer.invoke('choose-directory');
      // Parse the JSON response
      const data = await response.json();

      // Handle the HTTP response codes and return a structured object
      if (response.ok) {
        // Success response
        return {
          status: 'success',
          message: data.message,
          data: data.data,
        };
      } else {
        // Error response
        return {
          status: 'error',
          message: data.message || 'Failed to choose directory.',
          error: data.error || 'An error occurred while choosing a directory.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error choosing directory:', error);
      return {
        status: 'error',
        message: 'Failed to choose a directory.',
        error: error.message,
      };
    }
  },
  
  /**
   * Check if a specified file exists in a given path
   * @param {string} dir - The directory path
   * @param {string} filename - The file name
   * @returns {Promise<boolean>} - True if the file exists, false otherwise
   */
  checkFileExistence: (dir, filename) => 
    ipcRenderer.invoke('check-file-existence', dir, filename),

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

  /**
   * Update RAM allocation for a server
   * @param {string} id - Server ID
   * @param {number} ram - RAM allocation in GB
   * @returns {Promise<string>} Response from the server
   */
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

  /**
   * Get the list of players on a server
   * @param {string} id - Server ID
   * @returns {Promise<string[]>} List of player names
   */
  getPlayers: async (id) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/players`);
    if (!response.ok) {
      throw new Error('Failed to fetch players list');
    }
    return response.json();
  },

  /**
   * OP or un-OP a player
   * @param {string} id - Server ID
   * @param {string} playerName - Player name
   * @param {boolean} op - true to OP, false to un-OP
   * @returns {Promise<string>} Response from the server
   */
  setPlayerOp: async (id, playerName, op) => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/player/${playerName}/op`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ op }),
    });
    if (!response.ok) {
      throw new Error(`Failed to ${op ? 'OP' : 'un-OP'} player`);
    }
    return response.json();
  },
});
