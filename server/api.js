const express = require('express');
const cors = require('cors');
const { startApiServer } = require('./routes/routes');

const PORT = 5000;

const app = express();
app.use(cors());
app.use(express.json());

startApiServer(app);

app.listen(PORT, () => {
  console.log(`API Server is running on http://localhost:${PORT}`);
});

module.exports = app;
