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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
