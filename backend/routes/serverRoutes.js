const express = require('express');
const path = require('path');
const fs = require('fs');
const { runPowerShellScript, sendRconCommand, getPlayersList } = require('../utils/apiUtilFunctions');
const { readPropertiesFile, writePropertiesFile, loadServers, saveServers } = require('../utils/fileUtilFunctions');
const { getIpAddress } = require('../utils/networkUtilFunctions');
const { fileExists } = require('../utils/validateUtilFunctions');
const { Rcon } = require('rcon-client');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../myServers.json');

// Initial server load
let servers = loadServers(DATA_FILE);

/**
 * Endpoint to get the current IPv4 address
 */
router.get('/ip-address', (req, res) => {
  const ipAddress = getIpAddress();
  if (ipAddress) {
    res.status(200).json({
      status: 'success',
      message: 'IPv4 address retrieved successfully.',
      data: ipAddress,
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'IPv4 address not found.',
      error: 'The internal local IPv4 address could not be found',
    });
  }
});

/**
 * Endpoint to get the list of servers
 */
router.get('/', (req, res) => {
  if (Array.isArray(servers)) {
    res.status(200).json({
      status: 'success',
      message: 'Servers retrieved successfully.',
      data: servers,
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Server list is not an array',
      error: 'myServers,json must be a single array',
    });
  }
});

/**
 * Endpoint to create a new server
 */
router.post('/', (req, res) => {
  const { name, type, directory, icon, rconPassword } = req.body;
  const id = Date.now().toString();
  const newServer = { id, name, type, directory, icon, rconPassword, status: 'Offline' };
  const ezHostDirectory = path.join(directory, 'EZHost');

  // Step 0: Check for duplicate directory and RCON password
  const directoryInUse = servers.some(server => server.directory === directory);
  const rconPasswordInUse = servers.some(server => server.rconPassword === rconPassword);

  if (directoryInUse || rconPasswordInUse) {
    const errors = [];
    if (directoryInUse) errors.push('The specified directory is already associated with an existing server.');
    if (rconPasswordInUse) errors.push('The specified RCON password is already in use by another server.');

    return res.status(400).json({
      status: 'error',
      message: errors.join(' '),
      error: 'Duplicate server configurations detected.',
    });
  }

  // Step 1: Create EZHost Directory
  try {
    if (!fs.existsSync(ezHostDirectory)) {
      fs.mkdirSync(ezHostDirectory);
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create EZHost directory.',
      error: error.message,
    });
  }

  // Step 2: Write Start Script
  try {
    const START_SCRIPT_TEMPLATE = path.join(__dirname, '../template_scripts/simpleStartTemplate.ps1');
    fs.writeFileSync(path.join(ezHostDirectory, 'start.ps1'), fs.readFileSync(START_SCRIPT_TEMPLATE, 'utf8'));
    fs.chmodSync(path.join(ezHostDirectory, 'start.ps1'), '755');
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create start.ps1 script.',
      error: error.message,
    });
  }

  // Step 3: Write Init Script
  try {
    const INIT_SCRIPT_TEMPLATE = path.join(__dirname, '../template_scripts/initServerTemplate.ps1');
    fs.writeFileSync(path.join(ezHostDirectory, 'initServer.ps1'), fs.readFileSync(INIT_SCRIPT_TEMPLATE, 'utf8'));
    fs.chmodSync(path.join(ezHostDirectory, 'initServer.ps1'), '755');
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create initServer.ps1 script.',
      error: error.message,
    });
  }

  // Step 4: Modify server.properties File
  try {
    const serverPropertiesPath = path.join(directory, 'server.properties');
    let serverPropertiesContent = fs.existsSync(serverPropertiesPath) ? fs.readFileSync(serverPropertiesPath, 'utf8') : '';

    serverPropertiesContent = serverPropertiesContent.replace(/^enable-rcon=.*$/m, 'enable-rcon=true')
                                                      .replace(/^rcon.port=.*$/m, 'rcon.port=25575')
                                                      .replace(/^rcon.password=.*$/m, `rcon.password=${rconPassword}`);

    fs.writeFileSync(serverPropertiesPath, serverPropertiesContent);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to modify server.properties file.',
      error: error.message,
    });
  }

  // SUCCESSS
  servers.push(newServer);
  saveServers(servers, DATA_FILE);

  res.status(201).json({
    status: 'success',
    message: 'Server created successfully.',
    data: newServer,
  });
});

