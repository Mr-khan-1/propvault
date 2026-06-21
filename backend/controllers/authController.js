const User = require('../models/User');
const Agent = require('../models/Agent');
const Admin = require('../models/Admin');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTP, sendWelcomeEmail } = require('../utils/sendOTP');

const generateToken = (id, userType) =>
  jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.sendOTP = async (req, res) => {
  try {
    const { email, userType } = req.body;
    if (!email || !userType) {
      return res.status(400).json({ message: 'Email and user type required' });
    }
    if (!['user', 'agent'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type for registration' });
    }

    const Model = userType === 'user' ? User : Agent;
    const existing = await Model.findOne({ email });
    if (existing?.isVerified) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email, userType });
    await OTP.create({ email, otp, userType });

    let emailSent = false;
    let emailErrorMessage = null;
    
    try {
      await sendOTP(email, otp, userType);
      emailSent = true;
    } catch (emailError) {
      emailErrorMessage = emailError.message;
      console.error(`❌ Email not sent (${emailErrorMessage}).`);
    }

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1****$3');
    
    if (emailSent) {
      res.json({
        message: 'OTP sent to your email successfully.',
        email: maskedEmail,
        emailSent: true
      });
    } else {
      res.status(500).json({
        message: emailErrorMessage || 'Email could not be sent. Please configure an Email API or check credentials.',
        emailSent: false,
        debugError: emailErrorMessage
      });
    }

  } catch (error) {
    res.status(500).json({ message: 'Failed to process OTP request', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, userType, userData } = req.body;
    if (!email || !otp || !userType || !userData) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const otpRecord = await OTP.findOne({ email, userType });
    if (!otpRecord || otpRecord.isUsed) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many attempts. Request new OTP.' });
    }
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP', attemptsLeft: otpRecord.maxAttempts - otpRecord.attempts });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    let newUser;
    if (userType === 'user') {
      newUser = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        userType: userData.userType || 'buyer',
        isVerified: true
      });
    } else {
      newUser = await Agent.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        company: userData.company,
        license: userData.license,
        city: userData.city,
        isVerified: true,
        status: 'pending'
      });
    }

    await sendWelcomeEmail(email, userData.name, userType).catch((err) => {
      console.error('Welcome email failed (account still created):', err.message);
    });
    const token = generateToken(newUser._id, userType);

    res.status(201).json({
      message: userType === 'agent' ? 'Registered! Awaiting admin approval.' : 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType,
        status: newUser.status || 'active'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'All fields required' });
    }

    let user;
    if (userType === 'user') {
      user = await User.findOne({ email }).select('+password');
    } else if (userType === 'agent') {
      user = await Agent.findOne({ email }).select('+password');
      if (user?.status === 'pending') return res.status(403).json({ message: 'Account pending admin approval' });
      if (user?.status === 'rejected') return res.status(403).json({ message: 'Account rejected by admin' });
      if (user?.status === 'suspended') return res.status(403).json({ message: 'Account suspended' });
    } else if (userType === 'admin') {
      user = await Admin.findOne({ email }).select('+password');
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (userType === 'admin') {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id, userType);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, userType, status: user.status || 'active' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const { id, userType } = req.user;
    const Model = userType === 'admin' ? Admin : userType === 'agent' ? Agent : User;
    const user = await Model.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, userType, status: user.status || 'active' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
