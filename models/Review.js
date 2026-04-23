const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    id: Number,
    user_id: Number,
    product_id: Number,
    rating: Number,
    comment: String,
    created_at: String
});

module.exports = mongoose.model('Review', reviewSchema, 'reviews');