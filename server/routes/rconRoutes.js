/**
 * rconRoutes.js
 *
 * Defines routes for RCON commands and player management.
 *
 * @file rconRoutes.js
 * @description Routes for RCON commands and player management
 * @version 1.0
 */

const express = require('express');
const { sendRconCommand, getPlayersList } = require('../utils/serverUtils');
const { loadServers } = require('../utils/fileUtils');

const router = express.Router();
let servers = loadServers();

// Endpoint to send an RCON command to the server
router.post('/:id/command', async (req, res) => {
  const { id } = req.params;
  const { command } = req.body;
  await sendRconCommand(id, command, res);
});

// Endpoint to get the list of players
router.get('/:id/players', async (req, res) => {
  const { id } = req.params;
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  try {
    const players = await getPlayersList(server.rconPassword);
    res.json(players);
  } catch (error) {
    res.status(500).send('Failed to fetch players list');
  }
});

// Endpoint to OP/Un-OP a player
router.post('/:id/player/:playerName/op', async (req, res) => {
  const { id, playerName } = req.params;
  const { op } = req.body; // true to OP, false to un-OP
  const server = servers.find(s => s.id === id);
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const command = op ? `op ${playerName}` : `deop ${playerName}`;
  await sendRconCommand(id, command, res);
});

module.exports = router;
