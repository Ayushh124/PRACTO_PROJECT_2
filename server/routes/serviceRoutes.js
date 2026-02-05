const express = require('express');
const router = express.Router();
const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { protect, provider } = require('../middleware/authMiddleware');

router.route('/')
    .get(getServices) // Public route
    .post(protect, provider, createService); // Protected route

router.route('/:id')
    .get(getServiceById) // Public route
    .put(protect, provider, updateService) // Protected route
    .delete(protect, provider, deleteService); // Protected route

module.exports = router;
