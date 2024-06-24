export {};

declare global {
  interface Window {
    api: {
      /**
       * Get the list of servers
       * @returns {Promise<any>} List of servers
       */
      getServers: () => Promise<any>;

      /**
       * Add a new server
       * @param {any} server - Server details
       * @returns {Promise<any>} The added server
       */
      addServer: (server: any) => Promise<any>;

      /**
       * Delete a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<void>}
       */
      deleteServer: (id: string) => Promise<void>;

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
       * @returns {Promise<string>} Response from the server
       */
      chooseDirectory: () => Promise<string>;
    };
  }
}
