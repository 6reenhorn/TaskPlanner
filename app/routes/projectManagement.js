const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        console.log('Raw request body:', req.body);
        
        const { project_title, project_description, project_start_date, project_end_date, project_status, user_id_ } = req.body;
        
        const [result] = await db.execute(
            'INSERT INTO projects (project_title, project_description, project_start_date, project_end_date, project_status, user_id_) VALUES (?, ?, ?, ?, ?, ?)',
            [project_title, project_description, project_start_date, project_end_date, project_status, user_id_]
        );

        console.log('Database result:', result);

        // Send back just the project ID and success status
        const response = {
            success: true,
            project_id_: result.insertId
        };

        console.log('Sending response:', response);
        res.status(201).json(response);

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create project'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        console.log('Fetching projects');
        const [projects] = await db.execute('SELECT * FROM projects');
        console.log('Found projects:', projects);

        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        console.log('Deleting project with ID:', projectId);

        const [result] = await db.execute(
            'DELETE FROM projects WHERE project_id_ = ?',
            [projectId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Project not found' 
            });
        }

        res.json({ 
            success: true,
            message: 'Project deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete project',
            details: error.message 
        });
    }
});

module.exports = router;
