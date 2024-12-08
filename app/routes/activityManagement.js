const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all activities
router.get('/', async (req, res) => {
    try {
        // For now, just return an empty array since the table doesn't exist
        res.json([]);
        
        // TODO: Once you implement activities, use this code:
        // const [activities] = await db.execute('SELECT * FROM activities');
        // res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        // Return empty array instead of error
        res.json([]);
    }
});

module.exports = router; 