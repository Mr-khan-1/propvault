const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect, isUser } = require('../middleware/auth');

router.get('/', propertyController.getAllProperties);
router.post('/inquiry', protect, isUser, propertyController.sendInquiry);
router.post('/:propertyId/favorites', protect, isUser, propertyController.addToFavorites);
router.delete('/:propertyId/favorites', protect, isUser, propertyController.removeFromFavorites);
router.get('/:id', propertyController.getSingleProperty);

module.exports = router;
