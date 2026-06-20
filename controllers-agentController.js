const Agent = require('../models/Agent');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// Get Agent Dashboard
exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;

    const agent = await Agent.findById(agentId).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Get agent's properties
    const totalProperties = await Property.countDocuments({ agent: agentId });
    const activeProperties = await Property.countDocuments({ agent: agentId, status: 'available' });
    const soldProperties = await Property.countDocuments({ agent: agentId, status: 'sold' });

    // Get agent's inquiries
    const totalInquiries = await Inquiry.countDocuments({ agentId });
    const pendingInquiries = await Inquiry.countDocuments({ agentId, status: 'pending' });
    const resolvedInquiries = await Inquiry.countDocuments({ agentId, status: 'solved' });

    // Get recent properties
    const recentProperties = await Property.find({ agent: agentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price city bedrooms bathrooms status views');

    // Get recent inquiries
    const recentInquiries = await Inquiry.find({ agentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title price');

    // Calculate total revenue (from sold properties)
    const soldProps = await Property.find({ agent: agentId, status: 'sold' });
    const totalRevenue = soldProps.reduce((sum, prop) => sum + prop.price, 0);

    res.status(200).json({
      message: 'Agent dashboard fetched successfully',
      agent,
      stats: {
        totalProperties,
        activeProperties,
        soldProperties,
        totalInquiries,
        pendingInquiries,
        resolvedInquiries,
        totalRevenue
      },
      recentData: {
        properties: recentProperties,
        inquiries: recentInquiries
      }
    });
  } catch (error) {
    console.error('Agent Dashboard Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
};

// Get Agent's Properties
exports.getMyProperties = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { agent: agentId };
    if (status) filter.status = status;

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Property.countDocuments(filter);

    res.status(200).json({
      message: 'Your properties fetched successfully',
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

// Create Property
exports.createProperty = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { title, description, type, purpose, price, area, bedrooms, bathrooms, city, images, amenities } = req.body;

    // Validate required fields
    if (!title || !type || !purpose || !price || !area || !bedrooms || !bathrooms || !city) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const property = await Property.create({
      title,
      description,
      type,
      purpose,
      price,
      area,
      bedrooms,
      bathrooms,
      images: images || [],
      address: { city },
      amenities: amenities || [],
      agent: agentId,
      postedBy: 'agent'
    });

    // Update agent's total properties count
    await Agent.findByIdAndUpdate(agentId, { $inc: { totalProperties: 1 } });

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Create Property Error:', error);
    res.status(500).json({ message: 'Error creating property', error: error.message });
  }
};

// Update Property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;

    // Check if property belongs to agent
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.agent.toString() !== agentId) {
      return res.status(403).json({ message: 'You can only update your own properties' });
    }

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Update Property Error:', error);
    res.status(500).json({ message: 'Error updating property', error: error.message });
  }
};

// Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;

    // Check if property belongs to agent
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.agent.toString() !== agentId) {
      return res.status(403).json({ message: 'You can only delete your own properties' });
    }

    // Delete property and related inquiries
    await Property.findByIdAndDelete(id);
    await Inquiry.deleteMany({ propertyId: id });

    // Update agent's total properties count
    await Agent.findByIdAndUpdate(agentId, { $inc: { totalProperties: -1 } });

    res.status(200).json({
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete Property Error:', error);
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
};

// Get Agent's Inquiries
exports.getMyInquiries = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { agentId };
    if (status) filter.status = status;

    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title price');

    const total = await Inquiry.countDocuments(filter);

    res.status(200).json({
      message: 'Your inquiries fetched successfully',
      inquiries,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Inquiries Error:', error);
    res.status(500).json({ message: 'Error fetching inquiries', error: error.message });
  }
};

// Respond to Inquiry
exports.respondToInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user.id;
    const { message, scheduledDate } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.agentId.toString() !== agentId) {
      return res.status(403).json({ message: 'You can only respond to your own inquiries' });
    }

    inquiry.agentResponse = {
      message,
      respondedAt: new Date()
    };
    inquiry.status = 'contacted';
    if (scheduledDate) {
      inquiry.scheduledDate = scheduledDate;
      inquiry.status = 'scheduled';
    }
    await inquiry.save();

    res.status(200).json({
      message: 'Inquiry responded successfully',
      inquiry
    });
  } catch (error) {
    console.error('Respond Inquiry Error:', error);
    res.status(500).json({ message: 'Error responding to inquiry', error: error.message });
  }
};

// Get All Properties (for viewing other agents' properties)
exports.getAllProperties = async (req, res) => {
  try {
    const { city, type, purpose, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    let filter = { status: 'available' };
    if (city) filter['address.city'] = city;
    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
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
    console.error('Get All Properties Error:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Update Agent Profile
exports.updateProfile = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { name, phone, bio, profileImage, company, address, city } = req.body;

    const agent = await Agent.findByIdAndUpdate(
      agentId,
      { name, phone, bio, profileImage, company, address, city },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      agent
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
