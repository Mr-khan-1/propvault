const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.isAdmin = async (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const admin = await Admin.findById(req.user.id);
  if (!admin?.isActive) {
    return res.status(403).json({ message: 'Admin account inactive' });
  }
  next();
};

exports.isAgent = async (req, res, next) => {
  if (req.user.userType !== 'agent') {
    return res.status(403).json({ message: 'Agent access required' });
  }
  const agent = await Agent.findById(req.user.id);
  if (!agent?.isActive) {
    return res.status(403).json({ message: 'Agent account inactive' });
  }
  if (agent.status !== 'approved') {
    return res.status(403).json({ message: 'Agent account not approved yet' });
  }
  next();
};

exports.isUser = async (req, res, next) => {
  if (req.user.userType !== 'user') {
    return res.status(403).json({ message: 'User access required' });
  }
  const user = await User.findById(req.user.id);
  if (!user?.isActive) {
    return res.status(403).json({ message: 'User account inactive' });
  }
  next();
};

exports.isUserOnly = exports.isUser;
