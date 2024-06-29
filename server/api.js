const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execFile } = require('child_process');
const { Rcon } = require('rcon-client'); // RCON client for sending commands

// Path to the servers.json file
const DATA_FILE = path.join(__dirname, 'servers.json');
// Port on which the API server will run
const PORT = 5000;

// Paths to the script templates
const START_SCRIPT_TEMPLATE = path.join(__dirname, 'template_scripts/simple-start-template.ps1');
const INIT_SCRIPT_TEMPLATE = path.join(__dirname, 'template_scripts/initServer-template.ps1');

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
    const { name, type, directory, icon, rconPassword } = req.body;
    const id = Date.now().toString();
    const newServer = { id, name, type, directory, icon, rconPassword, status: 'Offline' };
  
    servers.push(newServer);
    saveServers(servers);
  
    // Create EZHost directory
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
      servers[serverIndex] = { ...servers[serverIndex], name, type, directory, icon };
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
    const server = servers.find(s => s.id === id);
    if (server) {
      // Remove the EZHost directory and all its contents
      const ezHostDirectory = path.join(server.directory, 'EZHost');
      if (fs.existsSync(ezHostDirectory)) {
        fs.rmSync(ezHostDirectory, { recursive: true, force: true });
      }
    }

    servers = servers.filter(server => server.id !== id);
    saveServers(servers);
    res.status(204).send();
  });

  /**
   * Helper function to run a PowerShell script for a server
   * @param {string} serverId - The ID of the server
   * @param {string} scriptName - The name of the PowerShell script to run
   * @param {Object} res - The response object
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

    const child = execFile('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath], options, (error, stdout, stderr) => {
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
        server.status = 'Online';
        saveServers(servers);
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
   */
  const sendRconCommand = async (serverId, command, res) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) {
      return res.status(404).send('Server not found');
    }

    try {
      const rcon = await Rcon.connect({
        host: 'localhost',
        port: 25575,
        password: server.rconPassword,
      });

      const response = await rcon.send(command);
      await rcon.end();
      console.log(`RCON response: ${response}`);
      res.json({ message: `Command ${command} executed successfully`, output: response });
    } catch (error) {
      console.error(`Error sending RCON command:`, error);
      res.status(500).send(`Error sending RCON command: ${error.message}`);
    }
  };

  /**
   * Endpoint to initialize a server
   */
  app.post('/api/servers/:id/initServer', (req, res) => {
    runPowerShellScript(req.params.id, 'initServer.ps1', res);
  });

  /**
   * Endpoint to start a server
   */
  app.post('/api/servers/:id/start', (req, res) => {
    runPowerShellScript(req.params.id, 'start.ps1', res);
  });

  /**
   * Endpoint to save a server
   */
  app.post('/api/servers/:id/save', (req, res) => {
    sendRconCommand(req.params.id, 'save-all', res);
  });

  /**
   * Endpoint to restart a server
   */
  app.post('/api/servers/:id/restart', async (req, res) => {
    await sendRconCommand(req.params.id, 'save-all', res); // Save the server
    await sendRconCommand(req.params.id, 'stop', res); // Stop the server
    runPowerShellScript(req.params.id, 'start.ps1', res); // Start the server again
  });

  /**
   * Endpoint to stop a server
   */
  app.post('/api/servers/:id/stop', (req, res) => {
    sendRconCommand(req.params.id, 'stop', res);
  });

  // Start the API server
  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
  });
};

module.exports = { startApiServer };
