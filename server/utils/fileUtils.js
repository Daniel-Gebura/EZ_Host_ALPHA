/**
 * fileUtils.js
 *
 * Utility functions for loading and saving server data to a JSON file.
 *
 * @file fileUtils.js
 * @description Utility functions for file operations
 * @version 1.0
 */

const fs = require('fs');
const path = require('path');

// Path to the servers.json file
const DATA_FILE = path.join(__dirname, '..', 'servers.json');

/**
 * Load existing servers from the servers.json file.
 * @returns {Object[]} The list of servers.
 */
const loadServers = () => {
  if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE);
    try {
      return JSON.parse(fileData);
    } catch (err) {
      console.error('Error parsing servers.json:', err);
      return [];
    }
  }
  return [];
};

/**
 * Save servers to the servers.json file.
 * @param {Object[]} servers - The list of servers to save.
 */
const saveServers = (servers) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));
};

module.exports = { loadServers, saveServers };
