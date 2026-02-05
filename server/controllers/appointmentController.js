const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
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

        // Extract timeSlots
        const takenSlots = appointments.map(appt => appt.timeSlot);

        res.json(takenSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAppointment,
    getMyAppointments,
    getMyBookings, // Exported as requested
    updateAppointmentStatus,
    cancelAppointment,
    getTakenSlots
};
