const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Customer)
const createAppointment = async (req, res) => {
    const { serviceId, date, timeSlot } = req.body;

    let session = null;
    if (process.env.USE_MEMORY_DB !== 'true') {
        session = await mongoose.startSession();
        session.startTransaction();
    }

    try {
        const service = await Service.findById(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }

        const startDateTime = new Date(date);
        const [hours, minutes] = timeSlot.split(':').map(Number);
        startDateTime.setHours(hours, minutes, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);

        // Check for double booking
        const query = {
            $or: [
                { providerId: service.providerId },
                { userId: req.user._id }
            ],
            status: { $nin: ['cancelled', 'rejected'] },
            startTime: { $lt: endDateTime },
            endTime: { $gt: startDateTime }
        };

        const existingAppointment = session
            ? await Appointment.findOne(query).session(session)
            : await Appointment.findOne(query);

        if (existingAppointment) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(400).json({ message: 'Time slot already booked' });
        }

        const appointment = new Appointment({
            userId: req.user._id,
            providerId: service.providerId,
            serviceId: serviceId,
            date: startDateTime,
            timeSlot,
            startTime: startDateTime,
            endTime: endDateTime,
            status: 'pending'
        });

        const createdAppointment = await appointment.save(session ? { session } : undefined);

        if (session) {
            await session.commitTransaction();
            session.endSession();
        }

        res.status(201).json(createdAppointment);

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my appointments (For Customer Dashboard)
// @route   GET /api/appointments/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Appointment.find({ userId: req.user._id })
            .populate('serviceId')
            .populate('providerId', 'name email') // limit fields for privacy
            .sort({ date: -1 }); // Show newest first

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider appointments (For Provider Dashboard)
// @route   GET /api/appointments
// @access  Private
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            $or: [
                { userId: req.user._id },
                { providerId: req.user._id }
            ]
        })
            .populate('userId', 'name email')
            .populate('providerId', 'name email')
            .populate('serviceId', 'name price duration')
            .sort({ startTime: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Provider only)
const updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.providerId.toString() !== req.user._id.toString()) {
            // Basic check: Allow user to cancel, provider to change status
            if (appointment.userId.toString() === req.user._id.toString() && status === 'cancelled') {
                // Allowed
            } else {
                return res.status(401).json({ message: 'Not authorized' });
            }
        }

        appointment.status = status;
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Not found' });

        // Security Check: Only the user who made the booking (or provider?) can cancel. 
        // Request says: "Ensure req.user.id matches the appointment's userId"
        if (appointment.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not Authorized to cancel this booking' });
        }

        // Option A: Hard Delete
        // await appointment.deleteOne();

        // Option B: Soft Delete (Status = cancelled) - PREFERRED per instructions "or set status to cancelled"
        // But since frontend removes it from view instantly, soft delete is safer.
        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to generate slots
const generateSlots = (startStr, endStr, duration) => {
    const slots = [];
    const [startHour, startMin] = startStr.split(':').map(Number);
    const [endHour, endMin] = endStr.split(':').map(Number);

    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    while (current < end) {
        const hours = current.getHours().toString().padStart(2, '0');
        const minutes = current.getMinutes().toString().padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
        current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
};

const getAvailableSlots = async (req, res) => {
    try {
        const { providerId, date } = req.query;

        if (!providerId || !date) {
            return res.status(400).json({ message: 'Missing parameters' });
        }

        const provider = await User.findById(providerId);
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Get Availability Settings (or defaults)
        const { startTime = "09:00", endTime = "17:00", slotDuration = 60, holidays = [] } = provider.availability || {};

        // Check if date is a holiday
        // date string from frontend is usually ISO. We need YYYY-MM-DD
        const queryDate = new Date(date);
        const dateStr = queryDate.toISOString().split('T')[0];

        if (holidays.includes(dateStr)) {
            return res.json({ slots: [], message: 'Provider is on holiday' });
        }

        // Generate all possible slots for this provider
        const allSlots = generateSlots(startTime, endTime, slotDuration);

        // Fetch booked slots
        const startDateTime = new Date(date);
        startDateTime.setHours(0, 0, 0, 0);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            providerId,
            status: { $nin: ['cancelled', 'rejected'] },
            date: { $gte: startDateTime, $lte: endDateTime }
        });

        const takenSlots = appointments.map(appt => appt.timeSlot);

        // Filter available slots
        const availableSlots = allSlots.filter(slot => !takenSlots.includes(slot));

        res.json({
            slots: availableSlots,
            settings: provider.availability
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get taken slots for a specific date (for visual disabling in frontend)
// @route   GET /api/appointments/taken-slots
// @access  Private
const getTakenSlots = async (req, res) => {
    try {
        const { providerId, date } = req.query;

        if (!providerId || !date) {
            return res.status(400).json({ message: 'Missing parameters' });
        }

        const startDateTime = new Date(date);
        startDateTime.setHours(0, 0, 0, 0);
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            providerId,
            status: { $nin: ['cancelled', 'rejected'] },
            date: { $gte: startDateTime, $lte: endDateTime }
        });

        const takenSlots = appointments.map(appt => appt.timeSlot);
        res.json(takenSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAppointment,
    getMyAppointments,
    getMyBookings,
    updateAppointmentStatus,
    cancelAppointment,
    getTakenSlots,
    getAvailableSlots
};
