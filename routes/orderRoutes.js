const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { markOrderPaid } = require("../controllers/orderController");

// CREATE NEW ORDER
router.post('/', orderController.createOrder);

// GET ALL ORDERS
router.get('/', orderController.getAllOrders);

// GET ORDER BY ORDER NUMBER (Must come before /:id)
router.get('/number/:orderNumber', orderController.getOrderByOrderNumber);

// GET ORDER BY ID
router.get('/:id', orderController.getOrderById);

// UPDATE ORDER STATUS
router.patch('/:id/status', orderController.updateOrderStatus);

// DELETE ORDER
router.delete('/:id', orderController.deleteOrder);

// MARK ORDER AS PAID (PAYMENT SUCCESS WEBHOOK)
router.patch(
    "/:id/payment-success",
    markOrderPaid
);

module.exports = router;
