const express = require('express');
const cors = require('cors');
const db = require('../db');  // This is correct
const taskRoutes = require('../routes/taskManagement');
const projectRoutes = require('../routes/projectManagement');
const authRoutes = require('../routes/authManagement');
const projectTaskRoutes = require('../routes/projectTaskManagement');
const activityRoutes = require('../routes/activityManagement');
const collaborationRoutes = require('../routes/collaborationManagement');
const checklistRoutes = require('../routes/checklistManagement');
const allDataRoutes = require('../routes/allDataManagement'); // Adjust the path as necessary
const adminTaskRoutes = require('../routes/adminTaskManagement'); // Adjust the path as necessary
const adminUserRoutes = require('../routes/adminUserManagement'); // Adjust the path as necessary
const adminProjectCollaborationRoutes = require('../routes/adminProjectCollaborationManagement'); // Adjust the path as necessary
const adminProjectRoutes = require('../routes/adminProjectManagement'); // Adjust the path as necessary
const adminChecklistRoutes = require('../routes/adminChecklistManagement'); // Adjust the path as necessary

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5504',
    credentials: true
}));

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Debug route to check tasks
app.get('/debug/tasks', async (req, res) => {
    try {
        const [tasks] = await db.execute('SELECT * FROM tasks');
        res.json(tasks);
    } catch (err) {
        console.error('Debug route error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Add debug middleware for all routes
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.body
    });
    next();
});


// Mount routes
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/project-tasks', projectTaskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/project-collaborations', collaborationRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/all', allDataRoutes); // This will make the route accessible at /api/all/tasks
app.use('/api/admin/tasks', adminTaskRoutes); // Add this line
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/projectCollaborations', adminProjectCollaborationRoutes);
app.use('/api/admin/projects', adminProjectRoutes);
app.use('/api/admin/checklists', adminChecklistRoutes);


// Error handler
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({ 
        error: 'Something broke!',
        details: err.message 
    });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Ready to receive requests...');
});