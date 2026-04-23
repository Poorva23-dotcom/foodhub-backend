const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await mongoose.connection.db.collection('products').find({}).toArray();
        res.json({ success: true, count: products.length, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single product by ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await mongoose.connection.db.collection('products').findOne({ id: parseInt(req.params.id) });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await mongoose.connection.db.collection('users').findOne({ email: email, password: password });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        res.json({ success: true, message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
