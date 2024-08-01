const fs = require('fs');

/**
 * Helper function to read properties from a file
 * @param {string} filePath - Path to the properties file
 * @returns {Object} Parsed properties
 */
const readPropertiesFile = (filePath) => {
  const properties = {};
  const propertiesContent = fs.readFileSync(filePath, 'utf8');
  propertiesContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        properties[key.trim()] = value.trim();
      }
    }
  });
  return properties;
};

/**
 * Helper function to write properties to a file
 * @param {string} filePath - Path to the properties file
 * @param {Object} properties - Properties to write
 */
const writePropertiesFile = (filePath, properties) => {
  const lines = [];
  Object.entries(properties).forEach(([key, value]) => {
    lines.push(`${key}=${value}`);
  });
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
};

/**
 * Helper function to load servers from file
 * @param {string} filePath - Path to the servers.json file
 * @returns {Array} Parsed servers
 */
const loadServers = (filePath) => {
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
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
 * Helper function to save servers to file
 * @param {Array} servers - Servers array
 * @param {string} filePath - Path to the servers.json file
 */
const saveServers = (servers, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(servers, null, 2));
};

module.exports = {
  readPropertiesFile,
  writePropertiesFile,
  loadServers,
  saveServers,
};
