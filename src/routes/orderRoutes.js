const express = require("express");
const router = express.Router();

const Order = require("../../models/Order");

// CREATE ORDER
// CREATE ORDER
router.post("/", async (req, res) => {
    try {
        console.log("POST /api/orders HIT");
        console.log(req.body);

        const orderData = req.body;

        // Generate unique order number
        orderData.orderNumber = "ORD-" + Date.now();

        const order = new Order(orderData);
        const savedOrder = await order.save();

        res.status(201).json({
            success: true,
            orderId: savedOrder._id
        });
    } catch (error) {
        console.error("POST route error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET ALL ORDERS (optional)
router.get("/", async (req, res, next) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
