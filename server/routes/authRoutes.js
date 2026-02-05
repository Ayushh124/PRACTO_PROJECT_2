const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserProfile } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', require('../middleware/authMiddleware').protect, updateUserProfile);

module.exports = router;
