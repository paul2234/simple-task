// Task Model - handles data storage and business logic
const fs = require('fs');
const path = require('path');

class TaskModel {
  constructor() {
    // In-memory storage for tasks and history
    // Structure: { taskName: { target: number, createdDate: string, history: { date: count } } }
    this.taskRegistry = {};
    this.dataFile = path.join(__dirname, '..', 'tasks.json');
    this.loadData();
  }

  // Load data from JSON file
  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        this.taskRegistry = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.taskRegistry = {};
    }
  }

  // Save data to JSON file
  saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.taskRegistry, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  // Helper function to get today's date in YYYY-MM-DD format
  getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper function to get date N days ago
  getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Calculate total actions for all time
  getTotalActionsAllTime(history) {
    return Object.values(history).reduce((sum, count) => sum + count, 0);
  }

  // Calculate total actions for last N days
  getTotalActionsLastNDays(history, days) {
    let total = 0;
    for (let i = 0; i < days; i++) {
      const date = this.getDaysAgo(i);
      total += history[date] || 0;
    }
    return total;
  }

  // Get 100 days of history for a task
  get100DayHistory(history, target, createdDate) {
    const today = this.getToday();
    const result = [];
    
    for (let i = 99; i >= 0; i--) {
      const date = this.getDaysAgo(i);
      const count = history[date] || 0;
      const isFuture = date > today;
      const isToday = date === today;
      const isBeforeCreation = date < createdDate;
      const isComplete = count >= target;
      
      let status;
      if (isFuture || isBeforeCreation) {
        status = 'future';
      } else if (isToday) {
        status = isComplete ? 'complete' : 'inProgress';
      } else {
        status = isComplete ? 'complete' : 'incomplete';
      }
      
      result.push({
        date,
        count,
        status
      });
    }
    
    return result;
  }

  // Get all tasks for today
  getTodaysTasks() {
    const today = this.getToday();
    return Object.keys(this.taskRegistry).map((name) => {
      const taskData = this.taskRegistry[name];
      const current = taskData.history[today] || 0;
      const history100 = this.get100DayHistory(taskData.history, taskData.target, taskData.createdDate);
      const actionsAllTime = this.getTotalActionsAllTime(taskData.history);
      const actionsLast7Days = this.getTotalActionsLastNDays(taskData.history, 7);
      const actionsLast3Days = this.getTotalActionsLastNDays(taskData.history, 3);
      
      return {
        id: name,
        name,
        target: taskData.target,
        current,
        history100,
        actionsAllTime,
        actionsLast7Days,
        actionsLast3Days
      };
    });
  }

  // Create a new task
  createTask(name, target) {
    if (!this.taskRegistry[name]) {
      this.taskRegistry[name] = {
        target: parseInt(target),
        createdDate: this.getToday(),
        history: {}
      };
      this.saveData();
    }
    
    const tasks = this.getTodaysTasks();
    return tasks.find(t => t.name === name);
  }

  // Increment task counter for today
  incrementTask(taskName) {
    const taskData = this.taskRegistry[taskName];
    
    if (!taskData) {
      return null;
    }
    
    const today = this.getToday();
    taskData.history[today] = (taskData.history[today] || 0) + 1;
    this.saveData();
    
    const updatedTasks = this.getTodaysTasks();
    return updatedTasks.find(t => t.name === taskName);
  }

  // Delete a task
  deleteTask(taskName) {
    if (this.taskRegistry[taskName]) {
      delete this.taskRegistry[taskName];
      this.saveData();
      return true;
    }
    return false;
  }

  // Seed test data
  seedTestData() {
    const today = new Date();
    
    // Task 1: "Read" - started 30 days ago
    const readStartDate = new Date(today);
    readStartDate.setDate(readStartDate.getDate() - 30);
    this.taskRegistry['Read'] = {
      target: 10,
      createdDate: readStartDate.toISOString().split('T')[0],
      history: {}
    };
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      // Random completion - sometimes complete, sometimes not
      const shouldComplete = Math.random() > 0.3;
      this.taskRegistry['Read'].history[dateStr] = shouldComplete ? (10 + Math.floor(Math.random() * 5)) : Math.floor(Math.random() * 8);
    }
    
    // Task 2: "Exercise" - started 7 days ago
    const exerciseStartDate = new Date(today);
    exerciseStartDate.setDate(exerciseStartDate.getDate() - 7);
    this.taskRegistry['Exercise'] = {
      target: 20,
      createdDate: exerciseStartDate.toISOString().split('T')[0],
      history: {}
    };
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      this.taskRegistry['Exercise'].history[dateStr] = i === 0 ? 5 : (Math.random() > 0.4 ? 20 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 15));
    }
  }
}

module.exports = new TaskModel();
