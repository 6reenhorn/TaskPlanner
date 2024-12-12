const express = require('express');
const router = express.Router();
const pool = require('../db');

// Complete Checklist Item
router.post('/complete', async (req, res) => {
    console.log('Complete checklist request received');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    const { checklistId } = req.body;

    // Validate input
    if (!checklistId) {
        console.error('No checklist ID provided');
        return res.status(400).json({ 
            success: false, 
            message: 'Checklist ID is required' 
        });
    }
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update checklist item
        await connection.execute(
            'UPDATE unified_checklist SET is_completed = TRUE, checked_at = CURRENT_TIMESTAMP WHERE unified_checklist_id_ = ?',
            [checklistId]
        );

        // Optionally update related task status
        const [checklistItem] = await connection.execute(
            'SELECT related_id_ FROM unified_checklist WHERE unified_checklist_id_ = ?',
            [checklistId]
        );

        if (checklistItem.length > 0) {
            await connection.execute(
                'UPDATE tasks SET task_status = "Completed" WHERE task_id_ = ?',
                [checklistItem[0].related_id_]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Item completed successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error completing checklist item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to complete checklist item',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

module.exports = router; 