const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        console.log('Raw request body:', req.body);
        const { project_title, project_description, project_start_date, project_end_date, project_status, user_id_ } = req.body;

        // Log each value separately
        console.log('Extracted values:', {
            project_title,
            project_description,
            project_start_date,
            project_end_date,
            project_status,
            user_id_
        });

        // Set null for optional fields if they're undefined
        const values = [
            project_title || null,
            project_description || null,
            project_start_date || null,
            project_end_date || null,
            project_status || null,
            user_id_ || null
        ];

        console.log('Values to be inserted:', values);

        const [result] = await db.execute(
            'INSERT INTO projects (project_title, project_description, project_start_date, project_end_date, project_status, user_id_) VALUES (?, ?, ?, ?, ?, ?)',
            values
        );

        console.log('Database result:', result);
        res.status(201).json({ message: 'Project created successfully', projectId: result.insertId });
    } catch (err) {
        console.error('Detailed error:', {
            message: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.get('/', async (req, res) => {
    try {
        const [projects] = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

module.exports = router;
