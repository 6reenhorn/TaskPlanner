const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your database connection

// PUT route to update a project collaboration
router.put('/:id', async (req, res) => {
    const collaborationId = req.params.id; // Assuming you have a unique ID for the collaboration
    const { project_id_, user_id_, user_collab_role, collaboration_name, collaboration_description, collaboration_status, collaboration_end_date, joined_at, leave_at } = req.body; // Adjust fields as necessary

    console.log('Incoming request body:', req.body);

    // Check for undefined values
    if (!project_id_ || !user_id_ || !user_collab_role || !collaboration_name || !collaboration_description || !collaboration_status || !collaboration_end_date || !joined_at) {
        return res.status(400).json({ error: 'All fields are required except leave_at.' });
    }

    // Format the dates to MySQL DATETIME format
    const formattedCollaborationEndDate = new Date(collaboration_end_date).toISOString().slice(0, 19).replace('T', ' '); // Convert to 'YYYY-MM-DD HH:MM:SS'
    const formattedJoinedAt = new Date(joined_at).toISOString().slice(0, 19).replace('T', ' '); // Convert to 'YYYY-MM-DD HH:MM:SS'

    // Validate leave_at
    let formattedLeaveAt = null; // Default to null
    if (leave_at && leave_at.trim() !== '') {
        formattedLeaveAt = new Date(leave_at).toISOString().slice(0, 19).replace('T', ' '); // Convert to 'YYYY-MM-DD HH:MM:SS'
    }

    try {
        // Update the project collaboration in the database
        const result = await db.execute(
            'UPDATE project_collaboration SET project_id_ = ?, user_id_ = ?, user_collab_role = ?, collaboration_name = ?, collaboration_description = ?, collaboration_status = ?, collaboration_end_date = ?, joined_at = ?, leave_at = ? WHERE project_collaboration_id_ = ?',
            [project_id_, user_id_, user_collab_role, collaboration_name, collaboration_description, collaboration_status, formattedCollaborationEndDate, formattedJoinedAt, formattedLeaveAt, collaborationId]
        );

        console.log('Update result:', result); // Log the result of the update

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Project collaboration updated successfully' });
        } else {
            res.status(404).json({ message: 'Project collaboration not found' });
        }
    } catch (error) {
        console.error('Error updating project collaboration:', error);
        res.status(500).json({ error: 'Failed to update project collaboration' });
    }
});

router.delete('/:id', async (req, res) => {
    const projectCollaborationId = req.params.id;

    console.log('Attempting to delete project collaboration with ID:', projectCollaborationId); // Log the ID

    try {
        const result = await db.execute(
            'DELETE FROM project_collaboration WHERE project_collaboration_id_ = ?', // Ensure this matches your database schema
            [projectCollaborationId]
        );

        console.log('Delete result:', result); // Log the result of the delete operation

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Project collaboration deleted successfully' });
        } else {
            res.status(404).json({ message: 'Project collaboration not found' });
        }
    } catch (error) {
        console.error('Error deleting project collaboration:', error);
        res.status(500).json({ error: 'Failed to delete project collaboration' });
    }
});

module.exports = router; 