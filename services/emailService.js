const nodemailer = require('nodemailer');

/**
 * Email Service for Order Confirmations
 * Uses Gmail SMTP to send order confirmation emails to customers
 */

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Send order confirmation email to customer
 * @param {Object} order - Order object from database
 * @param {Object} order.customer - Customer information
 * @param {string} order.customer.email - Customer email address
 * @param {string} order.customer.name - Customer name
 * @param {string} order.orderNumber - Unique order number
 * @param {number} order.totalAmount - Total order amount
 * @param {Array} order.items - Array of order items
 * @returns {Promise<Object>} - Email send result
 */
const sendOrderEmail = async (order) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 EMAIL SERVICE: Attempting to send order confirmation email');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Validate required environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            const errorMsg = 'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in environment variables.';
            console.error('❌ VALIDATION ERROR:', errorMsg);
            throw new Error(errorMsg);
        }

        // Log configuration status (without exposing password)
        console.log('✓ Email configuration validated');
        console.log('  Sender email:', process.env.EMAIL_USER);
        console.log('  Password configured:', process.env.EMAIL_PASSWORD ? 'Yes (hidden for security)' : 'No');

        // Validate order object
        console.log('\n📋 Validating order data...');

        if (!order || !order.customer || !order.customer.email) {
            const errorMsg = 'Invalid order object: customer email is required';
            console.error('❌ VALIDATION ERROR:', errorMsg);
            console.error('  Order:', order ? 'exists' : 'null/undefined');
            console.error('  Customer:', order?.customer ? 'exists' : 'missing');
            console.error('  Email:', order?.customer?.email || 'missing');
            throw new Error(errorMsg);
        }

        if (!order.orderNumber) {
            const errorMsg = 'Invalid order object: order number is required';
            console.error('❌ VALIDATION ERROR:', errorMsg);
            throw new Error(errorMsg);
        }

        if (order.totalAmount === undefined || order.totalAmount === null) {
            const errorMsg = 'Invalid order object: total amount is required';
            console.error('❌ VALIDATION ERROR:', errorMsg);
            throw new Error(errorMsg);
        }

        // Log order details
        console.log('✓ Order data validated successfully');
        console.log('  Order Number:', order.orderNumber);
        console.log('  Customer Name:', order.customer.name || 'Not provided');
        console.log('  Customer Email:', order.customer.email);
        console.log('  Total Amount: ₹' + order.totalAmount.toFixed(2));
        console.log('  Items Count:', order.items?.length || 0);

        // Create transporter
        console.log('\n🔧 Creating email transporter...');
        const transporter = createTransporter();
        console.log('✓ Transporter created successfully');

        // Format order items for email body
        const itemsList = order.items && order.items.length > 0
            ? order.items.map(item =>
                `  - ${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`
            ).join('\n')
            : '  No items';

        // Email subject
        const subject = `Order Confirmation - ${order.orderNumber}`;

        // Email body (plain text)
        const textBody = `
Dear ${order.customer.name || 'Customer'},

Thank you for your order!

Order Details:
--------------
Order ID: ${order.orderNumber}
Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Items Ordered:
${itemsList}

Total Amount: ₹${order.totalAmount.toFixed(2)}

Delivery Address:
${order.customer.address}
${order.customer.landmark ? 'Landmark: ' + order.customer.landmark : ''}
${order.customer.pincode ? 'Pincode: ' + order.customer.pincode : ''}

Contact: ${order.customer.phone}

Payment Method: ${order.paymentMethod || 'Cash on Delivery'}
Payment Status: ${order.paymentStatus || 'Pending'}

${order.customer.instructions ? 'Special Instructions: ' + order.customer.instructions : ''}

Thank you for choosing CK Homemade Foods!
We appreciate your business and look forward to serving you again.

Best regards,
CK Homemade Foods Team

---
If you have any questions, please contact us at ${process.env.EMAIL_USER}
        `.trim();

        // Email body (HTML)
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .order-details {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
        .items-list {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }
        .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #4CAF50;
            margin: 15px 0;
        }
        .footer {
            background-color: #333;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 0 0 5px 5px;
            font-size: 0.9em;
        }
        .thank-you {
            font-size: 1.1em;
            color: #4CAF50;
            font-weight: bold;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Order Confirmation</h1>
        <p>Order #${order.orderNumber}</p>
    </div>
    
    <div class="content">
        <p>Dear ${order.customer.name || 'Customer'},</p>
        
        <div class="thank-you">
            Thank you for your order!
        </div>
        
        <div class="order-details">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus || 'Pending'}</p>
        </div>
        
        <div class="items-list">
            <h3>Items Ordered</h3>
            ${order.items && order.items.length > 0
                ? order.items.map(item => `
                    <p>• ${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}</p>
                  `).join('')
                : '<p>No items</p>'
            }
        </div>
        
        <div class="total">
            Total Amount: ₹${order.totalAmount.toFixed(2)}
        </div>
        
        <div class="order-details">
            <h3>Delivery Address</h3>
            <p>${order.customer.address}</p>
            ${order.customer.landmark ? `<p><strong>Landmark:</strong> ${order.customer.landmark}</p>` : ''}
            ${order.customer.pincode ? `<p><strong>Pincode:</strong> ${order.customer.pincode}</p>` : ''}
            <p><strong>Contact:</strong> ${order.customer.phone}</p>
            ${order.customer.instructions ? `<p><strong>Special Instructions:</strong> ${order.customer.instructions}</p>` : ''}
        </div>
        
        <p style="margin-top: 20px;">We appreciate your business and look forward to serving you again!</p>
        
        <p>Best regards,<br>
        <strong>CK Homemade Foods Team</strong></p>
    </div>
    
    <div class="footer">
        <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
        <p>&copy; ${new Date().getFullYear()} CK Homemade Foods. All rights reserved.</p>
    </div>
