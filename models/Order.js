const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        // Ensure it's never set by client
        immutable: true
    },

    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },

    items: [
        {
            productId: { type: String }, // Optional if you want to link to Product model later
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    },

    status: {
        type: String,
        enum: ["PLACED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "PLACED"
    },

    razorpayOrderId: {
        type: String
    },

    razorpayPaymentId: {
        type: String
    }

}, { timestamps: true });

// Ensure virtuals are included in toJSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);
