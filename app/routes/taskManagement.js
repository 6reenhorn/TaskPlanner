const express = require('express');
const router = express.Router();
const db = require('../db/server');

// GET tasks
router.get('/', async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks ORDER BY task_id_ DESC');
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST new task
router.post('/', async (req, res) => {
    try {
        const { task_title, task_description, task_due_date, task_status, task_priority } = req.body;
        console.log('Creating new task:', { 
            title: task_title,
            due_date: task_due_date,
            status: task_status,
            priority: task_priority
        });

        const [result] = await db.execute(
            'INSERT INTO tasks (task_title, task_description, task_due_date, task_status, task_priority) VALUES (?, ?, ?, ?, ?)',
            [task_title, task_description, task_due_date, task_status, task_priority]
        );
        console.log('Task created successfully with ID:', result.insertId);
        res.status(201).json({ message: 'Task created!', taskId: result.insertId });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        console.log('Deleting task with ID:', taskId); // Debug log

        const [result] = await db.execute(
            'DELETE FROM tasks WHERE task_id_ = ?',
            [taskId]
        );

        if (result.affectedRows === 0) {
            console.log('No task found with ID:', taskId);
            return res.status(404).json({ error: 'Task not found' });
        }

        console.log('Task deleted successfully:', result);
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
