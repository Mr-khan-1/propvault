const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { protect, isAgent } = require('../middleware/auth');

router.use(protect, isAgent);

router.get('/dashboard', agentController.getAgentDashboard);
router.get('/properties/my', agentController.getMyProperties);
router.get('/properties/browse', agentController.getAllProperties);
router.post('/properties', agentController.createProperty);
router.patch('/properties/:id', agentController.updateProperty);
router.delete('/properties/:id', agentController.deleteProperty);
router.get('/inquiries', agentController.getMyInquiries);
router.patch('/inquiries/:id/respond', agentController.respondToInquiry);
router.patch('/profile', agentController.updateProfile);

module.exports = router;
