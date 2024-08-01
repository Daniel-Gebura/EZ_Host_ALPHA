const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Rcon } = require('rcon-client');
const { saveServers } = require('./fileUtilFunctions');

/**
 * Helper function to run a PowerShell script for a server
 * @param {string} serverId - The ID of the server
 * @param {string} scriptName - The name of the PowerShell script to run
 * @param {Object} res - The response object
 * @param {Array} servers - The servers array
 * @param {string} dataFilePath - Path to the servers.json file
 */
const runPowerShellScript = (serverId, scriptName, res, servers, dataFilePath) => {
  const server = servers.find(s => s.id === serverId);
  if (!server) {
    return res.status(404).send('Server not found');
  }
  const scriptPath = path.join(server.directory, 'EZHost', scriptName);

  if (scriptName === 'start.ps1') {
    server.status = 'Starting...';
    saveServers(servers, dataFilePath);
  }

  const options = { shell: true };
  const timeout = setTimeout(() => {
    console.error(`Timeout executing ${scriptName}`);
    server.status = 'Offline';
    saveServers(servers, dataFilePath);
    res.status(500).send(`Timeout executing ${scriptName}`);
  }, 300000); // 5 minutes

  console.log(`Executing script: ${scriptPath}`); // Debug log

  const child = execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath], options, (error, stdout, stderr) => {
    clearTimeout(timeout); // Clear the timeout if the script finishes
    console.log(`Clearing Timeout for: ${scriptPath}`); // Debug log
    if (error) {
      console.error(`Error executing ${scriptName}:`, error);
      server.status = 'Offline';
      saveServers(servers, dataFilePath);
      return res.status(500).send(`Error executing ${scriptName}: ${error.message}`);
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }
    console.log(`Script stdout: ${stdout}`);
    res.json({ message: `Script ${scriptName} executed successfully`, output: stdout });
  });

  child.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
    if (data.includes('Done') && data.includes('For help, type "help"')) {
      clearTimeout(timeout); // Clear the timeout if server starts successfully
      console.log(`Clearing Timeout for: ${scriptPath}`); // Debug log
      server.status = 'Online';
      saveServers(servers, dataFilePath);
    }
  });

  child.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
  });
};

/**
 * Helper function to send an RCON command to the server
 * @param {string} serverId - The ID of the server
 * @param {string} command - The RCON command to send
 * @param {Object} res - The response object
 * @param {Array} servers - The servers array
 * @param {string} dataFilePath - Path to the servers.json file
 * @param {Function} callback - Optional callback function to run after the command is sent
 */
const sendRconCommand = async (serverId, command, res, servers, dataFilePath, callback) => {
  const server = servers.find(s => s.id === serverId);
  if (!server) {
    if (res) res.status(404).send('Server not found');
    return;
  }

  if (server.status !== 'Online') {
    console.log('Start server before sending rcon command.');
    if (res) res.status(400).send('Server is not online.');
    return;
  }

  if (command === 'stop') {
    server.status = 'Stopping...';
  } else if (command === 'restart') {
    server.status = 'Restarting...';
  }
  saveServers(servers, dataFilePath);

  try {
    const rcon = await Rcon.connect({ host: 'localhost', port: 25575, password: server.rconPassword });
    const response = await rcon.send(command);
    await rcon.end();
    console.log(`RCON response: ${response}`);

    if (command === 'stop') {
      setTimeout(() => {
        server.status = 'Offline';
        saveServers(servers, dataFilePath);
      }, 10000); // Delay for 10 seconds
    }

    saveServers(servers, dataFilePath);
    if (res) res.json({ message: `Command ${command} executed successfully`, output: response });

    if (callback) {
      callback();
    }
  } catch (error) {
    console.error(`Error sending RCON command:`, error);
    server.status = 'Offline';
    saveServers(servers, dataFilePath);
    if (res) res.status(500).send(`Error sending RCON command: ${error.message}`);
    if (callback) {
      callback(error);
    }
  }
};

/**
 * Helper function to fetch the list of players
 * @param {string} rconPassword - The RCON password
 * @returns {Promise<Array<string>>} - The list of players
 */
const getPlayersList = async (rconPassword) => {
  try {
    const rcon = await Rcon.connect({ host: 'localhost', port: 25575, password: rconPassword });
    const response = await rcon.send('list');
    await rcon.end();

    const match = response.match(/There are \d+\/\d+ players online: (.+)/);
    const players = match ? match[1].split(', ') : [];

    return players;
  } catch (error) {
    console.error('Error fetching players list:', error);
    return [];
  }
};

module.exports = {
  runPowerShellScript,
  sendRconCommand,
  getPlayersList,
};
