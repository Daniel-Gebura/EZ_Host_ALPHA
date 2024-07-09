/**
 * serverRoutes.js
 *
 * Defines routes for server management operations such as creating, updating, deleting servers, and managing server properties.
 *
 * @file serverRoutes.js
 * @description Routes for server management operations
 * @version 1.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { runPowerShellScript } = require('../utils/serverUtils');
const { loadServers, saveServers } = require('../utils/fileUtils');

const router = express.Router();
let servers = loadServers();

const START_SCRIPT_TEMPLATE = path.join(__dirname, '../template_scripts/simple-start-template.ps1');
const INIT_SCRIPT_TEMPLATE = path.join(__dirname, '../template_scripts/initServer-template.ps1');

// Endpoint to get all servers
router.get('/', (req, res) => {
  res.json(servers);
});

// Endpoint to create a new server
router.post('/', async (req, res) => {
  const { name, directory, rconPassword } = req.body;
  const id = Date.now().toString();
  const newServer = { id, name, directory, rconPassword, status: 'Offline' };

  servers.push(newServer);
  saveServers(servers);

  // Create EZHost directory if it doesn't exist
  const ezHostDirectory = path.join(directory, 'EZHost');
  if (!fs.existsSync(ezHostDirectory)) {
    fs.mkdirSync(ezHostDirectory);
  }

  // Copy the initServer-template.ps1 script to the EZHost directory
  const initScriptContent = fs.readFileSync(INIT_SCRIPT_TEMPLATE, 'utf8');
  fs.writeFileSync(path.join(ezHostDirectory, 'initServer.ps1'), initScriptContent);
  fs.chmodSync(path.join(ezHostDirectory, 'initServer.ps1'), '755'); // Make script executable

  // Copy the start-template.ps1 script to the EZHost directory
  const startScriptContent = fs.readFileSync(START_SCRIPT_TEMPLATE, 'utf8');
  fs.writeFileSync(path.join(ezHostDirectory, 'start.ps1'), startScriptContent);
  fs.chmodSync(path.join(ezHostDirectory, 'start.ps1'), '755'); // Make script executable

  // Update server.properties with the RCON settings
  const serverPropertiesPath = path.join(directory, 'server.properties');
  let serverPropertiesContent = '';
  if (fs.existsSync(serverPropertiesPath)) {
    serverPropertiesContent = fs.readFileSync(serverPropertiesPath, 'utf8');
    serverPropertiesContent = serverPropertiesContent.replace(/^enable-rcon=.*$/m, 'enable-rcon=true');
    serverPropertiesContent = serverPropertiesContent.replace(/^rcon.port=.*$/m, 'rcon.port=25575');
    serverPropertiesContent = serverPropertiesContent.replace(/^rcon.password=.*$/m, `rcon.password=${rconPassword}`);
  } else {
    serverPropertiesContent = `enable-rcon=true\nrcon.port=25575\nrcon.password=${rconPassword}\n`;
  }
  fs.writeFileSync(serverPropertiesPath, serverPropertiesContent);

  res.status(201).json(newServer);
});

// Endpoint to get a server by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }
  res.json(server);
});

// Endpoint to update a server by ID
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, directory, rconPassword } = req.body;
  const serverIndex = servers.findIndex(s => s.id === id);
  if (serverIndex === -1) {
    return res.status(404).send('Server not found');
  }

  servers[serverIndex] = { ...servers[serverIndex], name, directory, rconPassword };
  saveServers(servers);
  res.json(servers[serverIndex]);
});

// Endpoint to delete a server by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  // Remove the EZHost directory and all its contents
  const ezHostDirectory = path.join(server.directory, 'EZHost');
  if (fs.existsSync(ezHostDirectory)) {
    fs.rmSync(ezHostDirectory, { recursive: true, force: true });
  }

  servers = servers.filter(server => server.id !== id);
  saveServers(servers);
  res.status(204).send();
});

// Endpoint to check the status of all servers
router.post('/check-status', async (req, res) => {
  const updatedServers = await Promise.all(servers.map(async server => {
    try {
      const rcon = await Rcon.connect({
        host: 'localhost',
        port: 25575,
        password: server.rconPassword,
      });

      const response = await rcon.send('list');
      await rcon.end();

      if (response.includes('players online')) {
        server.status = 'Online';
      } else {
        server.status = 'Offline';
      }
    } catch (error) {
      console.error(`Error checking status for server ${server.name}:`, error);
      server.status = 'Offline';
    }

    return server;
  }));

  saveServers(updatedServers);
  res.json({ message: 'Server statuses updated successfully', servers: updatedServers });
});

module.exports = router;