/**
 * Endpoint to get a server by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const server = servers.find((s) => s.id === id);

  if (server) {
    res.status(200).json({
      status: 'success',
      message: 'Server retrieved successfully.',
      data: server,
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Server not found.',
      error: 'The specified server ID does not exist.',
    });
  }
});

/**
 * Endpoint to update a server by ID
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, directory, icon } = req.body;
  const serverIndex = servers.findIndex(s => s.id === id);
  if (serverIndex !== -1) {
    servers[serverIndex] = { ...servers[serverIndex], name, type, directory, icon };
    saveServers(servers, DATA_FILE);
    res.status(200).json({
      status: 'success',
      message: 'Server updated successfully.',
      data: servers[serverIndex],
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Server not found.',
      error: 'The specified server ID does not exist.',
    });
  }
});

/**
 * Endpoint to delete a server by ID
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (server) {
    const ezHostDirectory = path.join(server.directory, 'EZHost');
    if (fs.existsSync(ezHostDirectory)) {
      fs.rmSync(ezHostDirectory, { recursive: true, force: true });
    }
  }

  servers = servers.filter(server => server.id !== id);
  saveServers(servers, DATA_FILE);
  res.status(200).json({
    status: 'success',
    message: 'Server deleted successfully.',
  });
});

/**
 * Endpoint to check the status of all servers
 */
router.post('/check-status', async (req, res) => {
  try {
    // Concurrently check the status of all servers listed in myServers.json
    const updatedServers = await Promise.all(servers.map(async (server) => {
      try {
        // Check server status by attempting to connnect to its corresponding rcon client
        const rcon = await Rcon.connect({ host: 'localhost', port: 25575, password: server.rconPassword });
        const response = await rcon.send('list');
        await rcon.end();
        server.status = response.includes('players online') ? 'Online' : 'Offline';
      } catch (err) {
        console.error(`Error checking server ${server.id}:`, err);
        server.status = 'Offline';
      }
      // Add this updated server status to the list
      return server;
    }));

    // Save the updated server statuses
    saveServers(updatedServers, DATA_FILE);

    // Return a formatted hhttp code and message
    res.status(200).json({
      status: 'success',
      message: 'Server statuses updated successfully',
      data: updatedServers,
    });
  } catch (error) {
    console.error('Error updating server statuses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update server statuses.',
      error: error.message,
    });
  }
});

/**
 * Endpoint to initialize a server
 */
router.post('/:id/initServer', (req, res) => {
  // Use util function to handle running PowerShell scripts
  const response = runPowerShellScript(req.params.id, 'initServer.ps1', res, servers, DATA_FILE);

  // Pass up the HTTP response from the util function
  return response
});

/**
 * Endpoint to start a server
 */
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const server = servers.find(s => s.id === id);

    // Check if the server exists
    if (!server) {
      return res.status(404).json({
        status: 'error',
        message: 'Server not found',
        error: 'The specified server ID does not exist in the system.',
      });
    }

    // Check if the necessary file exists
    const fileExistsResult = await fileExists(server.directory, 'variables.txt');
    if (!fileExistsResult) {
      console.error('variables.txt file is missing. Cannot start server.');
      return res.status(404).json({
        status: 'error',
        message: 'variables.txt file is missing. Cannot start server.',
        error: 'Required configuration file variables.txt is missing.',
      });
    }

    // Run PowerShell script to start the server
    runPowerShellScript(id, 'start.ps1', res, servers, DATA_FILE);
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: `Failed to start server: ${error.message}`,
    });
  }
});


/**
 * Endpoint to save a server
 */
