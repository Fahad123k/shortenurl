const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const securityMiddleware = require("./middleware/security");
const limiter = require("./middleware/rateLimiter");
const routes = require("./Routes/index");
const cors = require("cors")

const app = express();

// Connect DB once at startup
connectDB();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // credentials: true,
}))

app.use(securityMiddleware);
app.use(bodyParser.json());
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: true }));



// Routes
app.use("/api", routes);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({ message: "okay" });
});

module.exports = app;
