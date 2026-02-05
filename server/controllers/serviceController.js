const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const category = req.query.category ? { category: req.query.category } : {};
        const providerId = req.query.providerId ? { providerId: req.query.providerId } : {};

        const services = await Service.find({ ...keyword, ...category, ...providerId }).populate('providerId', 'name email');
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in provider's services
// @route   GET /api/services/my-services
// @access  Private (Provider)
const getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ providerId: req.user._id });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('providerId', 'name email');

        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Provider only)
const createService = async (req, res) => {
    const { name, description, category, price, duration } = req.body;

    try {
        const service = new Service({
            providerId: req.user._id,
            name,
            description,
            category,
            price,
            duration
        });

        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
const updateService = async (req, res) => {
    const { name, description, category, price, duration } = req.body;

    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            if (service.providerId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this service' });
            }

            service.name = name || service.name;
            service.description = description || service.description;
            service.category = category || service.category;
            service.price = price || service.price;
            service.duration = duration || service.duration;

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            if (service.providerId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this service' });
            }

            await service.deleteOne();
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getMyServices
};
