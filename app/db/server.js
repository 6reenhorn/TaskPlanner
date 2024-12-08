const express = require('express');
const cors = require('cors');
const db = require('../db');  // Point directly to db.js in app folder
const taskRoutes = require('../routes/taskManagement');
const projectRoutes = require('../routes/projectManagement');
const authRoutes = require('../routes/authManagement');
const projectTaskRoutes = require('../routes/projectTaskManagement');
const activityRoutes = require('../routes/activityManagement');

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5503',
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

app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/project-tasks', projectTaskRoutes);
app.use('/api/activities', activityRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Ready to receive requests...');
});