const mysql = require('mysql2');

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'null2504',
    database: 'taskplanner'
}).promise();

module.exports = db;

