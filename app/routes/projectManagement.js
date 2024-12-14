const express = require('express');
const router = express.Router();
const db = require('../db');

// Create project with initial tasks
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        console.log('Creating project with data:', req.body);
        const { 
            project_title, 
            project_description, 
            project_start_date, 
            project_end_date, 
            project_status, 
            user_id_,
            tasks  // Array of task IDs to associate
        } = req.body;
        
        // Create project
        const [projectResult] = await connection.execute(
            'INSERT INTO projects (project_title, project_description, project_start_date, project_end_date, project_status, user_id_) VALUES (?, ?, ?, ?, ?, ?)',
            [project_title, project_description, project_start_date, project_end_date, project_status, user_id_]
        );

        const project_id_ = projectResult.insertId;
        console.log('Created project with ID:', project_id_);

        // Associate tasks if provided
        if (tasks && tasks.length > 0) {
            console.log('Associating tasks:', tasks);
            for (const task of tasks) {
                await connection.execute(
                    'INSERT INTO project_task_assignment (project_id_, task_id_, task_assigned_at) VALUES (?, ?, NOW())',
                    [project_id_, task.task_id_]
                );
            }
        }

        await connection.commit();

        // Fetch the complete project with its tasks
        const [project] = await connection.execute(
            'SELECT * FROM projects WHERE project_id_ = ?',
            [project_id_]
        );

        const [assignedTasks] = await connection.execute(
            `SELECT t.*, pta.task_assigned_at 
             FROM tasks t 
             JOIN project_task_assignment pta ON t.task_id_ = pta.task_id_ 
             WHERE pta.project_id_ = ?`,
            [project_id_]
        );

        const response = {
            success: true,
            project: project[0],
            tasks: assignedTasks
        };

        console.log('Sending response:', response);
        res.status(201).json(response);

    } catch (error) {
        await connection.rollback();
        console.error('Error creating project:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create project',
            details: error.message
        });
    } finally {
        connection.release();
    }
});

router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        const [projects] = await db.execute(
            'SELECT * FROM projects WHERE user_id_ = ?',
            [userId]
        );
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
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

// Update project details
router.put('/:id', async (req, res) => {
    const projectId = req.params.id;
    console.log('Incoming PUT request for project ID:', projectId);
    console.log('Request body:', req.body);

    const { user_id_, project_title, project_comment, project_description, project_start_date, project_end_date, project_status } = req.body;

    const startDate = new Date(project_start_date).toISOString().slice(0, 19).replace('T', ' ');
    const endDate = new Date(project_end_date).toISOString().slice(0, 19).replace('T', ' ');

    // Log the incoming request data
    console.log('Updating project with ID:', projectId);
    console.log('Request body:', req.body);

    try {
        // Prepare the SQL query and parameters
        const query = `
            UPDATE projects 
            SET user_id_ = ?, project_title = ?, project_comment = ?, project_description = ?, project_start_date = ?, project_end_date = ?, project_status = ? 
            WHERE project_id_ = ?
        `;
        const params = [user_id_, project_title, project_comment, project_description, startDate, endDate, project_status, projectId];

        // Log the query and parameters
        console.log('Executing query:', query);
        console.log('With parameters:', params);

        const result = await db.execute(query, params);

        // Log the result of the query
        console.log('Query result:', result);

        if (result.affectedRows > 0) {
            console.log('Project updated successfully');
            res.status(200).json({ message: 'Project updated successfully' });
        } else {
            console.log('Project not found');
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

module.exports = router;
