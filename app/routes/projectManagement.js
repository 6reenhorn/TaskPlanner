const express = require('express');
const router = express.Router();
const db = require('../db');

// Fetch all projects
router.get('/', async (req, res) => {
    try {
        console.log('Fetching projects...');
        const [projects] = await db.query('SELECT * FROM projects');
        console.log('Projects fetched:', projects);
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send(err.message);
    }
});

// Add a new project
router.post('/', async (req, res) => {
    const { 
        user_id_,
        project_title, 
        project_comment, 
        project_description, 
        project_start_date,
        project_end_date,
        project_status 
    } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO projects (user_id_, project_title, project_comment, project_description, project_start_date, project_end_date, project_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id_, project_title, project_comment, project_description, project_start_date, project_end_date, project_status]
        );
        console.log('Project created with result:', result);
        res.status(201).send('Project created!');
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).send(err.message);
    }
});

// Delete a project
router.delete('/:id', async (req, res) => {
    try {
        console.log('Deleting project:', req.params.id);
        const [result] = await db.query('DELETE FROM projects WHERE project_id_ = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Project not found');
        }
        res.status(200).send('Project deleted');
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).send(err.message);
    }
});

module.exports = router;
