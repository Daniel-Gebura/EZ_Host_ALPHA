/**
 * serverUtils.js
 *
 * Utility functions for server management including running PowerShell scripts and sending RCON commands.
 *
 * @file serverUtils.js
 * @description Utility functions for server management
 * @version 1.0
 */

const { execFile } = require('child_process');
const { Rcon } = require('rcon-client');
const fs = require('fs');
const path = require('path');
const { loadServers, saveServers } = require('./fileUtils');

let servers = loadServers();

/**
 * Function to get the current list of players from the server.
 * @param {string} rconPassword - The RCON password for the server.
 * @returns {Promise<string[]>} - List of player names.
 */
const getPlayersList = async (rconPassword) => {
  try {
    const rcon = await Rcon.connect({
      host: 'localhost',
      port: 25575,
      password: rconPassword,
    });

    const response = await rcon.send('list');
    await rcon.end();

    // Parse the response to extract player names
    const match = response.match(/There are \d+\/\d+ players online: (.+)/);
    const players = match ? match[1].split(', ') : [];

    return players;
  } catch (error) {
    console.error('Error fetching players list:', error);
    throw new Error('Failed to fetch players list');
  }
};

/**
 * Run a PowerShell script for a server.
 * @param {string} serverId - The ID of the server.
 * @param {string} scriptName - The name of the PowerShell script to run.
 * @param {Object} res - The response object.
 */
const runPowerShellScript = (serverId, scriptName, res) => {
  const server = servers.find(s => s.id === serverId);
  if (!server) {
    return res.status(404).send('Server not found');
  }
  const scriptPath = path.join(server.directory, 'EZHost', scriptName);

  // Update server status to "Starting..." if starting the server
  if (scriptName === 'start.ps1') {
    server.status = 'Starting...';
    saveServers(servers);
  }

  const options = { shell: true };
  const timeout = setTimeout(() => {
    console.error(`Timeout executing ${scriptName}`);
    server.status = 'Offline';
    saveServers(servers);
    res.status(500).send(`Timeout executing ${scriptName}`);
  }, 300000); // Set timeout to 300 seconds (5 minutes)

  console.log(`Executing script: ${scriptPath}`); // Debug log

  const child = execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath], options, (error, stdout, stderr) => {
    clearTimeout(timeout); // Clear the timeout if the script finishes
    console.log(`Clearing Timeout for: ${scriptPath}`); // Debug log
    if (error) {
      console.error(`Error executing ${scriptName}:`, error);
      server.status = 'Offline';
      saveServers(servers);
      return res.status(500).send(`Error executing ${scriptName}: ${error.message}`);
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }
    console.log(`Script stdout: ${stdout}`);
    res.json({ message: `Script ${scriptName} executed successfully`, output: stdout });
  });

  // Listen to the child process's stdout and stderr
  child.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
    // Check if the server is online by looking for specific log output
    if (data.includes('Done') && data.includes('For help, type "help"')) {
      clearTimeout(timeout); // Clear the timeout if server starts successfully
      console.log(`Clearing Timeout for: ${scriptPath}`); // Debug log
      server.status = 'Online';
      saveServers(servers);
    }
  });

  child.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
  });
};

/**
 * Send an RCON command to the server.
 * @param {string} serverId - The ID of the server.
 * @param {string} command - The RCON command to send.
 * @param {Object} res - The response object.
 * @param {Function} [callback] - Optional callback function to run after the command is sent.
 */
const sendRconCommand = async (serverId, command, res, callback) => {
  const server = servers.find(s => s.id === serverId);
  if (!server) {
    if (res) res.status(404).send('Server not found');
    return;
  }

  // Check if server is online before sending RCON command
  if (server.status !== 'Online') {
    console.log('Start server before sending rcon command.');
    if (res) res.status(400).send('Server is not online.');
    return;
  }

  // Update server status based on the command
  if (command === 'stop') {
    server.status = 'Stopping...';
  } else if (command === 'restart') {
    server.status = 'Restarting...';
  }
  saveServers(servers);

  let rcon;
  try {
    rcon = await Rcon.connect({
      host: 'localhost',
      port: 25575,
      password: server.rconPassword,
    });

    const response = await rcon.send(command);
    console.log(`RCON response: ${response}`);

    // Update server status based on the command
    if (command === 'stop') {
      setTimeout(() => {
        server.status = 'Offline';
        saveServers(servers);
      }, 10000); // Delay for 10 seconds before setting to Offline
    }

    saveServers(servers);
    if (res) res.json({ message: `Command ${command} executed successfully`, output: response });

    if (callback) {
      callback();
    }
  } catch (error) {
    console.error(`Error sending RCON command:`, error);
    server.status = 'Offline';
    saveServers(servers);
    if (res) res.status(500).send(`Error sending RCON command: ${error.message}`);
    if (callback) {
      callback(error);
    }
  } finally {
    if (rcon) {
      await rcon.end();
    }
  }
};

/**
 * Read properties from a file.
 * @param {string} filePath - Path to the properties file.
 * @returns {Object} Parsed properties.
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
 * Write properties to a file.
 * @param {string} filePath - Path to the properties file.
 * @param {Object} properties - Properties to write.
 */
const writePropertiesFile = (filePath, properties) => {
  const lines = [];
  Object.entries(properties).forEach(([key, value]) => {
    lines.push(`${key}=${value}`);
  });
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
};

module.exports = {
  runPowerShellScript,
  sendRconCommand,
  readPropertiesFile,
  writePropertiesFile,
  getPlayersList,
};
