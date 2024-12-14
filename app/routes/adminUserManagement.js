const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your database connection

// PUT route to update a user from admin perspective
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, username, user_email, user_role } = req.body;

    console.log('Incoming request body:', req.body);

    if (!first_name || !last_name || !username || !user_email || !user_role) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const result = await db.execute(
            'UPDATE users SET first_name = ?, last_name = ?, username = ?, user_email = ?, user_role = ? WHERE user_id_ = ?',
            [first_name, last_name, username, user_email, user_role, userId]
        );

        console.log('Update result:', result); // Log the result of the update

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'User updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router; 