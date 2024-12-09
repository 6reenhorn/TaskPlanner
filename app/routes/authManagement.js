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
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log('Attempting login for user:', username);

        // First, find user by email only
        const [users] = await db.execute(
            'SELECT * FROM users WHERE user_email = ?',
            [username]
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

        console.log('Login successful for user:', username);
        
        res.json({ 
            message: 'Login successful',
            user: {
                id: user.user_id_,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                email: user.user_email,
                role: user.user_role
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

module.exports = router; 