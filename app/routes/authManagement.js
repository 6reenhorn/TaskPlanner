const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await db.execute(
            'SELECT * FROM users WHERE user_email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.user_password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session or token here
        res.json({ 
            message: 'Login successful',
            user: {
                id: user.user_id_,
                username: user.username,
                email: user.user_email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;
        console.log('Received registration request:', { firstName, lastName, username, email });
        
        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE user_email = ? OR username = ?',
            [email, username]
        );
        console.log('Existing users check:', existingUsers);

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO users (first_name, last_name, username, user_email, user_password, user_role) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, username, email, hashedPassword, 'user']
        );
        console.log('Insert result:', result);

        res.status(201).json({ 
            message: 'Registration successful',
            userId: result.insertId
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 