</body>
</html>
        `.trim();

        // Email options
        const mailOptions = {
            from: `"CK Homemade Foods" <${process.env.EMAIL_USER}>`,
            to: order.customer.email,
            subject: subject,
            text: textBody,
            html: htmlBody,
        };

        // Send email
        console.log('\n📤 Sending email...');
        console.log('  From:', mailOptions.from);
        console.log('  To:', mailOptions.to);
        console.log('  Subject:', mailOptions.subject);

        const info = await transporter.sendMail(mailOptions);

        console.log('\n✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ORDER CONFIRMATION EMAIL SENT SUCCESSFULLY');
        console.log('✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  Message ID:', info.messageId);
        console.log('  Recipient:', order.customer.email);
        console.log('  Order Number:', order.orderNumber);
        console.log('  Response:', info.response || 'Email accepted');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return {
            success: true,
            messageId: info.messageId,
            recipient: order.customer.email,
            orderNumber: order.orderNumber,
        };

    } catch (error) {
        console.error('\n❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERROR SENDING ORDER CONFIRMATION EMAIL');
        console.error('❌ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('  Error Type:', error.name || 'Unknown');
        console.error('  Error Message:', error.message);
        console.error('  Order Number:', order?.orderNumber || 'unknown');
        console.error('  Recipient:', order?.customer?.email || 'unknown');

        // Log additional error details if available
        if (error.code) {
            console.error('  Error Code:', error.code);
        }
        if (error.command) {
            console.error('  SMTP Command:', error.command);
        }
        if (error.responseCode) {
            console.error('  Response Code:', error.responseCode);
        }

        // Full error stack for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('\n  Full Error Stack:');
            console.error(error.stack);
        }

        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Return error details instead of throwing
        return {
            success: false,
            error: error.message,
            errorCode: error.code || 'UNKNOWN',
            recipient: order?.customer?.email || 'unknown',
            orderNumber: order?.orderNumber || 'unknown',
        };
    }
};

module.exports = {
    sendOrderEmail,
};
