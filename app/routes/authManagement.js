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

module.exports = router; 