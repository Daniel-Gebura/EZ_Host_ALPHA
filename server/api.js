/**
 * api.js
 *
 * Entry point for the backend API server. Sets up express server and uses server and RCON routes.
 *
 * @file api.js
 * @description Entry point for backend API server
 * @version 1.0
 */

const express = require('express');
const cors = require('cors');
const serverRoutes = require('./routes/serverRoutes');
const rconRoutes = require('./routes/rconRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Use the server and RCON routes
app.use('/api/servers', serverRoutes);
app.use('/api/rcon', rconRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
