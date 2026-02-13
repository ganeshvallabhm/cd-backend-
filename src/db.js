const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Attempting MongoDB connection...");
        console.log("Using URI:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.log("MongoDB Connection Failed:", error.message);
    }
};

module.exports = connectDB;
