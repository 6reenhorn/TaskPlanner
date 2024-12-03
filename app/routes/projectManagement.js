// const express = require('express');
// const router = express.Router();
// const db = require('../db/db');

// // Fetch all project
// router.get('/', async (req, res) => {
//     try {
//         const [project] = await db.query('SELECT * FROM project');
//         res.json(project);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// // Add a new project
// router.post('/', async (req, res) => {
//     const { project_title, project_comment, project_description, project_start_date, project_end_date, project_status } = req.body;
//     try {
//         await db.query(
//             'INSERT INTO project (project_title, project_comment, project_description, project_start_date, project_end_date, project_status) VALUES (?, ?, ?, ?, ?, ?)',
//             [project_title, project_comment, project_description, project_start_date, project_end_date, project_status]
//         );
//         res.status(201).send('Project created!');
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

// module.exports = router;
