const Order = require("../models/Order");
const generateOrderNumber = require("../utils/generateOrderNumber");
const mongoose = require("mongoose");
const {
    sendCustomerOrderEmail,
    sendAdminOrderEmail,
} = require("../services/emailService");

// Helper to handle duplicate key errors with retry
const createOrderWithRetry = async (orderData, attempts = 0) => {
    try {
        orderData.orderNumber = generateOrderNumber();
        const order = new Order(orderData);
        await order.save();
        return order;
    } catch (error) {
        if (error.code === 11000 && attempts < 1) {
            console.warn("Duplicate order number detected, retrying...");
            return createOrderWithRetry(orderData, attempts + 1);
        }
        throw error;
    }
};

exports.createOrder = async (req, res) => {
    try {
        const orderData = req.body;

        // Security: Remove any client-sent orderNumber
        delete orderData.orderNumber;

        // Basic validation
        if (!orderData.customer || !orderData.items || orderData.items.length === 0 || !orderData.totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: customer, items, or totalAmount"
            });
        }

        // Create order with retry logic for orderNumber uniqueness
        const savedOrder = await createOrderWithRetry(orderData);

        // Send emails to customer and admin
        try {
            await sendCustomerOrderEmail(savedOrder);
            await sendAdminOrderEmail(savedOrder);
            console.log("Emails sent successfully");
        } catch (err) {
            console.log("Email error:", err.message);
        }

        res.status(201).json({
            success: true,
            orderId: savedOrder._id,
            orderNumber: savedOrder.orderNumber,
            data: savedOrder
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if id is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getOrderByOrderNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markOrderPaid = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndUpdate(
            id,
            {
                paymentStatus: "PAID",
                status: "PAID",
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // SEND EMAIL AFTER PAYMENT
        try {
            await sendCustomerOrderEmail(order);
            await sendAdminOrderEmail(order);
            console.log("Payment emails sent");
        } catch (err) {
            console.log("Email error:", err.message);
        }

        res.json({
            success: true,
            data: order,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
