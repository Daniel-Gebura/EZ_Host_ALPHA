const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

// Path to the servers.json file
const DATA_FILE = path.join(__dirname, 'servers.json');
// Port on which the API server will run
const PORT = 5000;

// Paths to the script templates
const START_SCRIPT_TEMPLATE = path.join(__dirname, 'template_scripts/start-template.ps1');
const START_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/start.bat.template');
const SAVE_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/save.bat.template');
const RESTART_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/restart.bat.template');
const STOP_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/stop.bat.template');

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

    // Copy the start-template.ps1 script to the server root directory
    const startScriptContent = fs.readFileSync(START_SCRIPT_TEMPLATE, 'utf8');
    fs.writeFileSync(path.join(directory, 'start.ps1'), startScriptContent);
    fs.chmodSync(path.join(directory, 'start.ps1'), '755'); // Make script executable

    // Create EZScripts directory
    const ezScriptsDir = path.join(directory, 'EZScripts');
    if (!fs.existsSync(ezScriptsDir)) {
      fs.mkdirSync(ezScriptsDir);
    }

    // Create corresponding .bat files from templates
    const batFiles = {
      'start.bat': START_BAT_TEMPLATE,
      'save.bat': SAVE_BAT_TEMPLATE,
      'restart.bat': RESTART_BAT_TEMPLATE,
      'stop.bat': STOP_BAT_TEMPLATE,
    };

    for (const [batName, batTemplate] of Object.entries(batFiles)) {
      const batContent = fs.readFileSync(batTemplate, 'utf8');
      fs.writeFileSync(path.join(ezScriptsDir, batName), batContent);
      fs.chmodSync(path.join(ezScriptsDir, batName), '755'); // Make script executable
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
      // Remove script files
      const scriptFiles = ['start.ps1', 'EZScripts/start.bat', 'EZScripts/save.bat', 'EZScripts/restart.bat', 'EZScripts/stop.bat'];
      scriptFiles.forEach(script => {
        const scriptPath = path.join(server.directory, script);
        if (fs.existsSync(scriptPath)) {
          fs.rmSync(scriptPath, { force: true });
        }
      });

      // Remove EZScripts directory
      const ezScriptsDir = path.join(server.directory, 'EZScripts');
      if (fs.existsSync(ezScriptsDir)) {
        fs.rmSync(ezScriptsDir, { recursive: true, force: true });
      }
    }

    servers = servers.filter(server => server.id !== id);
    saveServers(servers);
    res.status(204).send();
  });

  /**
   * Helper function to run a batch script for a server
   * @param {string} serverId - The ID of the server
   * @param {string} scriptName - The name of the batch script to run
   * @param {Object} res - The response object
   */
  const runBatchScript = (serverId, scriptName, res) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) {
      return res.status(404).send('Server not found');
    }
    const scriptPath = path.join(server.directory, 'EZScripts', scriptName);

    // Update server status to "Starting..." if starting the server
    if (scriptName === 'start.bat') {
      server.status = 'Starting...';
      saveServers(servers);
    }

    const command = `"${scriptPath}"`;

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
   * Endpoint to start a server
   */
  app.post('/api/servers/:id/start', (req, res) => {
    runBatchScript(req.params.id, 'start.bat', res);
  });

  /**
   * Endpoint to save a server
   */
  app.post('/api/servers/:id/save', (req, res) => {
    runBatchScript(req.params.id, 'save.bat', res);
  });

  /**
   * Endpoint to restart a server
   */
  app.post('/api/servers/:id/restart', (req, res) => {
    runBatchScript(req.params.id, 'restart.bat', res);
  });

  /**
   * Endpoint to stop a server
   */
  app.post('/api/servers/:id/stop', (req, res) => {
    runBatchScript(req.params.id, 'stop.bat', res);
  });

  // Start the API server
  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
  });
};

module.exports = { startApiServer };
