const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getMyAppointments,
    getMyBookings,
    updateAppointmentStatus,
    cancelAppointment,
    getTakenSlots
} = require('../controllers/appointmentController');
const { protect, provider } = require('../middleware/authMiddleware');

// Route for creating appointment (Matches POST /api/appointments)
router.post('/', protect, createAppointment);

// Route for Provider to get all requests (or general use)
router.get('/', protect, getMyAppointments);

// Route for Customer to get their own bookings - PLACED ABOVE /:id
router.get('/my-bookings', protect, getMyBookings);

// Route for status updates
router.put('/:id/status', protect, updateAppointmentStatus);

// Route for cancelling (DELETE request)
router.delete('/:id', protect, cancelAppointment);

// Route for checking taken slots
router.get('/taken-slots', protect, getTakenSlots);

module.exports = router;
