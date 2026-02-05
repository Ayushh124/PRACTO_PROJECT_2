const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./server/config/db');

// Import Route Files
const authRoutes = require('./server/routes/authRoutes');
const serviceRoutes = require('./server/routes/serviceRoutes');
const appointmentRoutes = require('./server/routes/appointmentRoutes');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
// Fix CORS: Allow frontend origin and credentials
app.use(cors({
    origin: '*', // Allow all origins for Vercel/Production (for now)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Fix JSON Parsing: Ensure this is before routes
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes); // Correctly mounted

// Base Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
