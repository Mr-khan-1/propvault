const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isUser } = require('../middleware/auth');

router.use(protect, isUser);

router.get('/dashboard', userController.getUserDashboard);
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.get('/inquiries', userController.getMyInquiries);
router.get('/favorites', userController.getFavorites);

module.exports = router;
