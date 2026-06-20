const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Send OTP for registration
router.post('/send-otp', authController.sendOTP);

// Verify OTP and create account
router.post('/verify-otp', authController.verifyOTP);

// Login
router.post('/login', authController.login);

// Verify token
router.post('/verify-token', authController.verifyToken);

module.exports = router;
