const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {type: String, required: true},
    lastname: { type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    mobile: {type: String, required: true, unique: true},
    role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    cart: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      }],
    timestamp: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema);

module.exports = User;
