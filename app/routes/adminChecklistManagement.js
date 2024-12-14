const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your database connection

router.delete('/:id', async (req, res) => {
    const checklistId = req.params.id;
    console.log('Deleting checklist item with ID:', checklistId); // Log the ID being deleted

    try {
        const result = await db.execute(
            'DELETE FROM unified_checklist WHERE unified_checklist_id_ = ?', // Ensure this matches your database schema
            [checklistId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Checklist item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Checklist item not found' });
        }
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        res.status(500).json({ error: 'Failed to delete checklist item' });
    }
}); 

module.exports = router;