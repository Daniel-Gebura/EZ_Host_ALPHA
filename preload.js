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

  /**
   * Open a directory chooser dialog
   * @returns {Promise<string>} The selected directory path
   */
  chooseDirectory: async () => {
    const result = await ipcRenderer.invoke('choose-directory');
    return result;
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
      const response = await fetch(
        'http://localhost:5000/api/servers/ip-address'
      );

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
    try {
      const response = await fetch('http://localhost:5000/api/servers', {
        method: 'POST',
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
          message: data.message || 'Failed to create server.',
          error: data.error || 'An error occurred while creating the server.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error creating server:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
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
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/initServer`, {
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
          message: data.message || 'Failed to initialize server.',
          error: data.error || 'An error occurred while initializing the server.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error initializing server:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
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

      // Parse the JSON response
      const data = await response.json();

      if (response.ok) {
        return { 
          status: 'success', 
          message: data.message, 
          data: data.data 
        };
      } else {
        return { 
          status: 'error', 
          message: data.message, 
          error: data.error 
        };
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
   * Get server properties by ID
   * @param {string} id - Server ID
   * @returns {Promise<Object>} The server properties
   */
  getServerProperties: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/properties`);

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
          message: data.message || 'Failed to retrieve server properties.',
          error: data.error || 'An error occurred while fetching the server properties.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching server properties:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Save server properties by ID
   * @param {string} id - Server ID
   * @param {Object} properties - The updated properties
   * @returns {Promise<void>}
   */
  saveServerProperties: async (id, properties) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/properties`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(properties),
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
          message: data.message || 'Failed to save server properties.',
          error: data.error || 'An error occurred while saving the server properties.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error saving server properties:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Get RAM allocation from variables.txt
   * @param {string} id - Server ID
   * @returns {Promise<number>} The RAM allocation in GB
   */
  getRamAllocation: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/ram`);

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
          message: data.message || 'Failed to retrieve RAM allocation.',
          error: data.error || 'An error occurred while fetching the RAM allocation.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching RAM allocation:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Update RAM allocation for a server
   * @param {string} id - Server ID
   * @param {number} ram - RAM allocation in GB
   * @returns {Promise<string>} Response from the server
   */
  updateRamAllocation: async (id, ram) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/ram`,{
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ram }),
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
          message: data.message || 'Failed to update RAM allocation.',
          error: data.error || 'An error occurred while updating RAM allocation.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error updating RAM allocation:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }

  },

  /**
   * Send an RCON command to the server
   * @param {string} id - Server ID
   * @param {string} command - The RCON command to send
   * @returns {Promise<string>} The server response
   */
  sendRconCommand: async (id, command) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/rcon`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
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
          message: data.message || 'Failed to send rcon command.',
          error: data.error || 'An error occurred while send rcon command.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error sending Rcon command:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * Get the list of players on a server
   * @param {string} id - Server ID
   * @returns {Promise<string[]>} List of player names
   */
  getPlayers: async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/servers/${id}/players`);

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
          message: data.message || 'Failed to retrieve player list.',
          error: data.error || 'An error occurred while fetching the player list.',
        };
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error fetching player list:', error);
      return {
        status: 'error',
        message: 'Failed to connect to the server.',
        error: error.message,
      };
    }
  },

  /**
   * OP or un-OP a player
   * @param {string} id - Server ID
   * @param {string} playerName - Player name
   * @param {boolean} op - true to OP, false to un-OP
   * @returns {Promise<string>} Response from the server
   */
  setPlayerOp: async (id, playerName, op) => {
    const response = await fetch(
      `http://localhost:5000/api/servers/${id}/player/${playerName}/op`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ op }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to ${op ? 'OP' : 'un-OP'} player`);
    }
    return response.json();
  },
});
