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
        const [result] = await db.execute(
            'INSERT INTO projects (project_title, project_description, project_start_date, project_end_date, project_status) VALUES (?, ?, ?, ?, ?)',
            [project_title, project_description, project_start_date, project_end_date, project_status]
        );
        res.status(201).json({ message: 'Project created!', projectId: result.insertId });
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
