const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

// Fetch all users
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT * FROM users');
        res.json(users); // Return all users
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Fetch all tasks
router.get('/tasks', async (req, res) => {
    try {
        const [tasks] = await db.execute('SELECT * FROM tasks');
        res.json(tasks); // Return all tasks
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Fetch all projects
router.get('/projects', async (req, res) => {
    try {
        const [projects] = await db.execute('SELECT * FROM projects');
        res.json(projects); // Return all projects
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Fetch all project_task_assignment
router.get('/project_task_assignment', async (req, res) => {
    try {
        const [projectTaskAssignment] = await db.execute('SELECT * FROM project_task_assignment');
        res.json(projectTaskAssignment); // Return all project task assignments
    } catch (error) {
        console.error('Error fetching project task assignment:', error);
        res.status(500).json({ error: 'Failed to fetch project task assignment' });
    }
});

// Fetch all project_collaboration
router.get('/project_collaboration', async (req, res) => {
    try {
        const [projectCollaboration] = await db.execute('SELECT * FROM project_collaboration');
        res.json(projectCollaboration); // Return all project collaboration
    } catch (error) {
        console.error('Error fetching project collaboration:', error);
        res.status(500).json({ error: 'Failed to fetch project collaboration' });
    }
});

// Fetch all task_assignments
router.get('/task_assignments', async (req, res) => {
    try {
        const [taskAssignments] = await db.execute('SELECT * FROM task_assignments');
        res.json(taskAssignments); // Return all task assignments
    } catch (error) {
        console.error('Error fetching task assignments:', error);
        res.status(500).json({ error: 'Failed to fetch task assignments' });
    }
});

// Fetach all unified_checklist
router.get('/unified_checklist', async (req, res) => {
    try {
        const [unifiedChecklist] = await db.execute('SELECT * FROM unified_checklist');
        res.json(unifiedChecklist); // Return all unified checklist
    } catch (error) {
        console.error('Error fetching unified checklist:', error);
        res.status(500).json({ error: 'Failed to fetch unified checklist' });
    }
});

// You can add more routes here to fetch other data as needed
// For example, fetching all users, projects, etc.

module.exports = router; 