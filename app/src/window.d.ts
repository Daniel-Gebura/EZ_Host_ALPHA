export {};

declare global {
  interface Window {
    api: {
      /**
       * Get the list of servers
       * @returns {Promise<{ success: boolean, message: string, data?: any }>} List of servers
       */
      getServers: () => Promise<{ success: boolean, message: string, data?: any }>;

      /**
       * Get a specific server
       * @param {string} id - Server ID
       * @returns {Promise<{ success: boolean, message: string, data?: any }>} The requested server
       */
      getServer: (id: string) => Promise<{ success: boolean, message: string, data?: any }>;

      /**
       * Add a new server
       * @param {any} server - Server details
       * @returns {Promise<{ success: boolean, message: string, data?: any }>} The added server
       */
      addServer: (server: {
        name: string;
        type: 'forge' | 'fabric';
        directory: string;
        rconPassword: string;
      }) => Promise<{ success: boolean, message: string, data?: any }>;

      /**
       * Update a server by ID
       * @param {string} id - Server ID
       * @param {any} server - Server details
       * @returns {Promise<{ success: boolean, message: string, data?: any }>} The updated server
       */
      updateServer: (id: string, server: any) => Promise<{ success: boolean, message: string, data?: any }>;

      /**
       * Delete a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<{ success: boolean, message: string }>}
       */
      deleteServer: (id: string) => Promise<{ success: boolean, message: string }>;

      /**
       * Init a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<{ success: boolean, message: string }>}
       */
      initServer: (id: string) => Promise<{ success: boolean, message: string }>;

      /**
       * Start a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<{ success: boolean, message: string }>}
       */
      startServer: (id: string) => Promise<{ success: boolean, message: string }>;

      /**
       * Save a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<{ success: boolean, message: string }>}
       */
      saveServer: (id: string) => Promise<{ success: boolean, message: string }>;

      /**
       * Restart a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<{ success: boolean, message: string }>}
       */
      restartServer: (id: string) => Promise<{ success: boolean, message: string }>;

      /**
       * Stop a server by ID
       * @param {string} id - Server ID
       * @returns {Promise<{ success: boolean, message: string }>}
       */
      stopServer: (id: string) => Promise<{ success: boolean, message: string }>;

      /**
       * Choose a directory
       * @returns {Promise<{ success: boolean, message: string, path?: string }>}
       */
      chooseDirectory: () => Promise<{ success: boolean, message: string, path?: string }>;

      /**
       * Choose a file
       * @returns {Promise<{ success: boolean, message: string, path?: string }>}
       */
      chooseFile: () => Promise<{ success: boolean, message: string, path?: string }>;
    };
  }
}
