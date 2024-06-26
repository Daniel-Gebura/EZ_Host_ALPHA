const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

// Path to the servers.json file
const DATA_FILE = path.join(__dirname, 'servers.json');
// Port on which the API server will run
const PORT = 5000;

// Path to the start script template
const START_SCRIPT_TEMPLATE = path.join(__dirname, 'template_scripts/start-template.ps1');

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
    const newServer = { id, name, type, directory, icon, status: 'Offline' };

    servers.push(newServer);
    saveServers(servers);

    // Create EZScripts folder and files
    const scriptDir = path.join(directory, 'EZScripts');
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir);
    }

    // Copy the start-template.ps1 script to the EZScripts directory
    const startScriptContent = fs.readFileSync(START_SCRIPT_TEMPLATE, 'utf8');
    fs.writeFileSync(path.join(scriptDir, 'start.ps1'), startScriptContent);
    fs.chmodSync(path.join(scriptDir, 'start.ps1'), '755'); // Make script executable

    const otherScripts = {
      'save.ps1': `Write-Host "Save server script\n"`,
      'restart.ps1': `Write-Host "Restart server script\n"`,
      'stop.ps1': `Write-Host "Stop server script\n"`,
    };

    for (const [scriptName, scriptContent] of Object.entries(otherScripts)) {
      fs.writeFileSync(path.join(scriptDir, scriptName), scriptContent);
      fs.chmodSync(path.join(scriptDir, scriptName), '755'); // Make script executable
    }

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
      // Remove EZScripts folder and contents
      const scriptDir = path.join(server.directory, 'EZScripts');
      if (fs.existsSync(scriptDir)) {
        fs.rmSync(scriptDir, { recursive: true, force: true });
      }
    }

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
    const scriptPath = path.join(server.directory, 'EZScripts', scriptName);

    // Update server status to "Starting..."
    server.status = 'Starting...';
    saveServers(servers);

    // Detect the platform and use the appropriate command
    const isWin = process.platform === 'win32';
    const command = isWin ? `powershell -ExecutionPolicy Bypass -File ${scriptPath}` : `sh ${scriptPath}`;

    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${scriptName}:`, error);
        server.status = 'Offline';
        saveServers(servers);
        return res.status(500).send(`Error executing ${scriptName}: ${error.message}`);
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
      }
      res.send(`Script ${scriptName} executed successfully: ${stdout}`);
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
   * Endpoint to start a server
   */
  app.post('/api/servers/:id/start', (req, res) => {
    runScript(req.params.id, 'start.ps1', res);
  });

  /**
   * Endpoint to save a server
   */
  app.post('/api/servers/:id/save', (req, res) => {
    runScript(req.params.id, 'save.ps1', res);
  });

  /**
   * Endpoint to restart a server
   */
  app.post('/api/servers/:id/restart', (req, res) => {
    runScript(req.params.id, 'restart.ps1', res);
  });

  /**
   * Endpoint to stop a server
   */
  app.post('/api/servers/:id/stop', (req, res) => {
    runScript(req.params.id, 'stop.ps1', res);
  });

  // Start the API server
  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
  });
};

module.exports = { startApiServer };
