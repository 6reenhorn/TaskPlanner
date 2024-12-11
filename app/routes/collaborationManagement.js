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
                 WHERE project_id_ = pc.project_id_ AND collaboration_name = pc.collaboration_name) as member_count
            FROM project_collaboration pc
            JOIN projects p ON pc.project_id_ = p.project_id_
            JOIN users u ON pc.user_id_ = u.user_id_
            WHERE pc.user_id_ = ? AND pc.leave_at IS NULL
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

// Delete entire collaboration (admin/creator only)
router.delete('/:id', async (req, res) => {
    try {
        const collaborationId = req.params.id;
        const userRole = req.headers['x-user-role'];
        const userId = req.headers['x-user-id'];
        const isFullDelete = req.headers['x-full-delete'] === 'true';

        console.log('Delete request:', { collaborationId, userRole, userId, isFullDelete });

        // Get collaboration details first
        const [collaborationDetails] = await db.execute(
            `SELECT pc.project_id_, pc.collaboration_name, pc.user_id_, pc.user_collab_role 
             FROM project_collaboration pc 
             WHERE pc.project_collaboration_id_ = ?`,
            [collaborationId]
        );

        if (collaborationDetails.length === 0) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        const collaboration = collaborationDetails[0];

        // Check permissions
        const isSystemAdmin = userRole === 'admin';
        const isCollabCreator = collaboration.user_id_ === parseInt(userId) && 
                               collaboration.user_collab_role === 'admin';

        if (!isSystemAdmin && !isCollabCreator) {
            return res.status(403).json({ error: 'Not authorized to delete this collaboration' });
        }

        let result;
        if (isFullDelete) {
            // Delete all related collaboration entries for full deletion
            [result] = await db.execute(
                `DELETE FROM project_collaboration 
                 WHERE project_id_ = ? AND collaboration_name = ?`,
                [collaboration.project_id_, collaboration.collaboration_name]
            );

            console.log('Full delete result:', {
                projectId: collaboration.project_id_,
                collaborationName: collaboration.collaboration_name,
                affectedRows: result.affectedRows
            });
        } else {
            // Delete only the specific collaboration entry
            [result] = await db.execute(
                'DELETE FROM project_collaboration WHERE project_collaboration_id_ = ?',
                [collaborationId]
            );
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No collaborations were deleted' });
        }

        res.json({ 
            message: isFullDelete ? 'Collaboration deleted for all users' : 'Collaboration deleted',
            deletedEntries: result.affectedRows
        });

    } catch (error) {
        console.error('Error deleting collaboration:', error);
        res.status(500).json({ 
            error: 'Failed to delete collaboration',
            details: error.message
        });
    }
});

// Member leaving collaboration
router.post('/:id/leave', async (req, res) => {
    try {
        const collaborationId = req.params.id;
        const { user_id_ } = req.body;

        console.log('Leave request:', { collaborationId, user_id_ });

        // First verify this is a member trying to leave
        const [memberCheck] = await db.execute(
            `SELECT * FROM project_collaboration 
             WHERE project_collaboration_id_ = ? AND user_id_ = ?`,
            [collaborationId, user_id_]
        );

        if (memberCheck.length === 0) {
            return res.status(403).json({ 
                error: 'Collaboration not found or user not authorized' 
            });
        }

        // Delete the member's collaboration entry completely
        const [result] = await db.execute(
            `DELETE FROM project_collaboration 
             WHERE project_collaboration_id_ = ? AND user_id_ = ?`,
            [collaborationId, user_id_]
        );

        console.log('Leave result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Failed to remove collaboration' });
        }

        // Get updated member count
        const [countResult] = await db.execute(
            `SELECT COUNT(*) as remaining_members 
             FROM project_collaboration 
             WHERE project_id_ = ? AND collaboration_name = ?`,
            [memberCheck[0].project_id_, memberCheck[0].collaboration_name]
        );

        res.json({ 
            message: 'Successfully removed from collaboration',
            collaborationId: collaborationId,
            affectedRows: result.affectedRows,
            remainingMembers: countResult[0].remaining_members
        });

    } catch (error) {
        console.error('Error removing from collaboration:', error);
        res.status(500).json({ 
            error: 'Failed to remove from collaboration',
            details: error.message 
        });
    }
});

module.exports = router;