const os = require('os');

/**
 * Function to get the current IPv4 address
 * @returns {string} IPv4 address
 */
const getIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '127.0.0.1'; // Default IP address if none found
};

module.exports = {
  getIpAddress,
};
