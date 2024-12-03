const express = require('express');
const router = express.Router();
const db = require('../db/server');

// GET projects
router.get('/', async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects ORDER BY project_id_ DESC');
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST new project
router.post('/', async (req, res) => {
    try {
        const { project_title, project_description, project_start_date, project_end_date, project_status } = req.body;
        console.log('Creating new project:', { 
            title: project_title,
            start_date: project_start_date,
            end_date: project_end_date,
            status: project_status
        });

        const [result] = await db.execute(
            'INSERT INTO projects (project_title, project_description, project_start_date, project_end_date, project_status) VALUES (?, ?, ?, ?, ?)',
            [project_title, project_description, project_start_date, project_end_date, project_status]
        );
        console.log('Project created successfully with ID:', result.insertId);
        res.status(201).json({ message: 'Project created!', projectId: result.insertId });
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add this route to handle project deletion
router.delete('/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        console.log('Deleting project with ID:', projectId);

        const [result] = await db.execute(
            'DELETE FROM projects WHERE project_id_ = ?',
            [projectId]
        );

        if (result.affectedRows === 0) {
            console.log('No project found with ID:', projectId);
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log('Project deleted successfully:', result);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
