const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getSingleProperty);
router.get('/:propertyId/reviews', propertyController.getPropertyReviews);

// Protected routes (for users)
router.post('/:propertyId/favorites', protect, propertyController.addToFavorites);
router.delete('/:propertyId/favorites', protect, propertyController.removeFromFavorites);

// Inquiry
router.post('/inquiry/send', protect, propertyController.sendInquiry);

// Reviews
router.post('/:propertyId/reviews', protect, propertyController.addReview);

module.exports = router;
