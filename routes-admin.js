const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// All admin routes need authentication
router.use(protect);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Agent Management
router.get('/agents', adminController.getAllAgents);
router.get('/agents/:id', adminController.getAgent);
router.patch('/agents/:id/approve', adminController.approveAgent);
router.patch('/agents/:id/reject', adminController.rejectAgent);
router.patch('/agents/:id/suspend', adminController.suspendAgent);

// User Management
router.get('/users', adminController.getAllUsers);

// Property Management
router.get('/properties', adminController.getAllProperties);

// Inquiry Management
router.get('/inquiries', adminController.getAllInquiries);

// Reports
router.post('/reports/generate', adminController.generateReport);

module.exports = router;
