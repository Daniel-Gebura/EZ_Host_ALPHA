/**
 * api.js
 * 
 * API server for managing Minecraft servers (Forge/Fabric).
 * Provides endpoints for creating, starting, saving, restarting, and stopping servers.
 * 
 * @file api.js
 * @description Backend API for Minecraft server management
 * @version 1.0
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

// Path to the servers.json file
const DATA_FILE = path.join(__dirname, 'servers.json');
// Port on which the API server will run
const PORT = 5000;

/**
 * Starts the API server
 */
const startApiServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Load existing servers from file
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

  // Save servers to file
  const saveServers = (servers) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(servers, null, 2));
  };

  // Initial server load
  let servers = loadServers();

  /**
   * Endpoint to get the list of servers
   */
  app.get('/api/servers', (req, res) => {
    res.send(servers);
  });

  /**
   * Endpoint to create a new server
   */
  app.post('/api/servers', (req, res) => {
    const { name, type, directory, icon } = req.body;
    const id = Date.now().toString();
    const newServer = { id, name, type, directory, icon };

    servers.push(newServer);
    saveServers(servers);
    res.status(201).send(newServer);
  });

  /**
   * Endpoint to get a server by ID
   */
  app.get('/api/servers/:id', (req, res) => {
    const { id } = req.params;
    const server = servers.find(s => s.id === id);
    if (server) {
      res.send(server);
    } else {
      res.status(404).send('Server not found');
    }
  });

  /**
   * Endpoint to update a server by ID
   */
  app.put('/api/servers/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, directory, icon } = req.body; // Include icon in destructuring
    const serverIndex = servers.findIndex(s => s.id === id);
    if (serverIndex !== -1) {
      servers[serverIndex] = { id, name, type, directory, icon };
      saveServers(servers);
      res.send(servers[serverIndex]);
    } else {
      res.status(404).send('Server not found');
    }
  });

  /**
   * Endpoint to delete a server by ID
   */
  app.delete('/api/servers/:id', (req, res) => {
    const { id } = req.params;
    servers = servers.filter(server => server.id !== id);
    saveServers(servers);
    res.status(204).send();
  });

  /**
   * Helper function to run a script for a server
   * @param {string} serverId - The ID of the server
   * @param {string} scriptName - The name of the script to run
   * @param {Object} res - The response object
   */
  const runScript = (serverId, scriptName, res) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) {
      return res.status(404).send('Server not found');
    }
    const scriptPath = path.join(server.directory, scriptName);

    exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${scriptName}:`, error);
        return res.status(500).send(`Error executing ${scriptName}`);
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
      }
      res.send(`Script ${scriptName} executed successfully: ${stdout}`);
    });
  };

  /**
   * Endpoint to start a server
   */
  app.post('/api/servers/:id/start', (req, res) => {
    runScript(req.params.id, 'start.sh', res);
  });

  /**
   * Endpoint to save a server
   */
  app.post('/api/servers/:id/save', (req, res) => {
    runScript(req.params.id, 'save.sh', res);
  });

  /**
   * Endpoint to restart a server
   */
  app.post('/api/servers/:id/restart', (req, res) => {
    runScript(req.params.id, 'restart.sh', res);
  });

  /**
   * Endpoint to stop a server
   */
  app.post('/api/servers/:id/stop', (req, res) => {
    runScript(req.params.id, 'stop.sh', res);
  });

  // Start the API server
  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
  });
};

module.exports = { startApiServer };
