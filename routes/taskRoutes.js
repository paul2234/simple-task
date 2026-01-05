// Task Routes - defines all route endpoints
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Home page route
router.get('/', taskController.getHomePage);

// API routes
router.post('/api/tasks', taskController.createTask);
router.post('/api/tasks/:id/increment', taskController.incrementTask);
router.delete('/api/tasks/:id', taskController.deleteTask);

module.exports = router;
