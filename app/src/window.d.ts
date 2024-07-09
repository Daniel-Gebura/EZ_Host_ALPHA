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

      /**
       * Invoke an IPC method and return a promise.
       * @param {string} channel - The channel to invoke the method on.
       * @param {...any} args - The arguments to pass to the IPC method.
       * @returns {Promise<any>} - A promise that resolves with the result of the IPC method.
       */
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };

    api: {
      /**
       * Get the user's current IPv4 address.
       * @returns {Promise<string>} IPv4 Address
       */
      getIpAddress: () => Promise<string>;

      /**
       * Get the list of servers.
       * @returns {Promise<any>} List of servers
       */
      getServers: () => Promise<any>;

      /**
       * Get a specific server.
       * @param {string} id - Server ID
       * @returns {Promise<any>} The requested server
       */
      getServer: (id: string) => Promise<any>;

      /**
       * Add a new server.
       * @param {any} server - Server details
       * @returns {Promise<any>} The added server
       */
      addServer: (server: {
        name: string;
        type: string;
        directory: string;
        icon?: string;
        rconPassword: string;
      }) => Promise<any>;

      /**
       * Update a server by ID.
       * @param {string} id - Server ID
       * @param {any} server - Server details
       * @returns {Promise<any>} The updated server
       */
      updateServer: (id: string, server: any) => Promise<any>;

      /**
       * Check the status of all servers.
       * @returns {Promise<void>} The server response
       */
      checkServerStatus: () => Promise<void>;

      /**
       * Delete a server by ID.
       * @param {string} id - Server ID
       * @returns {Promise<void>}
       */
      deleteServer: (id: string) => Promise<void>;

      /**
       * Init a server by ID.
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      initServer: (id: string) => Promise<string>;

      /**
       * Start a server by ID.
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      startServer: (id: string) => Promise<string>;

      /**
       * Save a server by ID.
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      saveServer: (id: string) => Promise<string>;

      /**
       * Restart a server by ID.
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      restartServer: (id: string) => Promise<string>;

      /**
       * Stop a server by ID.
       * @param {string} id - Server ID
       * @returns {Promise<string>} Response from the server
       */
      stopServer: (id: string) => Promise<string>;

      /**
       * Choose a directory.
       * @returns {Promise<string>} The selected directory
       */
      chooseDirectory: () => Promise<string>;

      /**
       * Choose a file.
       * @returns {Promise<string>} The selected file
       */
      chooseFile: () => Promise<string>;

      /**
       * Get server properties by ID.
       * @param {string} id - Server ID
       * @returns {Promise<any>} The server properties
       */
      getServerProperties: (id: string) => Promise<any>;

      /**
       * Save server properties by ID.
       * @param {string} id - Server ID
       * @param {any} properties - The updated properties
       * @returns {Promise<void>}
       */
      saveServerProperties: (id: string, properties: any) => Promise<void>;

      /**
       * Get RAM allocation from variables.txt.
       * @param {string} id - Server ID
       * @returns {Promise<number>} The RAM allocation in GB
       */
      getRamAllocation: (id: string) => Promise<number>;

      /**
       * Update RAM allocation for a server.
       * @param {string} id - Server ID
       * @param {number} ram - The RAM allocation in GB
       * @returns {Promise<string>} Response from the server
       */
      updateRamAllocation: (id: string, ram: number) => Promise<string>;

      /**
       * Send an RCON command to the server.
       * @param {string} id - Server ID
       * @param {string} command - The RCON command to send
       * @returns {Promise<string>} The server response
       */
      sendRconCommand: (id: string, command: string) => Promise<string>;

      /**
       * Get the list of players on a server.
       * @param {string} id - Server ID
       * @returns {Promise<string[]>} List of player names
       */
      getPlayers: (id: string) => Promise<string[]>;

      /**
       * OP or un-OP a player.
       * @param {string} id - Server ID
       * @param {string} playerName - Player name
       * @param {boolean} op - true to OP, false to un-OP
       * @returns {Promise<string>} Response from the server
       */
      setPlayerOp: (id: string, playerName: string, op: boolean) => Promise<string>;
    };
  }
}
