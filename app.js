
const express = require("express");
const cors = require("cors");

const orderRoutes = require("./routes/orderRoutes");

const app = express();

// ---- CRITICAL MIDDLEWARE ----
app.use(cors());
app.use(express.json());

// ---- TEST ROUTE ----
app.get("/", (req, res) => {
    res.json({ message: "Backend is working" });
});

// ---- MAIN ROUTES ----
app.use("/api/orders", orderRoutes);

// ---- ERROR HANDLER ----
app.use((err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: err.message,
    });
});

module.exports = app;
