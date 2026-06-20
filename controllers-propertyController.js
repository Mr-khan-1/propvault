const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// Get All Properties (with filters)
exports.getAllProperties = async (req, res) => {
  try {
    const { city, type, purpose, minPrice, maxPrice, bedrooms, bathrooms, furnished, page = 1, limit = 12, search } = req.query;

    let filter = { status: 'available' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };
    if (furnished) filter.furnished = furnished;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('agent', 'name email phone company rating');

    const total = await Property.countDocuments(filter);

    res.status(200).json({
      message: 'Properties fetched successfully',
      properties,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Properties Error:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Get Single Property
exports.getSingleProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('agent', 'name email phone company rating bio');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Get similar properties
    const similarProperties = await Property.find({
      _id: { $ne: id },
      type: property.type,
      purpose: property.purpose,
      'address.city': property.address.city,
      status: 'available'
    })
      .limit(4)
      .populate('agent', 'name email company');

    // Get reviews
    const reviews = property.reviews || [];

    res.status(200).json({
      message: 'Property details fetched',
      property,
      similarProperties,
      reviews
    });
  } catch (error) {
    console.error('Get Single Property Error:', error);
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

// Add Property to Favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $addToSet: { favorites: userId } },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      message: 'Added to favorites',
      property
    });
  } catch (error) {
    console.error('Add to Favorites Error:', error);
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
};

// Remove from Favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $pull: { favorites: userId } },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      message: 'Removed from favorites',
      property
    });
  } catch (error) {
    console.error('Remove from Favorites Error:', error);
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
};

// Send Inquiry
exports.sendInquiry = async (req, res) => {
  try {
    const { propertyId, message, inquiryType, attachments } = req.body;
    const userId = req.user.id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create inquiry
    const inquiry = await Inquiry.create({
      propertyId,
      userId,
      agentId: property.agent,
      message,
      inquiryType: inquiryType || 'general',
      attachments: attachments || []
    });

    // Populate for response
    await inquiry.populate('userId', 'name email phone');
    await inquiry.populate('propertyId', 'title price');

    res.status(201).json({
      message: 'Inquiry sent successfully',
      inquiry
    });
  } catch (error) {
    console.error('Send Inquiry Error:', error);
    res.status(500).json({ message: 'Error sending inquiry', error: error.message });
  }
};

// Get Property Reviews
exports.getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId).select('reviews rating');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      message: 'Reviews fetched successfully',
      reviews: property.reviews,
      rating: property.rating,
      totalReviews: property.reviews.length
    });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Add Review
exports.addReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user already reviewed
    const existingReview = property.reviews.find(r => r.userId.toString() === userId);
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }

    // Add review
    property.reviews.push({
      userId,
      rating,
      comment
    });

    // Calculate new average rating
    const totalRating = property.reviews.reduce((sum, r) => sum + r.rating, 0);
    property.rating = totalRating / property.reviews.length;

    await property.save();

    res.status(201).json({
      message: 'Review added successfully',
      property
    });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};
