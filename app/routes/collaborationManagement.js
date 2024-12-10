const express = require('express');
const router = express.Router();
const db = require('../db');

// Create new collaboration
router.post('/', async (req, res) => {
    try {
        // Log the entire request for debugging
        console.log('Full request:', {
            body: req.body,
            user: req.user,
            session: req.session
        });
        
        const {
            collaboration_name,
            collaboration_description,
            collaboration_status,
            collaboration_end_date,
            project_id_,
            collaborator_email,
            user_id_
        } = req.body;

        // Debug log for extracted values
        console.log('Extracted values:', {
            collaboration_name,
            project_id_,
            collaborator_email,
            user_id_
        });

        // Direct database query to find collaborator
        const [collaborators] = await db.execute(
            'SELECT * FROM users WHERE user_email = ?',
            [collaborator_email]
        );
        
        console.log('Found collaborator:', collaborators[0]); // Debug log

        if (!collaborators.length) {
            return res.status(404).json({ 
                error: 'Collaborator not found',
                email: collaborator_email
            });
        }

        const collaborator = collaborators[0];

        // Create admin collaboration first
        const [adminResult] = await db.execute(
            `INSERT INTO project_collaboration (
                project_id_,
                user_id_,
                user_collab_role,
                collaboration_name,
                collaboration_description,
                collaboration_status,
                collaboration_end_date
            ) VALUES (?, ?, 'admin', ?, ?, ?, ?)`,
            [
                project_id_,
                user_id_,
                collaboration_name,
                collaboration_description || null,
                collaboration_status || 'active',
                collaboration_end_date
            ]
        );

        // Then create member collaboration
        const [memberResult] = await db.execute(
            `INSERT INTO project_collaboration (
                project_id_,
                user_id_,
                user_collab_role,
                collaboration_name,
                collaboration_description,
                collaboration_status,
                collaboration_end_date
            ) VALUES (?, ?, 'member', ?, ?, ?, ?)`,
            [
                project_id_,
                collaborator.user_id_,
                collaboration_name,
                collaboration_description || null,
                collaboration_status || 'active',
                collaboration_end_date
            ]
        );

        // Return success response
        res.status(201).json({
            message: 'Collaboration created successfully',
            adminCollaboration: adminResult.insertId,
            memberCollaboration: memberResult.insertId
        });

    } catch (error) {
        // Enhanced error logging
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        res.status(500).json({ 
            error: 'Failed to create collaboration',
            details: error.message
        });
    }
});

// Get collaborations for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log('Fetching collaborations for user:', userId);

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const [collaborations] = await db.execute(`
            SELECT 
                pc.*,
                p.project_title,
                u.username,
                u.user_email,
                (SELECT COUNT(*) FROM project_collaboration 
                 WHERE project_id_ = pc.project_id_) as member_count
            FROM project_collaboration pc
            JOIN projects p ON pc.project_id_ = p.project_id_
            JOIN users u ON pc.user_id_ = u.user_id_
            WHERE pc.user_id_ = ?
            ORDER BY pc.joined_at DESC
        `, [userId]);

        console.log('Found collaborations:', collaborations);
        res.json(collaborations);

    } catch (error) {
        console.error('Error fetching collaborations:', error);
        res.status(500).json({ error: 'Failed to fetch collaborations' });
    }
});

// Get collaboration details
router.get('/:id', async (req, res) => {
    try {
        const [collaboration] = await db.execute(`
            SELECT 
                pc.*,
                p.project_title,
                u.username,
                u.user_email
            FROM project_collaboration pc
            JOIN projects p ON pc.project_id_ = p.project_id_
            JOIN users u ON pc.user_id_ = u.user_id_
            WHERE pc.project_collaboration_id_ = ?
        `, [req.params.id]);

        if (collaboration.length === 0) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        res.json(collaboration[0]);

    } catch (error) {
        console.error('Error fetching collaboration:', error);
        res.status(500).json({ error: 'Failed to fetch collaboration' });
    }
});

// Delete collaboration
router.delete('/:id', async (req, res) => {
    try {
        const collaborationId = req.params.id;
        console.log('Attempting to delete collaboration:', collaborationId);

        // Delete the collaboration
        const [result] = await db.execute(
            'DELETE FROM project_collaboration WHERE project_collaboration_id_ = ?',
            [collaborationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        res.json({ message: 'Collaboration deleted successfully' });
    } catch (error) {
        console.error('Error deleting collaboration:', error);
        res.status(500).json({ error: 'Failed to delete collaboration' });
    }
});

module.exports = router;