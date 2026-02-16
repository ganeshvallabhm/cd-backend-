const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendCustomerOrderEmail = async (order) => {
    const items = order.items
        .map(
            (item) =>
                `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
        )
        .join("\n");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        text: `
Hi ${order.customer.name},

Your order has been successfully placed.

Order Number: ${order.orderNumber}

Items:
${items}

Total Amount: ₹${order.totalAmount}

Thank you for ordering!
    `,
    };

    await transporter.sendMail(mailOptions);
};

const sendAdminOrderEmail = async (order) => {
    const items = order.items
        .map(
            (item) =>
                `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
        )
        .join("\n");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Order Received - ${order.orderNumber}`,
        text: `
New order received.

Customer: ${order.customer.name}
Phone: ${order.customer.phone}
Address: ${order.customer.address}

Items:
${items}

Total Amount: ₹${order.totalAmount}
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendCustomerOrderEmail,
    sendAdminOrderEmail,
};
