const express = require('express');
const taskModel = require('./models/taskModel');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = 3000;

// Express configuration
app.set('view engine', 'ejs');
app.use(express.json());

// Seed test data
// taskModel.seedTestData();

// Routes
app.use('/', taskRoutes);

// Start server
app.listen(port, () => {
  console.log(`Task tracker running at http://localhost:${port}`);
});
