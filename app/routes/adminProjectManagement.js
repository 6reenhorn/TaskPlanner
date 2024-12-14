const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your database connection


router.delete('/:id', async (req, res) => {
    const projectId = req.params.id;

    try {
        const result = await db.execute(
            'DELETE FROM projects WHERE project_id_ = ?', // Adjust the table and column names as necessary
            [projectId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Project deleted successfully' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;