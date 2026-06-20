const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect, isAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/agents', adminController.getAllAgents);
router.patch('/agents/:id/approve', adminController.approveAgent);
router.patch('/agents/:id/reject', adminController.rejectAgent);
router.patch('/agents/:id/suspend', adminController.suspendAgent);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle', adminController.toggleUserStatus);
router.get('/properties', adminController.getAllProperties);
router.delete('/properties/:id', adminController.deleteProperty);
router.get('/inquiries', adminController.getAllInquiries);

module.exports = router;
