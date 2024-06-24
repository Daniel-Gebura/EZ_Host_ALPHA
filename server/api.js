const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'servers.json');
const PORT = 5000;

const startApiServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/servers', (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
      if (err) {
        console.error('Error reading servers.json:', err);
        return res.status(500).send('Internal Server Error');
      }
      try {
        const servers = JSON.parse(data);
        res.send(servers);
      } catch (parseErr) {
        console.error('Error parsing servers.json:', parseErr);
        res.status(500).send('Internal Server Error');
      }
    });
  });

  app.post('/api/servers', (req, res) => {
    const newServer = req.body;
    fs.readFile(DATA_FILE, (err, data) => {
      if (err) {
        console.error('Error reading servers.json:', err);
        return res.status(500).send('Internal Server Error');
      }
      try {
        const servers = JSON.parse(data);
        servers.push(newServer);
        fs.writeFile(DATA_FILE, JSON.stringify(servers), (writeErr) => {
          if (writeErr) {
            console.error('Error writing to servers.json:', writeErr);
            return res.status(500).send('Internal Server Error');
          }
          res.status(201).send(newServer);
        });
      } catch (parseErr) {
        console.error('Error parsing servers.json:', parseErr);
        res.status(500).send('Internal Server Error');
      }
    });
  });

  app.delete('/api/servers/:id', (req, res) => {
    const { id } = req.params;
    fs.readFile(DATA_FILE, (err, data) => {
      if (err) {
        console.error('Error reading servers.json:', err);
        return res.status(500).send('Internal Server Error');
      }
      try {
        let servers = JSON.parse(data);
        servers = servers.filter(server => server.id !== id);
        fs.writeFile(DATA_FILE, JSON.stringify(servers), (writeErr) => {
          if (writeErr) {
            console.error('Error writing to servers.json:', writeErr);
            return res.status(500).send('Internal Server Error');
          }
          res.status(204).send();
        });
      } catch (parseErr) {
        console.error('Error parsing servers.json:', parseErr);
        res.status(500).send('Internal Server Error');
      }
    });
  });

  app.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
  });
};

module.exports = { startApiServer };
