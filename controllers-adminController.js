const Admin = require('../models/Admin');
const Agent = require('../models/Agent');
const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// Get Dashboard Stats
exports.getDashboard = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Verify admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Get all stats
    const totalUsers = await User.countDocuments();
    const totalAgents = await Agent.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    
    const pendingAgents = await Agent.countDocuments({ status: 'pending' });
    const approvedAgents = await Agent.countDocuments({ status: 'approved' });
    const activeProperties = await Property.countDocuments({ status: 'available' });
    const pendingInquiries = await Inquiry.countDocuments({ status: 'pending' });

    // Get recent agents
    const recentAgents = await Agent.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email status createdAt');

    // Get recent properties
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price city status')
      .populate('agent', 'name email');

    // Get recent inquiries
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .populate('propertyId', 'title price')
      .populate('agentId', 'name');

    res.status(200).json({
      message: 'Dashboard data fetched successfully',
      stats: {
        totalUsers,
        totalAgents,
        totalProperties,
        totalInquiries,
        pendingAgents,
        approvedAgents,
        activeProperties,
        pendingInquiries
      },
      recentData: {
        agents: recentAgents,
        properties: recentProperties,
        inquiries: recentInquiries
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
};

// Get All Agents
exports.getAllAgents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const agents = await Agent.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Agent.countDocuments(filter);

    res.status(200).json({
      message: 'Agents fetched successfully',
      agents,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Agents Error:', error);
    res.status(500).json({ message: 'Error fetching agents', error: error.message });
  }
};

// Get Single Agent
exports.getAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'approvedBy',
        select: 'name email'
      });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Get agent's properties
    const properties = await Property.find({ agent: agent._id })
      .select('title price city bedrooms bathrooms status views');

    res.status(200).json({
      message: 'Agent details fetched',
      agent,
      properties
    });
  } catch (error) {
    console.error('Get Agent Error:', error);
    res.status(500).json({ message: 'Error fetching agent', error: error.message });
  }
};

// Approve Agent
exports.approveAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent.status !== 'pending') {
      return res.status(400).json({ message: 'Agent is not in pending status' });
    }

    agent.status = 'approved';
    agent.approvedBy = adminId;
    agent.approvalDate = new Date();
    await agent.save();

    res.status(200).json({
      message: 'Agent approved successfully',
      agent
    });
  } catch (error) {
    console.error('Approve Agent Error:', error);
    res.status(500).json({ message: 'Error approving agent', error: error.message });
  }
};

// Reject Agent
exports.rejectAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent.status !== 'pending') {
      return res.status(400).json({ message: 'Agent is not in pending status' });
    }

    agent.status = 'rejected';
    await agent.save();

    res.status(200).json({
      message: 'Agent rejected successfully',
      agent
    });
  } catch (error) {
    console.error('Reject Agent Error:', error);
    res.status(500).json({ message: 'Error rejecting agent', error: error.message });
  }
};

// Suspend Agent
exports.suspendAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.status = 'suspended';
    await agent.save();

    res.status(200).json({
      message: 'Agent suspended successfully',
      agent
    });
  } catch (error) {
    console.error('Suspend Agent Error:', error);
    res.status(500).json({ message: 'Error suspending agent', error: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments();

    res.status(200).json({
      message: 'Users fetched successfully',
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get All Properties
exports.getAllProperties = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('agent', 'name email company');

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

// Get All Inquiries
exports.getAllInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email phone')
      .populate('propertyId', 'title price')
      .populate('agentId', 'name email');

    const total = await Inquiry.countDocuments(filter);

    res.status(200).json({
      message: 'Inquiries fetched successfully',
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

// Generate Reports
exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;

    let report = {};

    if (reportType === 'agents') {
      report.totalAgents = await Agent.countDocuments();
      report.approvedAgents = await Agent.countDocuments({ status: 'approved' });
      report.pendingAgents = await Agent.countDocuments({ status: 'pending' });
      report.rejectedAgents = await Agent.countDocuments({ status: 'rejected' });
      report.suspendedAgents = await Agent.countDocuments({ status: 'suspended' });
    } else if (reportType === 'properties') {
      report.totalProperties = await Property.countDocuments();
      report.activeProperties = await Property.countDocuments({ status: 'available' });
      report.soldProperties = await Property.countDocuments({ status: 'sold' });
      report.rentedProperties = await Property.countDocuments({ status: 'rented' });
      
      // Revenue calculation
      const properties = await Property.find({ status: 'sold' });
      report.totalRevenue = properties.reduce((sum, prop) => sum + prop.price, 0);
    } else if (reportType === 'inquiries') {
      report.totalInquiries = await Inquiry.countDocuments();
      report.pendingInquiries = await Inquiry.countDocuments({ status: 'pending' });
      report.resolvedInquiries = await Inquiry.countDocuments({ status: 'solved' });
    }

    res.status(200).json({
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};
