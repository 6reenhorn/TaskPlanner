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

// Get collaborations for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Fetching collaborations for user:', userId);

        const [collaborations] = await db.execute(`
            SELECT 
                pc.*,
                p.project_title as project_name,
                p.project_description,
                p.project_status,
                p.project_start_date,
                p.project_end_date
            FROM project_collaboration pc
            JOIN projects p ON pc.project_id_ = p.project_id_
            WHERE pc.user_id_ = ?
            OR pc.user_id_ = ?
        `, [userId, userId]);

        console.log('Found collaborations:', collaborations);
        res.json(collaborations);
    } catch (error) {
        console.error('Error fetching user collaborations:', error);
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
        const { user_id_, is_admin } = req.body;

        console.log('Delete request:', { collaborationId, user_id_, is_admin });

        if (!user_id_) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Get collaboration details
        const [collaborations] = await db.execute(`
            SELECT * FROM project_collaboration 
            WHERE project_collaboration_id_ = ?
        `, [collaborationId]);

        if (collaborations.length === 0) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        const collaboration = collaborations[0];
        console.log('Found collaboration:', collaboration);

        // Check if user is admin of this collaboration
        const [userCollab] = await db.execute(`
            SELECT user_collab_role 
            FROM project_collaboration 
            WHERE project_collaboration_id_ = ? 
            AND user_id_ = ?
            AND user_collab_role = 'admin'
        `, [collaborationId, user_id_]);

        const isAdmin = userCollab.length > 0;
        console.log('Is admin:', isAdmin);

        if (is_admin && isAdmin) {
            // Admin deleting - remove all related collaborations
            console.log('Performing admin delete for collaboration');
            const [result] = await db.execute(`
                DELETE FROM project_collaboration 
                WHERE project_id_ = ? 
                AND collaboration_name = ?
            `, [collaboration.project_id_, collaboration.collaboration_name]);

            console.log('Admin delete result:', result);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'No collaborations found to delete' });
            }

            res.json({ 
                message: 'Collaboration deleted for all members',
                deletedCount: result.affectedRows,
                isFullDelete: true
            });
        } else if (!is_admin) {
            // Member leaving - only update their record
            console.log('Marking member leave for user:', user_id_);
            const [result] = await db.execute(`
                UPDATE project_collaboration 
                SET leave_at = CURRENT_TIMESTAMP
                WHERE project_collaboration_id_ = ? 
                AND user_id_ = ?
            `, [collaborationId, user_id_]);

            console.log('Member leave result:', result);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Collaboration not found or already left' });
            }

            res.json({ 
                message: 'Successfully left the collaboration',
                isFullDelete: false
            });
        } else {
            return res.status(403).json({ error: 'Not authorized to delete this collaboration' });
        }
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

// Get team members for a collaboration
router.get('/:id/members', async (req, res) => {
    try {
        const collaborationId = req.params.id;
        console.log('Fetching members for collaboration:', collaborationId);

        // Get all members in this collaboration group (matching collaboration_name and project_id_)
        const [members] = await db.execute(`
            SELECT DISTINCT 
                u.user_id_,
                u.username,
                u.user_email,
                pc.user_collab_role,
                pc.joined_at
            FROM project_collaboration pc1
            JOIN project_collaboration pc ON pc.project_id_ = pc1.project_id_ 
                AND pc.collaboration_name = pc1.collaboration_name
            JOIN users u ON pc.user_id_ = u.user_id_
            WHERE pc1.project_collaboration_id_ = ?
                AND pc.leave_at IS NULL
            ORDER BY 
                CASE WHEN pc.user_collab_role = 'admin' THEN 1 ELSE 2 END,
                pc.joined_at ASC
        `, [collaborationId]);

        console.log('Found members:', members);
        res.json(members);

    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ 
            error: 'Failed to fetch team members',
            details: error.message 
        });
    }
});

