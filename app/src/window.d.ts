export {};

declare global {
  interface Window {
    ipcRenderer: {
      /**
       * Send an IPC message to the main process.
       * @param {string} channel - The channel to send the message on.
       * @param {any} [data] - The data to send with the message.
       */
      send: (channel: string, data?: any) => void;

      /**
       * Listen for an IPC message from the main process.
       * @param {string} channel - The channel to listen on.
       * @param {function} listener - The function to call when a message is received.
       */
      on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;

      /**
       * Remove all listeners for a specific channel.
       * @param {string} channel - The channel to remove listeners from.
       */
      removeAllListeners: (channel: string) => void;
    };

    api: {
      /**
       * Get the list of servers
       * @returns {Promise<any>} List of servers
       */
      getServers: () => Promise<any>;

      /**
       * Get a specific server
       * @param {string} id - Server ID
       * @returns {Promise<any>} The requested server
       */
      getServer: (id: string) => Promise<any>;

      /**
       * Add a new server
       * @param {any} server - Server details
       * @returns {Promise<any>} The added server
       */
      addServer: (server: {
        name: string;
        directory: string;
        rconPassword: string;
      }) => Promise<any>;

      /**
       * Update a server by ID
       * @param {string} id - Server ID
       * @param {any} server - Server details
       * @returns {Promise<any>} The updated server
       */
      updateServer: (id: string, server: any) => Promise<any>;

      /**
       * Check the status of all servers
       * @returns {Promise<void>} The server response
       */
      checkServerStatus: () => Promise<void>;

      /**
       * Delete a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<void>}
       */
      deleteServer: (id: string) => Promise<void>;

      /**
       * Init a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      initServer: (id: string) => Promise<string>;

      /**
       * Start a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      startServer: (id: string) => Promise<string>;

      /**
       * Save a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      saveServer: (id: string) => Promise<string>;

      /**
       * Restart a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      restartServer: (id: string) => Promise<string>;

      /**
       * Stop a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      stopServer: (id: string) => Promise<string>;

      /**
       * Choose a directory
       * @returns {Promise<string>} The selected directory
       */
      chooseDirectory: () => Promise<string>;

      /**
       * Choose a file
       * @returns {Promise<string>} The selected file
       */
      chooseFile: () => Promise<string>;
      
      /**
       * Retrieve fields from server.properties
       * @param {string} id - Server ID
       * @returns {Promise<any>} The updated properties
       */
      getServerProperties: (id: string) => Promise<any>;

      /**
       * Update fields in server.properties
       * @param {string} id - Server ID
       * @param {any} properties - The updated properties
       * @returns {Promise<any>} The updated properties
       */
      saveServerProperties: (id: string, properties: any) => Promise<void>;

      updateRamAllocation: (id: string, ram: number) => Promise<string>;

      /**
       * Update fields in server.properties
       * @param {string} id - Server ID
       * @param {string} command - The rcon command to send
       * @returns {Promise<string>} The server response
       */
      sendRconCommand: (id: string, command: string) => Promise<string>;

      getIpAddress: () => Promise<string>;
    };
  }
}
