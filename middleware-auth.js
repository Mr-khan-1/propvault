const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Admin = require('../models/Admin');

// Protect Routes - Verify JWT Token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error in authentication' });
  }
};

// Check if user is Admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access this route' });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: 'Admin account is not active' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking admin status' });
  }
};

// Check if user is Agent
exports.isAgent = async (req, res, next) => {
  try {
    if (req.user.userType !== 'agent') {
      return res.status(403).json({ message: 'Only agents can access this route' });
    }

    const agent = await Agent.findById(req.user.id);
    if (!agent || !agent.isActive) {
      return res.status(403).json({ message: 'Agent account is not active' });
    }

    if (agent.status !== 'approved') {
      return res.status(403).json({ message: 'Your agent account is not approved yet' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking agent status' });
  }
};

// Check if user is User
exports.isUser = async (req, res, next) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ message: 'Only users can access this route' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'User account is not active' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking user status' });
  }
};