router.post('/:id/save', (req, res) => {
  sendRconCommand(req.params.id, 'save-all', res, servers, DATA_FILE);
});

/**
 * Endpoint to stop a server
 */
router.post('/:id/stop', (req, res) => {
  sendRconCommand(req.params.id, 'stop', res, servers, DATA_FILE);
});

/**
 * Endpoint to get server properties by ID
 */
router.get('/:id/properties', (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).json({
      status: 'error',
      message: 'Server not found.',
      error: 'The specified server ID does not exist.',
    });
  }

  const serverPropertiesPath = path.join(server.directory, 'server.properties');
  if (!fs.existsSync(serverPropertiesPath)) {
    return res.status(404).json({
      status: 'error',
      message: 'server.properties not found.',
      error: 'The server.properties file does not exist in the specified directory',
    });
  }

  const properties = readPropertiesFile(serverPropertiesPath);
  res.status(200).json({
    status: 'success',
    message: 'Server properties retrieved successfully.',
    data: properties,
  });
});

/**
 * Endpoint to update server properties by ID
 */
router.put('/:id/properties', (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).json({
      status: 'error',
      message: 'Server not found.',
      error: 'The specified server ID does not exist.',
    });
  }

  const serverPropertiesPath = path.join(server.directory, 'server.properties');
  const newProperties = req.body;

  let serverProperties = {};
  if (fs.existsSync(serverPropertiesPath)) {
    serverProperties = readPropertiesFile(serverPropertiesPath);
  }

  const updatedProperties = { ...serverProperties, ...newProperties };

  writePropertiesFile(serverPropertiesPath, updatedProperties);

  res.status(200).json({
    status: 'success',
    message: 'Server properties updated.',
  });
});

/**
 * Endpoint to get RAM allocation for a server
 */
router.get('/:id/ram', (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const variablesFilePath = path.join(server.directory, 'variables.txt');
  if (!fs.existsSync(variablesFilePath)) {
    return res.status(404).send('variables.txt not found');
  }

  const variablesContent = fs.readFileSync(variablesFilePath, 'utf8');
  const ramMatch = variablesContent.match(/-Xmx(\d+)G/);
  const ram = ramMatch ? parseInt(ramMatch[1], 10) : 4;

  res.json({ ram });
});

/**
 * Endpoint to update RAM allocation for a server
 */
router.put('/:id/ram', (req, res) => {
  const { id } = req.params;
  const { ram } = req.body;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const variablesFilePath = path.join(server.directory, 'variables.txt');
  if (!fs.existsSync(variablesFilePath)) {
    return res.status(404).send('variables.txt not found');
  }

  let variablesContent = fs.readFileSync(variablesFilePath, 'utf8');
  variablesContent = variablesContent.replace(/-Xmx\d+G/, `-Xmx${ram}G`);

  fs.writeFileSync(variablesFilePath, variablesContent, 'utf8');
  res.status(200).send('RAM allocation updated');
});

/**
 * Endpoint to send an RCON command to the server
 */
router.post('/:id/rcon', async (req, res) => {
    const { id } = req.params;
    const { command } = req.body;
    await sendRconCommand(id, command, res);
  });

/**
 * Endpoint to get the list of players
 */
router.get('/:id/players', async (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const players = await getPlayersList(server.rconPassword);
  res.json(players);
});

/**
 * Endpoint to OP/Un-OP a player
 */
router.post('/:id/player/:playerName/op', async (req, res) => {
  const { id, playerName } = req.params;
  const { op } = req.body;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const command = op ? `op ${playerName}` : `deop ${playerName}`;
  try {
    const rcon = await Rcon.connect({ host: 'localhost', port: 25575, password: server.rconPassword });
    const response = await rcon.send(command);
    await rcon.end();

    res.json({ message: `Player ${op ? 'OPed' : 'un-OPed'} successfully`, response });
  } catch (error) {
    console.error(`Error executing ${command}:`, error);
    res.status(500).send(`Error executing ${command}: ${error.message}`);
  }
});

module.exports = router;
