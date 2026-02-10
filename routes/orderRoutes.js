const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { sendOrderEmail } = require('../services/emailService');

// Create a new order
router.post('/', async (req, res) => {
    try {
        console.log('📥 Received POST /api/orders request');
        console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));

        const orderData = req.body;

        // Validate that required fields are present
        if (!orderData.customer) {
            console.log('❌ Validation Error: Missing customer object');
            return res.status(400).json({
                success: false,
                message: 'Customer information is required',
            });
        }

        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            console.log('❌ Validation Error: Missing or empty items array');
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item',
            });
        }

        if (orderData.totalAmount === undefined || orderData.totalAmount === null) {
            console.log('❌ Validation Error: Missing totalAmount');
            return res.status(400).json({
                success: false,
                message: 'Total amount is required',
            });
        }

        // Create new order instance
        const order = new Order(orderData);

        console.log('💾 Saving order to database...');
        // Save order to database
        const savedOrder = await order.save();

        console.log('✅ Order saved successfully:', savedOrder.orderNumber);

        // Send confirmation email (non-blocking - don't fail order if email fails)
        if (savedOrder.customer && savedOrder.customer.email) {
            try {
                console.log('📧 Sending order confirmation email...');
                const emailResult = await sendOrderEmail(savedOrder);

                if (emailResult.success) {
                    console.log('✅ Confirmation email sent to:', savedOrder.customer.email);
                } else {
                    console.warn('⚠️ Email sending failed:', emailResult.error);
                }
            } catch (emailError) {
                // Log the error but don't fail the order creation
                console.error('⚠️ Error sending confirmation email:', emailError.message);
                console.log('📦 Order created successfully despite email failure');
            }
        } else {
            console.log('ℹ️ No customer email provided, skipping confirmation email');
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: savedOrder,
        });
    } catch (error) {
        console.error('❌ Error creating order:', error);

        if (error.name === 'ValidationError') {
            console.log('📋 Validation Errors:', error.errors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message),
            });
        }

        if (error.code === 11000) {
            console.log('⚠️ Duplicate key error:', error.keyValue);
            return res.status(400).json({
                success: false,
                message: 'Duplicate order detected',
                error: 'An order with this information already exists',
            });
        }

        console.error('💥 Unexpected error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
        });
    }
});

// Get all orders
router.get('/', async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;

        const query = status ? { status } : {};
        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message,
        });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message,
        });
    }
});

// Get order by order number
router.get('/number/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message,
        });
    }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order,
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message,
        });
    }
});

// Delete order (admin only - add authentication middleware in production)
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message,
        });
    }
});

module.exports = router;
