const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        console.log('Fetching tasks');
        const [tasks] = await db.execute('SELECT * FROM tasks ORDER BY created_at DESC');
        console.log('Found tasks:', tasks);
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST new task
router.post('/', async (req, res) => {
    try {
        console.log('Received task data:', req.body);

        const { task_title, task_description, task_due_date, task_priority, user_id_ } = req.body;
        
        if (!user_id_) {
            throw new Error('User ID is required');
        }

        const [result] = await db.execute(
            'INSERT INTO tasks (task_title, task_description, task_due_date, task_priority, user_id_) VALUES (?, ?, ?, ?, ?)',
            [task_title, task_description, task_due_date, task_priority, user_id_]
        );

        console.log('Database result:', result);

        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.insertId
        });

    } catch (err) {
        console.error('Detailed error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        console.log('Deleting task with ID:', taskId);

        const [result] = await db.execute('DELETE FROM tasks WHERE task_id_ = ?', [taskId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;
