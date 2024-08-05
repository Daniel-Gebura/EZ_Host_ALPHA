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

  servers.push(newServer);
  saveServers(servers, DATA_FILE);

  const ezHostDirectory = path.join(directory, 'EZHost');
  if (!fs.existsSync(ezHostDirectory)) {
    fs.mkdirSync(ezHostDirectory);
  }

  const INIT_SCRIPT_TEMPLATE = path.join(__dirname, '../template_scripts/initServerTemplate.ps1');
  const START_SCRIPT_TEMPLATE = path.join(__dirname, '../template_scripts/simpleStartTemplate.ps1');

  fs.writeFileSync(path.join(ezHostDirectory, 'initServer.ps1'), fs.readFileSync(INIT_SCRIPT_TEMPLATE, 'utf8'));
  fs.chmodSync(path.join(ezHostDirectory, 'initServer.ps1'), '755');

  fs.writeFileSync(path.join(ezHostDirectory, 'start.ps1'), fs.readFileSync(START_SCRIPT_TEMPLATE, 'utf8'));
  fs.chmodSync(path.join(ezHostDirectory, 'start.ps1'), '755');

  const serverPropertiesPath = path.join(directory, 'server.properties');
  let serverPropertiesContent = fs.existsSync(serverPropertiesPath) ? fs.readFileSync(serverPropertiesPath, 'utf8') : '';
  serverPropertiesContent = serverPropertiesContent.replace(/^enable-rcon=.*$/m, 'enable-rcon=true')
                                                    .replace(/^rcon.port=.*$/m, 'rcon.port=25575')
                                                    .replace(/^rcon.password=.*$/m, `rcon.password=${rconPassword}`);
  fs.writeFileSync(serverPropertiesPath, serverPropertiesContent);

  res.status(201).send(newServer);
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
  res.status(204).send();
});

/**
 * Endpoint to check the status of all servers
 */
router.post('/check-status', async (req, res) => {
  const updatedServers = await Promise.all(servers.map(async server => {
    try {
      const rcon = await Rcon.connect({ host: 'localhost', port: 25575, password: server.rconPassword });
      const response = await rcon.send('list');
      await rcon.end();

      server.status = response.includes('players online') ? 'Online' : 'Offline';
    } catch (error) {
      console.error(`Error checking status for server ${server.name}:`, error);
      server.status = 'Offline';
    }

    return server;
  }));

  saveServers(updatedServers, DATA_FILE);
  res.json({ message: 'Server statuses updated successfully', servers: updatedServers });
});

/**
 * Endpoint to initialize a server
 */
router.post('/:id/initServer', (req, res) => {
  runPowerShellScript(req.params.id, 'initServer.ps1', res, servers, DATA_FILE);
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
    return res.status(404).send('Server not found');
  }

  const serverPropertiesPath = path.join(server.directory, 'server.properties');
  if (!fs.existsSync(serverPropertiesPath)) {
    return res.status(404).send('server.properties not found');
  }

  const properties = readPropertiesFile(serverPropertiesPath);
  res.json(properties);
});

/**
 * Endpoint to update server properties by ID
 */
router.put('/:id/properties', (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const serverPropertiesPath = path.join(server.directory, 'server.properties');
  const newProperties = req.body;

  let serverProperties = {};
  if (fs.existsSync(serverPropertiesPath)) {
    serverProperties = readPropertiesFile(serverPropertiesPath);
  }

  const updatedProperties = { ...serverProperties, ...newProperties };

  writePropertiesFile(serverPropertiesPath, updatedProperties);

  res.status(200).send('Properties updated');
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
