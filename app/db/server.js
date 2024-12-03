const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const taskRoutes = require('../routes/taskManagement');
const projectRoutes = require('../routes/projectManagement');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/tasks', taskRoutes);
app.use('/projects', projectRoutes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});