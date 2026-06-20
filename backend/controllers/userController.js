const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    const [totalInquiries, pendingInquiries, favorites] = await Promise.all([
      Inquiry.countDocuments({ userId }),
      Inquiry.countDocuments({ userId, status: 'pending' }),
      Property.find({ favorites: userId }).limit(6).populate('agent', 'name company')
    ]);

    const recentInquiries = await Inquiry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('propertyId', 'title price address')
      .populate('agentId', 'name email phone');

    res.json({
      user,
      stats: { totalInquiries, pendingInquiries, favoriteCount: favorites.length },
      favorites,
      recentInquiries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('propertyId', 'title price address images')
      .populate('agentId', 'name email phone company');
    res.json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const properties = await Property.find({ favorites: req.user.id })
      .populate('agent', 'name email company');
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
