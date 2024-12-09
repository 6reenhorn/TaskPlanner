const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        const [tasks] = await db.execute(
            'SELECT * FROM tasks WHERE user_id_ = ?',
            [userId]
        );
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST new task
router.post('/', async (req, res) => {
    try {
        console.log('Received task data:', req.body);

        const { task_title, task_description, task_due_date, task_priority, user_id_ } = req.body;
        
        // Validate required fields
        if (!task_title || !task_due_date || !user_id_) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    title: !task_title ? 'Task title is required' : null,
                    dueDate: !task_due_date ? 'Due date is required' : null,
                    userId: !user_id_ ? 'User ID is required' : null
                }
            });
        }

        // Format the date properly for MySQL
        const formattedDueDate = new Date(task_due_date).toISOString().split('T')[0];

        const [result] = await db.execute(
            'INSERT INTO tasks (task_title, task_description, task_due_date, task_priority, user_id_) VALUES (?, ?, ?, ?, ?)',
            [
                task_title,
                task_description || null,
                formattedDueDate,
                task_priority || 'low',
                user_id_
            ]
        );

        console.log('Database result:', result);

        // Fetch the created task to return it
        const [newTask] = await db.execute(
            'SELECT * FROM tasks WHERE task_id_ = ?',
            [result.insertId]
        );

        res.status(201).json(newTask[0]);

    } catch (err) {
        console.error('Detailed error:', err);
        res.status(500).json({ 
            error: 'Failed to create task',
            details: err.message 
        });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        console.log('Deleting task with ID:', taskId);

        const [result] = await db.execute(
            'DELETE FROM tasks WHERE task_id_ = ?',
            [taskId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }

        res.json({ 
            success: true,
            message: 'Task deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete task',
            details: error.message 
        });
    }
});

// PUT task
router.put('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { task_title, task_description, task_due_date, task_priority, user_id_ } = req.body;
        
        console.log('Updating task:', {
            taskId,
            task_title,
            task_description,
            task_due_date,
            task_priority,
            user_id_
        });

        const [result] = await db.execute(
            'UPDATE tasks SET task_title = ?, task_description = ?, task_due_date = ?, task_priority = ? WHERE task_id_ = ? AND user_id_ = ?',
            [task_title, task_description, task_due_date, task_priority, taskId, user_id_]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        console.log('Task updated successfully');
        res.json({ message: 'Task updated successfully' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

module.exports = router;
