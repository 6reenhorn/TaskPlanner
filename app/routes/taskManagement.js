const express = require('express');
const router = express.Router();
const db = require('../db');

// Fetch all tasks
router.get('/', async (req, res) => {
    try {
        console.log('Fetching tasks...');
        const [tasks] = await db.query('SELECT * FROM tasks');
        console.log('Tasks fetched:', tasks);
        
        // Explicitly set headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add a new task
router.post('/', async (req, res) => {
    const { task_title, task_comment, task_description, task_due_date, task_status, task_priority } = req.body;
    console.log('Received task data:', req.body);  // Log the received data
    try {
        const result = await db.query(
            'INSERT INTO tasks (task_title, task_comment, task_description, task_due_date, task_status, task_priority) VALUES (?, ?, ?, ?, ?, ?)',
            [task_title, task_comment, task_description, task_due_date, task_status, task_priority]
        );
        console.log('Task created with result:', result);  // Log the result of the query
        res.status(201).send('Task created!');
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).send(err.message);
    }
});

module.exports = router;
