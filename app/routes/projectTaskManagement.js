const express = require('express');
const router = express.Router();
const db = require('../db');

// Create project-task association
router.post('/', async (req, res) => {
    try {
        const { project_id_, task_id_ } = req.body;
        
        console.log('Creating project-task association:', {
            project_id_,
            task_id_,
            task_assigned_at: new Date().toISOString()
        });

        const [result] = await db.execute(
            'INSERT INTO project_task_assignment (project_id_, task_id_, task_assigned_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [project_id_, task_id_]
        );

        if (result.affectedRows === 0) {
            throw new Error('Failed to create association');
        }

        res.status(201).json({
            success: true,
            projectTaskId: result.insertId,
            project_id_,
            task_id_
        });
    } catch (error) {
        console.error('Error creating project-task association:', error);
        res.status(500).json({ 
            error: 'Failed to create project-task association',
            details: error.message,
            project_id: req.body.project_id_,
            task_id: req.body.task_id_
        });
    }
});

// Get tasks for a specific project
router.get('/:projectId', async (req, res) => {
    try {
        const [tasks] = await db.execute(`
            SELECT t.* 
            FROM tasks t
            JOIN project_task_assignment pta ON t.task_id_ = pta.task_id_
            WHERE pta.project_id_ = ?
        `, [req.params.projectId]);

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching project tasks:', error);
        res.status(500).json({ error: 'Failed to fetch project tasks' });
    }
});

module.exports = router; 