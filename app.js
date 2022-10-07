// Package Imports
const express = require('express');
const databaseConnection = require('./utils/database.util');
const cors = require('cors');

// Custome Imports
const mainRoute = require('./routes/main.route');
const errorHandler = require('./controllers/Error/error.controller');

// Local variable
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());


// static file serving
app.use('/uploads', express.static('uploads'));

// Routes
app.use(mainRoute);

// Error Handler
app.use(errorHandler);

// Connecting Database and starting Server
databaseConnection().then(() => {
    app.listen(port,() => {
        console.log(`Server is Running on port ${port}`);
    })
}).catch((err) => {
    if (err) throw err;
});