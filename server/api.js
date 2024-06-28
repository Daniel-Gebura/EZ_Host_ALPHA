const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execFile } = require('child_process');

// Path to the servers.json file
const DATA_FILE = path.join(__dirname, 'servers.json');
// Port on which the API server will run
const PORT = 5000;

// Paths to the script templates
const START_SCRIPT_TEMPLATE = path.join(__dirname, 'template_scripts/simple-start-template.ps1');
const INIT_SCRIPT_TEMPLATE = path.join(__dirname, 'template_scripts/initServer-template.ps1');
const INIT_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/initServer.bat.template');
const START_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/start.bat.template');
const SAVE_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/save.bat.template');
const RESTART_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/restart.bat.template');
const STOP_BAT_TEMPLATE = path.join(__dirname, 'template_scripts/stop.bat.template');

// Path to mcrcon.exe
const MCRCON_PATH = path.join(__dirname, '..', 'resources', 'mcrcon', 'mcrcon.exe');

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

    // Copy the initServer-template.ps1 script to the server root directory
    const initScriptContent = fs.readFileSync(INIT_SCRIPT_TEMPLATE, 'utf8');
    fs.writeFileSync(path.join(directory, 'initServer.ps1'), initScriptContent);
    fs.chmodSync(path.join(directory, 'initServer.ps1'), '755'); // Make script executable

    // Copy the start-template.ps1 script to the server root directory
    const startScriptContent = fs.readFileSync(START_SCRIPT_TEMPLATE, 'utf8');
    fs.writeFileSync(path.join(directory, 'start.ps1'), startScriptContent);
    fs.chmodSync(path.join(directory, 'start.ps1'), '755'); // Make script executable

    // Create corresponding .bat files from templates directly in the server root directory
    const batFiles = {
      'initServer.bat': INIT_BAT_TEMPLATE,
      'start.bat': START_BAT_TEMPLATE,
      'save.bat': SAVE_BAT_TEMPLATE,
      'restart.bat': RESTART_BAT_TEMPLATE,
      'stop.bat': STOP_BAT_TEMPLATE,
    };

    for (const [batName, batTemplate] of Object.entries(batFiles)) {
      let batContent = fs.readFileSync(batTemplate, 'utf8');
      if (batName !== 'start.bat' && batName !== 'initServer.bat') {
        // Replace placeholder with the environment variable for mcrcon path
        batContent = batContent.replace('%MCRCON_PATH%', '%MCRCON_PATH%');
      }
      fs.writeFileSync(path.join(directory, batName), batContent);
      fs.chmodSync(path.join(directory, batName), '755'); // Make script executable
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
    // List of files to be removed
    const filesToRemove = [
      'initServer.ps1', 
      'start.ps1', 
      'start.bat', 
      'save.bat', 
      'restart.bat', 
      'stop.bat', 
      'initServer.bat',
      'launcher_jar.txt',
      'server_run_command.txt'
    ];

    // Remove each file if it exists
    filesToRemove.forEach(file => {
      const filePath = path.join(server.directory, file);
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
      }
    });
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
    const scriptPath = path.join(server.directory, scriptName);

    // Log the script path and arguments
    console.log(`Running script: ${scriptPath}`);
    if (scriptName !== 'start.bat' && scriptName !== 'initServer.bat') {
      console.log(`Setting MCRCON_PATH: ${MCRCON_PATH}`);
    }

    // Update server status to "Starting..." if starting the server
    if (scriptName === 'start.bat') {
      server.status = 'Starting...';
      saveServers(servers);
    }

    const options = { shell: true };
    if (scriptName !== 'start.bat' && scriptName !== 'initServer.bat') {
      options.env = { ...process.env, MCRCON_PATH };
    }

    const child = execFile(scriptPath, [], options, (error, stdout, stderr) => {
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
   * Endpoint to initialize a server
   */
  app.post('/api/servers/:id/initServer', (req, res) => {
    runBatchScript(req.params.id, 'initServer.bat', res);
  });

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
