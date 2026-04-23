const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { sendOrderConfirmation } = require('./config/email');
const Razorpay = require('razorpay');
const crypto = require('crypto');

console.log('=== SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('PORT from env:', process.env.PORT);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============ HEALTH CHECK ROUTE (For Render) ============
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ ALL API ROUTES ============

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// REGISTER - Create new user
app.post('/api/register', async (req, res) => {
    console.log('=== REGISTER API CALLED ===');
    
    try {
        const { name, email, password, phone, address, role } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email and password are required' 
            });
        }
        
        const existingUser = await mongoose.connection.db.collection('users').findOne({ email: email });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists with this email' 
            });
        }
        
        const lastUser = await mongoose.connection.db.collection('users').find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
        
        const newUser = {
            id: newId,
            name: name,
            email: email,
            password: password,
            phone: phone || '',
            address: address || '',
            role: role || 'user',
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        await mongoose.connection.db.collection('users').insertOne(newUser);
        
        console.log('User created successfully!');
        
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful! Please login.'
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    console.log('=== LOGIN API CALLED ===');
    
    try {
        const { email, password } = req.body;
        
        const user = await mongoose.connection.db.collection('users').findOne({ email: email });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ 
            success: true, 
            message: 'Login successful!', 
            user: userWithoutPassword 
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await mongoose.connection.db.collection('products').find({}).toArray();
        res.json({ success: true, count: products.length, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
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

// Get all users
app.get('/api/users', async (req, res) => {
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

// Get single user by ID
app.get('/api/user/:id', async (req, res) => {
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

// Get reviews for a product
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await mongoose.connection.db.collection('reviews').find({ product_id: parseInt(req.params.id) }).toArray();
        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test data route
app.get('/api/test-data', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.collections();
        const collectionNames = collections.map(c => c.collectionName);
        const stats = {};
        
        for (let collection of collections) {
            stats[collection.collectionName] = await collection.countDocuments();
        }
        
        res.json({
            success: true,
            databaseName: mongoose.connection.db.databaseName,
            collections: collectionNames,
            counts: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ORDERS ROUTES ============

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await mongoose.connection.db.collection('orders').find({}).sort({ id: -1 }).toArray();
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new order with stock update
app.post('/api/orders', async (req, res) => {
    console.log('=== ORDER PLACED ===');
    
    try {
        const { user_id, user_name, user_email, items, subtotal, delivery_fee, tax, grand_total, payment_method, delivery_address, status } = req.body;
        
        if (!user_id || !items || !grand_total) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }
        
        // Check stock availability
        for (const item of items) {
            const product = await mongoose.connection.db.collection('products').findOne({ id: item.product_id });
            if (!product) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Product ${item.name} not found` 
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${item.name}. Only ${product.stock} left.` 
                });
            }
        }
        
        // Create order
        const lastOrder = await mongoose.connection.db.collection('orders').find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastOrder.length > 0 ? lastOrder[0].id + 1 : 1;
        
        const newOrder = {
            id: newId,
            user_id: user_id,
            user_name: user_name,
            user_email: user_email,
            items: items,
            subtotal: subtotal,
            delivery_fee: delivery_fee || 40,
            tax: tax || 0,
            grand_total: grand_total,
            payment_method: payment_method,
            delivery_address: delivery_address,
            status: status || 'confirmed',
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        await mongoose.connection.db.collection('orders').insertOne(newOrder);
        
        // UPDATE STOCK - Reduce quantities for each item
        console.log('=== UPDATING STOCK ===');
        for (const item of items) {
            const product = await mongoose.connection.db.collection('products').findOne({ id: item.product_id });
            const newStock = product.stock - item.quantity;
            await mongoose.connection.db.collection('products').updateOne(
                { id: item.product_id },
                { $set: { stock: newStock } }
            );
            console.log(`✅ ${product.name}: ${product.stock} → ${newStock}`);
        }
        
        console.log('✅ Order created! Order ID:', newId);
        
        // Send email
        if (user_email) {
            await sendOrderConfirmation(newOrder, user_email, user_name);
        }
        
        res.status(201).json({ 
            success: true, 
            order: newOrder,
            message: 'Order placed successfully!'
        });
        
    } catch (error) {
        console.error('❌ Order error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = parseInt(req.params.id);
        
        await mongoose.connection.db.collection('orders').updateOne(
            { id: orderId },
            { $set: { status: status } }
        );
        
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Home route
app.get('/', (req, res) => {
    res.json({ message: 'FoodHub API is running!' });
});

// ============ ADMIN PRODUCT ROUTES ============

// Create new product
app.post('/api/products', async (req, res) => {
    console.log('=== CREATE PRODUCT ===');
    try {
        const { name, price, stock, image } = req.body;
        
        const lastProduct = await mongoose.connection.db.collection('products').find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1;
        
        const newProduct = {
            id: newId,
            name: name,
            price: parseInt(price),
            stock: parseInt(stock),
            image: image || null
        };
        
        await mongoose.connection.db.collection('products').insertOne(newProduct);
        console.log('✅ Product created:', name);
        res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    console.log('=== UPDATE PRODUCT ===');
    try {
        const { name, price, stock, image } = req.body;
        const productId = parseInt(req.params.id);
        
        await mongoose.connection.db.collection('products').updateOne(
            { id: productId },
            { $set: { name: name, price: parseInt(price), stock: parseInt(stock), image: image } }
        );
        
        console.log('✅ Product updated:', name);
        res.json({ success: true, message: 'Product updated' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    console.log('=== DELETE PRODUCT ===');
    try {
        const productId = parseInt(req.params.id);
        await mongoose.connection.db.collection('products').deleteOne({ id: productId });
        console.log('✅ Product deleted');
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ RAZORPAY PAYMENT ROUTES ============

let razorpayInstance = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay initialized');
    } else {
        console.log('⚠️ Razorpay keys not found');
    }
} catch (error) {
    console.log('⚠️ Razorpay initialization failed:', error.message);
}

// Create Razorpay Order
app.post('/api/create-order', async (req, res) => {
    console.log('=== CREATE ORDER API CALLED ===');
    
    try {
        const { amount } = req.body;
        
        if (!amount) {
            return res.status(400).json({ success: false, error: 'Amount is required' });
        }
        
        if (!razorpayInstance) {
            return res.json({
                success: true,
                orderId: 'mock_order_' + Date.now(),
                amount: Math.round(amount * 100),
                currency: 'INR',
                mock: true
            });
        }
        
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };
        
        const order = await razorpayInstance.orders.create(options);
        
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
    console.log('=== VERIFY PAYMENT API CALLED ===');
    
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        if (razorpay_order_id && razorpay_order_id.startsWith('mock_order_')) {
            return res.json({ success: true, message: 'Mock payment verified' });
        }
        
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        
        const isAuthentic = expectedSignature === razorpay_signature;
        
        if (isAuthentic) {
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ CONNECT TO MONGODB WITH RETRY LOGIC ============

const connectWithRetry = async (retryCount = 0, maxRetries = 5) => {
    console.log(`Connection attempt ${retryCount + 1}/${maxRetries}...`);
    
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI environment variable is not set!');
        process.exit(1);
    }
    
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });
        
    } catch (err) {
        console.error(`❌ MongoDB Connection Error (attempt ${retryCount + 1}):`, err.message);
        
        if (retryCount < maxRetries - 1) {
            const waitTime = 5000;
            console.log(`Waiting ${waitTime/1000} seconds before retry...`);
            setTimeout(() => connectWithRetry(retryCount + 1, maxRetries), waitTime);
        } else {
            console.error('❌ Max retries reached. Exiting...');
            process.exit(1);
        }
    }
};

// Start the server with retry logic
connectWithRetry();