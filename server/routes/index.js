const serverRoutes = require('./serverRoutes');

const startApiServer = (app) => {
  app.use('/api/servers', serverRoutes);
};

module.exports = { startApiServer };
