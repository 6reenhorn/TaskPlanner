const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your database connection

// PUT route to update a task from admin perspective
router.put('/:id', async (req, res) => {
    const taskId = req.params.id;
    const { task_title, task_comment, task_description, task_due_date, task_status, task_priority } = req.body;

    const taskDueDate = new Date(task_due_date).toISOString().slice(0, 19).replace('T', ' ');

    try {
        // Update the task in the database
        const result = await db.execute(
            'UPDATE tasks SET task_title = ?, task_comment = ?, task_description = ?, task_due_date = ?, task_status = ?, task_priority = ? WHERE task_id_ = ?',
            [task_title, task_comment, task_description, taskDueDate, task_status, task_priority, taskId]
        );

        // Check if the task was updated
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Task updated successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

router.delete('/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        const result = await db.execute(
            'DELETE FROM tasks WHERE task_id_ = ?', // Adjust the table and column names as necessary
            [taskId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

router.post('/', async (req, res) => {
    const newTask = req.body; // Assuming the body contains the new task data

    try {
        const result = await db.execute(
            'INSERT INTO tasks (user_id_, task_title, task_comment, task_description, task_due_date, task_priority, task_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newTask.user_id_, newTask.task_title, newTask.task_comment, newTask.task_description, newTask.task_due_date, newTask.task_priority, newTask.task_status, newTask.created_at]
        );

        res.status(201).json({ message: 'Task added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

module.exports = router; 