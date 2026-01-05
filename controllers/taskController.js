// Task Controller - handles HTTP request/response logic
const taskModel = require('../models/taskModel');

// Render the main page with today's tasks
exports.getHomePage = (req, res) => {
  const tasks = taskModel.getTodaysTasks();
  res.render('index', { tasks });
};

// Create a new task
exports.createTask = (req, res) => {
  const { name, target } = req.body;
  const newTask = taskModel.createTask(name, target);
  res.json(newTask);
};

// Increment a task's counter
exports.incrementTask = (req, res) => {
  const taskName = decodeURIComponent(req.params.id);
  const updatedTask = taskModel.incrementTask(taskName);
  
  if (updatedTask) {
    res.json(updatedTask);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
};

// Delete a task
exports.deleteTask = (req, res) => {
  const taskName = decodeURIComponent(req.params.id);
  const success = taskModel.deleteTask(taskName);
  res.json({ success });
};
