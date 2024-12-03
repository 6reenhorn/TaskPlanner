const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'null2504',
    database: 'taskplanner'
}).promise();

module.exports = pool;

