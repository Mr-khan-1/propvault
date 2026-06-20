const Agent = require('../models/Agent');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;
    const agent = await Agent.findById(agentId).select('-password');

    const [totalProperties, activeProperties, soldProperties, totalInquiries, pendingInquiries] = await Promise.all([
      Property.countDocuments({ agent: agentId }),
      Property.countDocuments({ agent: agentId, status: 'available' }),
      Property.countDocuments({ agent: agentId, status: 'sold' }),
      Inquiry.countDocuments({ agentId }),
      Inquiry.countDocuments({ agentId, status: 'pending' })
    ]);

    const [recentProperties, recentInquiries] = await Promise.all([
      Property.find({ agent: agentId }).sort({ createdAt: -1 }).limit(5),
      Inquiry.find({ agentId }).sort({ createdAt: -1 }).limit(5).populate('userId', 'name email phone').populate('propertyId', 'title price')
    ]);

    res.json({
      agent,
      stats: { totalProperties, activeProperties, soldProperties, totalInquiries, pendingInquiries },
      recentProperties,
      recentInquiries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ agent: req.user.id }).sort({ createdAt: -1 });
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const { city, type, purpose, page = 1, limit = 12 } = req.query;
    const filter = { status: 'available' };
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };
    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('agent', 'name email company rating');

    const total = await Property.countDocuments(filter);
    res.json({ properties, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { title, description, type, purpose, price, area, bedrooms, bathrooms, city, images, amenities, furnished, parking } = req.body;
    if (!title || !type || !purpose || !price || !area || !city) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const property = await Property.create({
      title,
      description: description || title,
      type,
      purpose,
      price,
      area,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      images: images?.length ? images : undefined,
      address: { city },
      amenities: amenities || [],
      furnished,
      parking,
      agent: req.user.id
    });

    await Agent.findByIdAndUpdate(req.user.id, { $inc: { totalProperties: 1 } });
    res.status(201).json({ message: 'Property listed', property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.agent.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own properties' });
    }
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ message: 'Property updated', property: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.agent.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own properties' });
    }
    await Property.findByIdAndDelete(req.params.id);
    await Agent.findByIdAndUpdate(req.user.id, { $inc: { totalProperties: -1 } });
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ agentId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title price');
    res.json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.respondToInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    if (inquiry.agentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your inquiry' });
    }
    inquiry.agentResponse = { message: req.body.message, respondedAt: new Date() };
    inquiry.status = req.body.scheduledDate ? 'scheduled' : 'contacted';
    if (req.body.scheduledDate) inquiry.scheduledDate = req.body.scheduledDate;
    await inquiry.save();
    res.json({ message: 'Response sent', inquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json({ message: 'Profile updated', agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
