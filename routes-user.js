const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isUser } = require('../middleware/auth');

// All user routes need authentication
router.use(protect);

// Dashboard
router.get('/dashboard', userController.getUserDashboard);

// Profile
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

// Inquiries
router.get('/inquiries', userController.getMyInquiries);
router.get('/inquiries/:inquiryId', userController.getInquiry);
router.patch('/inquiries/:inquiryId/message', userController.sendMessage);

// Favorites
router.get('/favorites', userController.getFavorites);

module.exports = router;
