const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const taskRoutes = require('../routes/taskManagement');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Add this line to debug incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Add a root route
app.get('/', (req, res) => {
    res.json({ message: 'Task Management API is running' });
});

// Mount the task routes
app.use('/tasks', taskRoutes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});