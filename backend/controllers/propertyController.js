const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

exports.getAllProperties = async (req, res) => {
  try {
    const { city, type, purpose, minPrice, maxPrice, bedrooms, page = 1, limit = 12, search } = req.query;
    const filter = { status: 'available' };

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
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('agent', 'name email phone company rating city');

    const total = await Property.countDocuments(filter);
    res.json({ properties, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('agent', 'name email phone company rating bio city');

    if (!property) return res.status(404).json({ message: 'Property not found' });

    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      type: property.type,
      'address.city': property.address.city,
      status: 'available'
    }).limit(4).populate('agent', 'name company');

    res.json({ property, similarProperties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToFavorites = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.propertyId,
      { $addToSet: { favorites: req.user.id } },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Added to favorites', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.propertyId,
      { $pull: { favorites: req.user.id } },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Removed from favorites', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendInquiry = async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ message: 'Only users can send inquiries. Agents cannot send inquiries.' });
    }

    const { propertyId, message, inquiryType } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const inquiry = await Inquiry.create({
      propertyId,
      userId: req.user.id,
      agentId: property.agent,
      message,
      inquiryType: inquiryType || 'general'
    });

    await inquiry.populate([
      { path: 'propertyId', select: 'title price' },
      { path: 'agentId', select: 'name email' }
    ]);

    res.status(201).json({ message: 'Inquiry sent successfully', inquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
