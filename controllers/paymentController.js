const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const {
    sendCustomerOrderEmail,
    sendAdminOrderEmail,
} = require("../services/emailService");

exports.createRazorpayOrder = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(400).json({
                success: false,
                message: "Razorpay not configured",
            });
        }

        const { amount, orderId } = req.body;

        const options = {
            amount: amount * 100, // paisa
            currency: "INR",
            receipt: orderId,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            razorpayOrder,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(400).json({
                success: false,
                message: "Razorpay not configured",
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expected !== razorpay_signature) {
            return res.status(400).json({ success: false });
        }

        // UPDATE ORDER
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: "PAID",
                status: "PAID",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
            },
            { new: true }
        );

        // SEND EMAIL (you already built this)
        await sendCustomerOrderEmail(order);
        await sendAdminOrderEmail(order);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
