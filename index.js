const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());

// In-memory storage for tasks and history
// Structure: { taskName: { target: number, history: { date: count } } }
let taskRegistry = {};

// Helper function to get today's date in YYYY-MM-DD format
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Calculate streak for a task
function calculateStreak(history) {
  const dates = Object.keys(history).sort().reverse();
  if (dates.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date(getToday());
  
  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i];
    const checkDate = new Date(dateStr);
    
    // Check if this date is consecutive
    if (i === 0) {
      // First date should be today or yesterday for an active streak
      const daysDiff = Math.floor((currentDate - checkDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) break; // Streak broken
      if (history[dateStr] >= taskRegistry[Object.keys(taskRegistry).find(name => 
        taskRegistry[name].history === history)].target) {
        streak++;
        currentDate = checkDate;
      } else if (daysDiff === 0) {
        // Today but not complete yet - don't break streak, just don't count it
        currentDate = new Date(checkDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (dateStr !== expectedDateStr) break; // Gap in dates
      if (history[dateStr] < taskRegistry[Object.keys(taskRegistry).find(name => 
        taskRegistry[name].history === history)].target) break; // Didn't meet goal
      
      streak++;
      currentDate = expectedDate;
    }
  }
  
  return streak;
}

// Get today's tasks for display
function getTodaysTasks() {
  const today = getToday();
  return Object.keys(taskRegistry).map((name, index) => {
    const taskData = taskRegistry[name];
    const current = taskData.history[today] || 0;
    const streak = calculateStreak(taskData.history);
    
    return {
      id: index,
      name,
      target: taskData.target,
      current,
      streak
    };
  });
}

// Seed some test data
function seedTestData() {
  const today = new Date();
  
  // Task 1: "Email potential leads" - 7 day streak
  taskRegistry['Email potential leads'] = {
    target: 10,
    history: {}
  };
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    taskRegistry['Email potential leads'].history[dateStr] = i === 0 ? 3 : 10 + Math.floor(Math.random() * 5);
  }
  
  // Task 2: "Make cold calls" - 3 day streak
  taskRegistry['Make cold calls'] = {
    target: 20,
    history: {}
  };
  for (let i = 2; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    taskRegistry['Make cold calls'].history[dateStr] = i === 0 ? 8 : 20 + Math.floor(Math.random() * 10);
  }
  
  // Task 3: "Follow up meetings" - broken streak (missed yesterday)
  taskRegistry['Follow up meetings'] = {
    target: 5,
    history: {}
  };
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  taskRegistry['Follow up meetings'].history[threeDaysAgo.toISOString().split('T')[0]] = 6;
  taskRegistry['Follow up meetings'].history[twoDaysAgo.toISOString().split('T')[0]] = 5;
  taskRegistry['Follow up meetings'].history[getToday()] = 2;
}

seedTestData();

app.get('/', (req, res) => {
  const tasks = getTodaysTasks();
  res.render('index', { tasks });
});

app.post('/api/tasks', (req, res) => {
  const { name, target } = req.body;
  
  // Check if task already exists
  if (!taskRegistry[name]) {
    taskRegistry[name] = {
      target: parseInt(target),
      history: {}
    };
  }
  
  const tasks = getTodaysTasks();
  const newTask = tasks.find(t => t.name === name);
  res.json(newTask);
});

app.post('/api/tasks/:id/increment', (req, res) => {
  const tasks = getTodaysTasks();
  const task = tasks[parseInt(req.params.id)];
  
  if (task) {
    const today = getToday();
    const taskData = taskRegistry[task.name];
    taskData.history[today] = (taskData.history[today] || 0) + 1;
    
    const updatedTasks = getTodaysTasks();
    const updatedTask = updatedTasks[parseInt(req.params.id)];
    res.json(updatedTask);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = getTodaysTasks();
  const task = tasks[parseInt(req.params.id)];
  
  if (task) {
    delete taskRegistry[task.name];
  }
  
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Task tracker running at http://localhost:${port}`);
});
