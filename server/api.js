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
    const { name, type, directory, icon } = req.body;
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
   * Endpoint to check the status of all servers
   */
  app.post('/api/servers/check-status', async (req, res) => {
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
   * Helper function to send an RCON command to the server
   * @param {string} serverId - The ID of the server
   * @param {string} command - The RCON command to send
   * @param {Object} res - The response object
   * @param {Function} callback - Optional callback function to run after the command is sent
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

    try {
      const rcon = await Rcon.connect({
        host: 'localhost',
        port: 25575,
        password: server.rconPassword,
      });

      const response = await rcon.send(command);
      await rcon.end();
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
    const serverId = req.params.id;
  
    const handleStopAndStart = async () => {
      // Run the start.ps1 PowerShell script to start the server
      runPowerShellScript(serverId, 'start.ps1', res);
    };
  
    // First, save the server, then stop it, and finally start it again
    await sendRconCommand(serverId, 'save-all', res, () => {
      sendRconCommand(serverId, 'stop', res, handleStopAndStart);
    });
  });
  

  /**
   * Endpoint to stop a server
   */
  app.post('/api/servers/:id/stop', (req, res) => {
    sendRconCommand(req.params.id, 'stop', res);
  });

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
   * Endpoint to get server properties by ID
   */
  app.get('/api/servers/:id/properties', (req, res) => {
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
  app.put('/api/servers/:id/properties', (req, res) => {
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
   * Endpoint to update RAM allocation for a server
   */
  app.put('/api/servers/:id/ram', (req, res) => {
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
    const ramRegex = /-Xmx\d+G/;
    variablesContent = variablesContent.replace(ramRegex, `-Xmx${ram}G`);

    fs.writeFileSync(variablesFilePath, variablesContent, 'utf8');
    res.status(200).send('RAM allocation updated');
  });

  /**
   * Endpoint to send an RCON command to the server
   */
  app.post('/api/servers/:id/rcon', async (req, res) => {
    const { id } = req.params;
    const { command } = req.body;
    await sendRconCommand(id, command, res);
  });

  // Start the API server
  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
  });
};

module.exports = { startApiServer };