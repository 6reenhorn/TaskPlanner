const express = require('express');
const cors = require('cors');
const db = require('../db');  // Correct path to point to db.js in the app folder
const taskRoutes = require('../routes/taskManagement');
const projectRoutes = require('../routes/projectManagement');

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

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
    console.log('Ready to receive requests...');
});