const Admin = require('../models/Admin');
const Agent = require('../models/Agent');
const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const { sendAgentApprovalEmail } = require('../utils/sendOTP');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalAgents, totalProperties, totalInquiries, pendingAgents, activeProperties] = await Promise.all([
      User.countDocuments(),
      Agent.countDocuments(),
      Property.countDocuments(),
      Inquiry.countDocuments(),
      Agent.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'available' })
    ]);

    const [recentAgents, recentProperties, recentInquiries] = await Promise.all([
      Agent.find().sort({ createdAt: -1 }).limit(5).select('name email status createdAt company'),
      Property.find().sort({ createdAt: -1 }).limit(5).populate('agent', 'name').select('title price address status createdAt'),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name').populate('propertyId', 'title').populate('agentId', 'name')
    ]);

    res.json({
      stats: { totalUsers, totalAgents, totalProperties, totalInquiries, pendingAgents, activeProperties },
      recentAgents,
      recentProperties,
      recentInquiries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const agents = await Agent.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Agent.countDocuments(filter);
    res.json({ agents, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    if (agent.status !== 'pending') return res.status(400).json({ message: 'Agent not pending' });

    agent.status = 'approved';
    agent.approvedBy = req.user.id;
    agent.approvalDate = new Date();
    await agent.save();
    await sendAgentApprovalEmail(agent.email, agent.name);

    res.json({ message: 'Agent approved', agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json({ message: 'Agent rejected', agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.suspendAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    if (agent.status !== 'approved') return res.status(400).json({ message: 'Only approved agents can be suspended' });

    agent.status = 'suspended';
    await agent.save();
    res.json({ message: 'Agent suspended', agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unsuspendAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    if (agent.status !== 'suspended') return res.status(400).json({ message: 'Agent is not suspended' });

    agent.status = 'approved';
    await agent.save();
    res.json({ message: 'Agent unsuspended', agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 }).populate('agent', 'name email company').limit(100);
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title price')
      .populate('agentId', 'name email')
      .limit(100);
    res.json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
