const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

// Get User Dashboard
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's inquiries
    const totalInquiries = await Inquiry.countDocuments({ userId });
    const pendingInquiries = await Inquiry.countDocuments({ userId, status: 'pending' });
    const contactedInquiries = await Inquiry.countDocuments({ userId, status: 'contacted' });

    // Get user's favorite properties
    const favoriteProperties = await Property.find({ favorites: userId }).select('title price city');

    // Get recent inquiries
    const recentInquiries = await Inquiry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('propertyId', 'title price city')
      .populate('agentId', 'name email phone');

    res.status(200).json({
      message: 'User dashboard fetched successfully',
      user,
      stats: {
        totalInquiries,
        pendingInquiries,
        contactedInquiries,
        favoriteProperties: favoriteProperties.length
      },
      recentData: {
        inquiries: recentInquiries,
        favorites: favoriteProperties
      }
    });
  } catch (error) {
    console.error('User Dashboard Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
};

// Get User's Inquiries
exports.getMyInquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { userId };
    if (status) filter.status = status;

    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('propertyId', 'title price city bedrooms bathrooms')
      .populate('agentId', 'name email phone company');

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

// Get Single Inquiry
exports.getInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const userId = req.user.id;

    const inquiry = await Inquiry.findById(inquiryId)
      .populate('propertyId')
      .populate('agentId')
      .populate('userId');

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Check if inquiry belongs to user
    if (inquiry.userId._id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only view your own inquiries' });
    }

    // Mark as read
    inquiry.isRead = true;
    await inquiry.save();

    res.status(200).json({
      message: 'Inquiry details fetched',
      inquiry
    });
  } catch (error) {
    console.error('Get Inquiry Error:', error);
    res.status(500).json({ message: 'Error fetching inquiry', error: error.message });
  }
};

// Get User's Favorite Properties
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const properties = await Property.find({ favorites: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('agent', 'name email company');

    const total = await Property.countDocuments({ favorites: userId });

    res.status(200).json({
      message: 'Favorite properties fetched successfully',
      properties,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Favorites Error:', error);
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, userType, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, city, userType, profileImage },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User profile fetched',
      user
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Send Message to Agent
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inquiryId, message } = req.body;

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only message your own inquiries' });
    }

    // Update inquiry message (simplified - in real app might need messages array)
    inquiry.message = message;
    inquiry.updatedAt = new Date();
    await inquiry.save();

    res.status(200).json({
      message: 'Message sent successfully',
      inquiry
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};
