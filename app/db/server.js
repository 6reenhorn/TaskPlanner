const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2/promise');

// Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'null2504',
    database: 'taskplanner'
});

// Export pool before setting up routes
module.exports = pool;

app.use(cors({
    origin: 'http://127.0.0.1:5501',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Mount routes
app.use('/tasks', require('../routes/taskManagement'));
app.use('/projects', require('../routes/projectManagement'));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});