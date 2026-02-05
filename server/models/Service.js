const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true // Indexed for easier searching
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // duration in minutes
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
