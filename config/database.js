const mongoose = require("mongoose");

let isConnected;

async function connectDB() {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = db.connections[0].readyState;
        console.log("MongoDB connected");
    } catch (err) {
        console.error(" MongoDB connection error:", err);
    }
}

module.exports = connectDB;
