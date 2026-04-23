const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: Number,
    name: String,
    email: String,
    password: String,
    address: String,
    phone: Number,
    role: String,
    created_at: String
});

module.exports = mongoose.model('User', userSchema, 'users');