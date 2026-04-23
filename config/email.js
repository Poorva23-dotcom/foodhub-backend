const nodemailer = require('nodemailer');

// Configure email transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail app password
    }
});

const sendOrderConfirmation = async (order, userEmail, userName) => {
    // Create bill/order summary HTML
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"FoodHub" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `🎉 Order Confirmed! Order #${order.id} - FoodHub`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                    .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th { background: #667eea; color: white; padding: 10px; }
                    .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; padding-top: 10px; border-top: 2px solid #ddd; }
                    .delivery-info { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .btn { display: inline-block; background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍕 FoodHub</h1>
                        <p>Order Confirmed!</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${userName}! 👋</h2>
                        <p>Thank you for ordering from FoodHub. Your order has been received and is being prepared.</p>
                        
                        <div class="delivery-info">
                            <h3>🚚 Estimated Delivery Time: 30-40 minutes</h3>
                            <p>Your delicious food will arrive soon!</p>
                        </div>
                        
                        <div class="order-details">
                            <h3>📋 Order Details</h3>
                            <p><strong>Order ID:</strong> #${order.id}</p>
                            <p><strong>Order Date:</strong> ${order.created_at}</p>
                            <p><strong>Payment Method:</strong> ${order.payment_method}</p>
                            
                            <table>
                                <thead>
                                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                            
                            <div class="total">
                                <p>Subtotal: ₹${order.subtotal}</p>
                                <p>Delivery Fee: ₹${order.delivery_fee}</p>
                                <p>Tax: ₹${order.tax}</p>
                                <h3>Grand Total: ₹${order.grand_total}</h3>
                            </div>
                        </div>
                        
                        <div class="delivery-info">
                            <h3>📍 Delivery Address</h3>
                            <p>${order.delivery_address}</p>
                        </div>
                        
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:3000/orders" class="btn">Track Your Order</a>
                        </p>
                        
                        <p style="margin-top: 20px;">Need help? Contact us at support@foodhub.com</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 FoodHub. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Order confirmation email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
};

module.exports = { sendOrderConfirmation };