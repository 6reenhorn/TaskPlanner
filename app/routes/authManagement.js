const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Add a test GET route to verify the endpoint is working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working' });
});

// Your existing POST login route
router.post('/login', async (req, res) => {
    try {
        console.log('Received login request:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log('Attempting login for user:', email);

        // Find user by email
        const [users] = await db.execute(
            'SELECT * FROM users WHERE user_email = ?',
            [email]
        );

        console.log('Query result:', users);

        if (users.length === 0) {
            console.log('No user found with this email');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        
        // Compare the password hash
        const passwordMatch = await bcrypt.compare(password, user.user_password);
        
        if (!passwordMatch) {
            console.log('Password does not match');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for user:', email);
        
        // Send back user data including role
        res.json({ 
            message: 'Login successful',
            user: {
                user_id_: user.user_id_,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                email: user.user_email,
                role: user.user_role // Include user role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Add this to your existing routes
router.post('/signup', async (req, res) => {
    try {
        console.log('Received signup request:', req.body);
        const { username, first_name, last_name, email, password } = req.body;
        
        // Validate required fields
        if (!username || !email || !password || !first_name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE user_email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user with default role
        const [result] = await db.execute(
            'INSERT INTO users (username, first_name, last_name, user_email, user_password, user_role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, first_name, last_name || '', email, hashedPassword, 'user'] // Added default role 'user'
        );

        console.log('User created successfully:', result);

        res.status(201).json({ 
            message: 'User created successfully',
            user_id: result.insertId
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// Add this route for fetching all users
router.get('/users', async (req, res) => {
    console.log('GET /api/auth/users hit');
    try {
        const [users] = await db.execute('SELECT user_id_, username, first_name, last_name, user_email FROM users');
        console.log('Users fetched:', users);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Fetch user data by ID
router.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [user] = await db.execute('SELECT user_id_, first_name, last_name, username, user_email, user_password, user_role, profile_picture, created_at, deleted_at FROM users WHERE user_id_ = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user[0]); // Return the user data
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Fetch all tasks or tasks for a specific user
router.get('/tasks/user/:id', async (req, res) => {
    const userId = req.params.id; // Optional query parameter
    try {
        // Fetch tasks for a specific user
        [tasks] = await db.execute('SELECT * FROM tasks WHERE user_id_ = ?', [userId]);
        res.json(tasks); // Return the tasks
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Fetch projects for a specific user
router.get('/projects/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [projects] = await db.execute('SELECT * FROM projects WHERE user_id_ = ?', [userId]);
        res.json(projects); // Return the projects for the user
    } catch (error) {
        console.error('Error fetching user projects:', error);
        res.status(500).json({ error: 'Failed to fetch user projects' });
    }
});

// Fetch project-task assignments for a specific user
router.get('/project_task_assignments/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Fetch projects associated with the user
        const [projects] = await db.execute('SELECT project_id_ FROM projects WHERE user_id_ = ?', [userId]);
        
        if (projects.length === 0) {
            return res.json([]); // No projects found for the user
        }

        // Extract project IDs
        const projectIds = projects.map(project => project.project_id_);
        console.log('Project IDs:', projectIds); // Log the project IDs

        // Construct the SQL query
        const placeholders = projectIds.map(() => '?').join(',');
        const sql = `SELECT * FROM project_task_assignment WHERE project_id_ IN (${placeholders})`;
        console.log('SQL Query:', sql); // Log the SQL query

        // Fetch project-task assignments for the user's projects
        const [assignments] = await db.execute(sql, projectIds);
        console.log('Assignments fetched:', assignments); // Log the assignments
        res.json(assignments); // Return the project-task assignments for the user
    } catch (error) {
        console.error('Error fetching project-task assignments:', error);
        res.status(500).json({ error: 'Failed to fetch project-task assignments' });
    }
});

// Fetch collaborations for a specific user
router.get('/collaborations/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [collaborations] = await db.execute('SELECT * FROM project_collaboration WHERE user_id_ = ?', [userId]);
        res.json(collaborations); // Return the collaborations for the user
    } catch (error) {
        console.error('Error fetching collaborations:', error);
        res.status(500).json({ error: 'Failed to fetch collaborations' });
    }
});

// Create a new collaboration
router.post('/collaborations', async (req, res) => {
    try {
        const { project_id_, user_id_, user_collab_role, collaboration_name, collaboration_description, collaboration_end_date } = req.body;
        if (!project_id_ || !user_id_ || !user_collab_role || !collaboration_name || !collaboration_end_date) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO project_collaboration (project_id_, user_id_, user_collab_role, collaboration_name, collaboration_description, collaboration_end_date) VALUES (?, ?, ?, ?, ?, ?)',
            [project_id_, user_id_, user_collab_role, collaboration_name, collaboration_description, collaboration_end_date]
        );

        res.status(201).json({ message: 'Collaboration created successfully', collaboration_id: result.insertId });
    } catch (err) {
        console.error('Error creating collaboration:', err);
        res.status(500).json({ error: 'Failed to create collaboration' });
    }
});

// Update an existing collaboration
router.put('/collaborations/:id', async (req, res) => {
    const collaborationId = req.params.id;
    try {
        const { user_collab_role, collaboration_name, collaboration_description, collaboration_status, collaboration_end_date } = req.body;
        const [result] = await db.execute(
            'UPDATE project_collaboration SET user_collab_role = ?, collaboration_name = ?, collaboration_description = ?, collaboration_status = ?, collaboration_end_date = ? WHERE project_collaboration_id_ = ?',
            [user_collab_role, collaboration_name, collaboration_description, collaboration_status, collaboration_end_date, collaborationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        res.json({ message: 'Collaboration updated successfully' });
    } catch (err) {
        console.error('Error updating collaboration:', err);
        res.status(500).json({ error: 'Failed to update collaboration' });
    }
});

// Delete a collaboration
router.delete('/collaborations/:id', async (req, res) => {
    const collaborationId = req.params.id;
    try {
        const [result] = await db.execute(
            'DELETE FROM project_collaboration WHERE project_collaboration_id_ = ?',
            [collaborationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        res.json({ message: 'Collaboration deleted successfully' });
    } catch (err) {
        console.error('Error deleting collaboration:', err);
        res.status(500).json({ error: 'Failed to delete collaboration' });
    }
});

// Fetch task assignments for a specific user
router.get('/task_assignments/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Query to fetch task assignments where the assigned_to_ or assigned_by_ matches the userId
        const [taskAssignments] = await db.execute(`
            SELECT * FROM task_assignments 
            WHERE assigned_to_ = ? OR assigned_by_ = ?`, 
            [userId, userId]
        );

        res.json(taskAssignments); // Return the task assignments for the user
    } catch (error) {
        console.error('Error fetching task assignments:', error);
        res.status(500).json({ error: 'Failed to fetch task assignments' });
    }
});

// Fetch unified checklist items for a specific user's tasks
router.get('/unified_checklist/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Query to fetch checklist items related to tasks owned by the user
        const [checklistItems] = await db.execute(`
            SELECT uc.* FROM unified_checklist uc
            JOIN tasks t ON uc.related_id_ = t.task_id_
            WHERE t.user_id_ = ? AND uc.related_type = 'Task'`, 
            [userId]
        );

        res.json(checklistItems); // Return the checklist items for the user's tasks
    } catch (error) {
        console.error('Error fetching unified checklist items:', error);
        res.status(500).json({ error: 'Failed to fetch unified checklist items' });
    }
});

// All Entities
// Fetch all users
router.get('/api/auth/users', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Fetch all tasks
// router.get('/api/auth/tasks', async (req, res) => {
//     try {
//         const [tasks] = await db.execute('SELECT * FROM tasks');
//         res.json(tasks); // Return all tasks
//     } catch (error) {
//         console.error('Error fetching tasks:', error);
//         res.status(500).json({ error: 'Failed to fetch tasks' });
//     }
// });


module.exports = router; 