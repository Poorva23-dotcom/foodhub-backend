const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        const safeUsers = users.map(user => {
            delete user.password;
            return user;
        });
        res.json({ success: true, count: safeUsers.length, users: safeUsers });
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

// REGISTER - Create new user (FIXED)
router.post('/register', async (req, res) => {
    console.log('=== REGISTER API CALLED ===');
    console.log('Request body:', req.body);
    
    try {
        const { name, email, password, phone, address } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email and password are required' 
            });
        }
        
        // Check if user already exists
        const existingUser = await mongoose.connection.db.collection('users').findOne({ email: email });
        
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists with this email' 
            });
        }
        
        // Get the highest id
        const lastUser = await mongoose.connection.db.collection('users').find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
        
        // Create new user
        const newUser = {
            id: newId,
            name: name,
            email: email,
            password: password,
            phone: phone || '',
            address: address || '',
            role: 'user',
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        console.log('Creating user:', newUser);
        
        await mongoose.connection.db.collection('users').insertOne(newUser);
        
        console.log('User created successfully!');
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful! Please login.',
            user: userWithoutPassword 
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    console.log('=== LOGIN API CALLED ===');
    console.log('Request body:', req.body);
    
    try {
        const { email, password } = req.body;
        
        const user = await mongoose.connection.db.collection('users').findOne({ email: email });
        
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        if (user.password !== password) {
            console.log('Password incorrect for:', email);
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        console.log('Login successful for:', email);
        
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ 
            success: true, 
            message: 'Login successful!', 
            user: userWithoutPassword 
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get current user
router.get('/user/:id', async (req, res) => {
    try {
        const user = await mongoose.connection.db.collection('users').findOne({ id: parseInt(req.params.id) });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

module.exports = router;