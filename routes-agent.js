const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { protect, isAgent } = require('../middleware/auth');

// All agent routes need authentication and must be an agent
router.use(protect, isAgent);

// Dashboard
router.get('/dashboard', agentController.getAgentDashboard);

// Properties
router.get('/properties/my-properties', agentController.getMyProperties);
router.post('/properties', agentController.createProperty);
router.patch('/properties/:id', agentController.updateProperty);
router.delete('/properties/:id', agentController.deleteProperty);

// View all properties (can see other agents' properties)
router.get('/properties', agentController.getAllProperties);

// Inquiries
router.get('/inquiries', agentController.getMyInquiries);
router.patch('/inquiries/:id/respond', agentController.respondToInquiry);

// Profile
router.patch('/profile', agentController.updateProfile);

module.exports = router;
