const mongoose = require('mongoose');

// Customer Schema
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    landmark: {
        type: String,
        trim: true,
    },
    pincode: {
        type: String,
        trim: true,
    },
    instructions: {
        type: String,
        trim: true,
    },
});

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Item price is required'],
        min: [0, 'Price cannot be negative'],
    },
    quantity: {
        type: Number,
        required: [true, 'Item quantity is required'],
        min: [1, 'Quantity must be at least 1'],
    },
});

// Main Order Schema
const orderSchema = new mongoose.Schema(
    {
        // Customer Information (nested object)
        customer: {
            type: customerSchema,
            required: [true, 'Customer information is required'],
        },

        // Order Items
        items: {
            type: [orderItemSchema],
            required: [true, 'Order items are required'],
            validate: {
                validator: function (items) {
                    return items && items.length > 0;
                },
                message: 'Order must contain at least one item',
            },
        },

        // Total Amount
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative'],
        },

        // Order Status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
            default: 'pending',
        },

        // Payment Information
        paymentMethod: {
            type: String,
            enum: ['cash-on-delivery', 'online'],
            default: 'cash-on-delivery',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },

        // Additional Notes
        notes: {
            type: String,
            trim: true,
        },

        // Order Number (auto-generated)
        orderNumber: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Pre-save hook to generate order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `CK${timestamp}${random}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
