import express from 'express';
import mongoose from 'mongoose';
import Task from './models/task.js';
import bodyParser from 'body-parser';
import grpcClient from './grpcClient.js';

mongoose.connect('mongodb://localhost:27017/tasks', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();
app.use(bodyParser.json());

app.post('/tasks', async (req, res) => {
  const { userId } = req.body;
  grpcClient.GetUser({ id: userId }, async (error, response) => {
    if (error) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const task = new Task(req.body);
    try {
      const savedTask = await task.save();
      res.status(201).json(savedTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Task service running on http://localhost:${PORT}`);
});
