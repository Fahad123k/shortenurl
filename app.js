const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const securityMiddleware = require('./middleware/security');
const limiter = require('./middleware/rateLimiter');
const routes = require('./Routes/index');


const app = express();

// Connect to database
connectDB();

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(securityMiddleware);
app.use(bodyParser.json());
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: true })); // For form data
app.use(express.static('public')); // For static files


// Routes
app.use('/api', routes);

module.exports = app;