require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email...');
    console.log('Email user:', process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    try {
        await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'Test Email from FoodHub',
            text: 'If you receive this, email is working!'
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.log('❌ Email failed:', error.message);
    }
}

testEmail();