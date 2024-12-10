const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log('Fetching tasks for user:', userId);

        if (!userId) {
            console.log('No userId provided');
            return res.status(400).json({ error: 'userId is required' });
        }

        const [tasks] = await db.execute(
            'SELECT * FROM tasks WHERE user_id_ = ?',
            [userId]
        );

        console.log('Found tasks:', tasks);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST new task or associate existing tasks
router.post('/', async (req, res) => {
    try {
        console.log('Raw request body:', req.body);
        console.log('Content-Type:', req.headers['content-type']);
        
        // Basic request validation
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('Empty request body received');
            return res.status(400).json({ error: 'No task data provided' });
        }

        let taskToProcess;
        if (req.body.tasks) {
            // For project tasks (multiple)
            console.log('Processing multiple tasks');
            taskToProcess = req.body.tasks;
        } else {
            // For single task creation
            console.log('Processing single task');
            taskToProcess = [req.body];
        }

        console.log('Tasks to process:', taskToProcess);

        if (!Array.isArray(taskToProcess) || taskToProcess.length === 0) {
            console.log('Invalid task data structure');
            return res.status(400).json({ error: 'Invalid task data structure' });
        }

        const results = [];
        for (const task of taskToProcess) {
            // Validate task data
            if (!task.task_title || !task.task_due_date || !task.user_id_) {
                console.log('Invalid task data:', task);
                return res.status(400).json({ 
                    error: 'Missing required fields',
                    details: {
                        title: !task.task_title ? 'Task title is required' : null,
                        dueDate: !task.task_due_date ? 'Due date is required' : null,
                        userId: !task.user_id_ ? 'User ID is required' : null
                    }
                });
            }

            // Format date
            const formattedDueDate = new Date(task.task_due_date).toISOString().split('T')[0];

            // Insert task
            const [result] = await db.execute(
                'INSERT INTO tasks (task_title, task_description, task_due_date, task_priority, user_id_) VALUES (?, ?, ?, ?, ?)',
                [
                    task.task_title,
                    task.task_description || null,
                    formattedDueDate,
                    task.task_priority || 'low',
                    task.user_id_
                ]
            );

            console.log('Insert result:', result);

            // Get created task
            const [newTask] = await db.execute(
                'SELECT * FROM tasks WHERE task_id_ = ?',
                [result.insertId]
            );

            console.log('Created task:', newTask[0]);
            results.push(newTask[0]);
        }

        // Send response
        const response = taskToProcess.length === 1 ? results[0] : { success: true, results };
        console.log('Sending response:', response);
        res.status(201).json(response);

    } catch (err) {
        console.error('Error processing task:', err);
        res.status(500).json({ 
            error: 'Failed to process tasks',
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
