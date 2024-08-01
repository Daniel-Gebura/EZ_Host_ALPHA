const express = require('express');
const cors = require('cors');
const serverRoutes = require('./routes/serverRoutes');

const PORT = 5000;

const app = express();
app.use(cors());
app.use(express.json());

const startApiServer = (app) => {
  app.use('/api/servers', serverRoutes);
};

startApiServer(app);

app.listen(PORT, () => {
  console.log(`API Server is running on http://localhost:${PORT}`);
});

module.exports = app;
