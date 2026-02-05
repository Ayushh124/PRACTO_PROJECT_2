const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'provider', 'admin'],
        default: 'user'
    },
    profileImage: {
        type: String,
        default: ''
    },
    // Provider specific fields
    providerProfile: {
        category: {
            type: String,
            enum: ['Cleaning', 'Medical', 'Repair'],
            required: function () { return this.role === 'provider'; }
        },
        bio: {
            type: String
        }
    },
    // Availability Settings (Feature 2)
    availability: {
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
        slotDuration: { type: Number, default: 60 }, // in minutes
        holidays: [{ type: String }] // Array of date strings "YYYY-MM-DD"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
