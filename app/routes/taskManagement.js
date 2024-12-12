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
            `SELECT t.*, uc.unified_checklist_id_, uc.is_completed 
             FROM tasks t
             LEFT JOIN unified_checklist uc ON t.task_id_ = uc.related_id_ AND uc.related_type = 'Task'
             WHERE t.user_id_ = ?`,
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
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insert task
        const [result] = await connection.execute(
            'INSERT INTO tasks (task_title, task_description, task_due_date, task_priority, task_status, user_id_) VALUES (?, ?, ?, ?, ?, ?)',
            [
                req.body.task_title,
                req.body.task_description || null,
                req.body.task_due_date,
                req.body.task_priority || 'low',
                'In Progress', // Set default status
                req.body.user_id_
            ]
        );

        // Create corresponding checklist item
        await connection.execute(
            'INSERT INTO unified_checklist (related_id_, related_type, item_description) VALUES (?, ?, ?)',
            [
                result.insertId, // Use the ID of the newly created task
                'Task', 
                `Complete task: ${req.body.task_title}`
            ]
        );

        // Commit transaction
        await connection.commit();
        res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    } finally {
        connection.release();
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
