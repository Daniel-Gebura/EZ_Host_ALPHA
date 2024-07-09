/**
 * api.ts
 *
 * Centralized module for interacting with the backend API.
 * This module provides various functions to perform operations such as
 * fetching server details, updating server properties, and sending RCON commands.
 *
 * @file api.ts
 * @description Centralized API module for the Electron application
 * @version 1.0
 */

export const api = {
  /**
   * Get the current IPv4 address of the user's machine.
   * @returns {Promise<string>} The IPv4 address.
   */
  getIpAddress: async (): Promise<string> => {
    const response = await fetch('http://localhost:5000/api/ip-address');
    if (!response.ok) {
      throw new Error('Failed to fetch IP address');
    }
    const { ipAddress } = await response.json();
    return ipAddress;
  },

  /**
   * Get the list of all servers.
   * @returns {Promise<any[]>} List of servers.
   */
  getServers: async (): Promise<any[]> => {
    const response = await fetch('http://localhost:5000/api/servers');
    return response.json();
  },

  /**
   * Get the details of a specific server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<any>} The server details.
   */
  getServer: async (id: string): Promise<any> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}`);
    if (!response.ok) {
      throw new Error('Server not found');
    }
    return response.json();
  },

  /**
   * Add a new server.
   * @param {any} server - Server details.
   * @returns {Promise<any>} The added server.
   */
  addServer: async (server: any): Promise<any> => {
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
   * Update the details of a specific server by ID.
   * @param {string} id - Server ID.
   * @param {any} server - Server details.
   * @returns {Promise<any>} The updated server.
   */
  updateServer: async (id: string, server: any): Promise<any> => {
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
   * Check the status of all servers.
   * @returns {Promise<void>} The server status response.
   */
  checkServerStatus: async (): Promise<void> => {
    const response = await fetch('http://localhost:5000/api/servers/check-status', {
      method: 'POST',
    });
    return response.json();
  },

  /**
   * Delete a specific server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<void>}
   */
  deleteServer: async (id: string): Promise<void> => {
    await fetch(`http://localhost:5000/api/servers/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Initialize a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<string>} The response from the server.
   */
  initServer: async (id: string): Promise<string> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/initServer`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Start a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<string>} The response from the server.
   */
  startServer: async (id: string): Promise<string> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/start`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Save the state of a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<string>} The response from the server.
   */
  saveServer: async (id: string): Promise<string> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/save`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Restart a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<string>} The response from the server.
   */
  restartServer: async (id: string): Promise<string> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/restart`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Stop a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<string>} The response from the server.
   */
  stopServer: async (id: string): Promise<string> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/stop`, {
      method: 'POST',
    });
    return response.text();
  },

  /**
   * Open a directory chooser dialog and get the selected directory path.
   * @returns {Promise<string>} The selected directory path.
   */
  chooseDirectory: async (): Promise<string> => {
    const result = await window.ipcRenderer.invoke('choose-directory');
    return result;
  },

  /**
   * Open a file chooser dialog and get the selected file path.
   * @returns {Promise<string>} The selected file path.
   */
  chooseFile: async (): Promise<string> => {
    const result = await window.ipcRenderer.invoke('choose-file');
    return result;
  },

  /**
   * Get the properties of a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<any>} The server properties.
   */
  getServerProperties: async (id: string): Promise<any> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/properties`);
    if (!response.ok) {
      throw new Error('Server properties not found');
    }
    return response.json();
  },

  /**
   * Save the properties of a server by ID.
   * @param {string} id - Server ID.
   * @param {any} properties - The updated properties.
   * @returns {Promise<void>}
   */
  saveServerProperties: async (id: string, properties: any): Promise<void> => {
    await fetch(`http://localhost:5000/api/servers/${id}/properties`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(properties),
    });
  },

  /**
   * Get the RAM allocation of a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<number>} The RAM allocation in GB.
   */
  getRamAllocation: async (id: string): Promise<number> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/ram`);
    if (!response.ok) {
      throw new Error('Failed to fetch RAM allocation');
    }
    const { ram } = await response.json();
    return ram;
  },

  /**
   * Update the RAM allocation of a server by ID.
   * @param {string} id - Server ID.
   * @param {number} ram - The new RAM allocation in GB.
   * @returns {Promise<string>} The response from the server.
   */
  updateRamAllocation: async (id: string, ram: number): Promise<string> => {
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
   * Send an RCON command to the server.
   * @param {string} id - Server ID.
   * @param {string} command - The RCON command to send.
   * @returns {Promise<string>} The server response.
   */
  sendRconCommand: async (id: string, command: string): Promise<string> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/rcon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    return response.text();
  },

  /**
   * Get the list of players on a server by ID.
   * @param {string} id - Server ID.
   * @returns {Promise<string[]>} List of player names.
   */
  getPlayers: async (id: string): Promise<string[]> => {
    const response = await fetch(`http://localhost:5000/api/servers/${id}/players`);
    if (!response.ok) {
      throw new Error('Failed to fetch players list');
    }
    return response.json();
  },

  /**
   * OP or un-OP a player on the server.
   * @param {string} id - Server ID.
   * @param {string} playerName - Player name.
   * @param {boolean} op - True to OP, false to un-OP.
   * @returns {Promise<string>} The response from the server.
   */
  setPlayerOp: async (id: string, playerName: string, op: boolean): Promise<string> => {
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
};
