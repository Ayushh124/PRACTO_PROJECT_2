const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String, 
        required: true
    },
    // Derived fields for efficient Double Booking Prevention queries
    // We populate these based on date + timeSlot + service.duration
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index optimization for the Double Booking logic
appointmentSchema.index({ providerId: 1, startTime: 1, endTime: 1 });
appointmentSchema.index({ userId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