// Get tasks for a collaboration
router.get('/:id/tasks', async (req, res) => {
    try {
        const collaborationId = req.params.id;
        console.log('Fetching tasks for collaboration:', collaborationId);

        // First get the project_id_ from the collaboration
        const [collaboration] = await db.execute(`
            SELECT project_id_ 
            FROM project_collaboration 
            WHERE project_collaboration_id_ = ?
        `, [collaborationId]);

        if (collaboration.length === 0) {
            return res.status(404).json({ error: 'Collaboration not found' });
        }

        // Get all tasks for this project using the new query with proper joins
        const [tasks] = await db.execute(`
            SELECT 
                t.*,
                u.username,
                pta.project_task_id_,
                ta.assigned_to_,
                au.username as assigned_username
            FROM tasks t
            JOIN project_task_assignment pta ON t.task_id_ = pta.task_id_
            LEFT JOIN users u ON t.user_id_ = u.user_id_
            LEFT JOIN task_assignments ta ON t.task_id_ = ta.task_id_
            LEFT JOIN users au ON ta.assigned_to_ = au.user_id_
            WHERE pta.project_id_ = ?
            ORDER BY t.task_due_date ASC,
                CASE t.task_priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                    ELSE 4
                END
        `, [collaboration[0].project_id_]);

        console.log('Found tasks:', tasks);
        res.json(tasks);

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ 
            error: 'Failed to fetch tasks',
            details: error.message 
        });
    }
});

// Assign task to team member
router.post('/task-assignments', async (req, res) => {
    try {
        const { task_id_, assigned_to_, assigned_by_, project_collaboration_id_ } = req.body;

        if (!task_id_ || !assigned_to_ || !assigned_by_ || !project_collaboration_id_) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // First, verify the project collaboration
        const [collaborationCheck] = await db.execute(
            `SELECT project_id_ 
             FROM project_collaboration 
             WHERE project_collaboration_id_ = ?`,
            [project_collaboration_id_]
        );

        if (collaborationCheck.length === 0) {
            return res.status(400).json({ error: 'Invalid collaboration' });
        }

        // Verify task is part of the project
        const [taskProjectCheck] = await db.execute(
            `SELECT project_id_ 
             FROM project_task_assignment 
             WHERE task_id_ = ? AND project_id_ = ?`,
            [task_id_, collaborationCheck[0].project_id_]
        );

        if (taskProjectCheck.length === 0) {
            return res.status(400).json({ error: 'Task not associated with this project' });
        }

        // Check if user is authorized to assign tasks (is part of the collaboration)
        const [assignerCheck] = await db.execute(
            `SELECT user_collab_role 
             FROM project_collaboration 
             WHERE project_collaboration_id_ = ? AND user_id_ = ?`,
            [project_collaboration_id_, assigned_by_]
        );

        if (assignerCheck.length === 0 || 
            (assignerCheck[0].user_collab_role !== 'admin' && assignerCheck[0].user_collab_role !== 'member')) {
            return res.status(403).json({ error: 'Not authorized to assign tasks' });
        }

        // Check if assignee is part of the collaboration
        const [assigneeCheck] = await db.execute(
            `SELECT project_collaboration_id_
             FROM project_collaboration 
             WHERE project_id_ = ? AND user_id_ = ?`,
            [collaborationCheck[0].project_id_, assigned_to_]
        );

        if (assigneeCheck.length === 0) {
            return res.status(400).json({ error: 'Assignee must be a member of the collaboration' });
        }

        // Remove any existing assignments for this task
        await db.execute(
            'DELETE FROM task_assignments WHERE task_id_ = ?',
            [task_id_]
        );

        // Create new task assignment
        const [result] = await db.execute(
            `INSERT INTO task_assignments 
             (project_collaboration_id_, task_id_, assigned_to_, assigned_by_)
             VALUES (?, ?, ?, ?)`,
            [project_collaboration_id_, task_id_, assigned_to_, assigned_by_]
        );

        // Update the task's user_id_ to the assigned user
        await db.execute(
            `UPDATE tasks SET user_id_ = ? WHERE task_id_ = ?`,
            [assigned_to_, task_id_]
        );

        res.json({
            message: 'Task assigned successfully',
            assignment_id: result.insertId
        });

    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ 
            error: 'Failed to assign task',
            details: error.message
        });
    }
});

module.exports = router;