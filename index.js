const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());

// In-memory storage for tasks
let tasks = [];

app.get('/', (req, res) => {
  res.render('index', { tasks });
});

app.post('/api/tasks', (req, res) => {
  const { name, target } = req.body;
  const task = {
    id: Date.now(),
    name,
    target: parseInt(target),
    current: 0
  };
  tasks.push(task);
  res.json(task);
});

app.post('/api/tasks/:id/increment', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (task) {
    task.current++;
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Task tracker running at http://localhost:${port}`);
});
