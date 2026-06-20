const User = require('../models/User');
const Agent = require('../models/Agent');
const Admin = require('../models/Admin');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTP, sendWelcomeEmail } = require('../utils/sendOTP');

// Generate JWT Token
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Step 1: Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email, userType } = req.body;

    // Validate input
    if (!email || !userType) {
      return res.status(400).json({ message: 'Email and user type are required' });
    }

    if (!['user', 'agent', 'admin'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Check if email already exists
    let existingUser = null;
    
    if (userType === 'user') {
      existingUser = await User.findOne({ email });
    } else if (userType === 'agent') {
      existingUser = await Agent.findOne({ email });
    } else if (userType === 'admin') {
      existingUser = await Admin.findOne({ email });
    }

    // For admin, only superadmin can create new admins (should be handled separately)
    if (userType === 'admin') {
      return res.status(403).json({ message: 'Admin accounts can only be created by superadmin' });
    }

    // For existing users, they can use login instead
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database (expires in 10 minutes)
    await OTP.deleteMany({ email, userType }); // Delete old OTPs
    const otpDoc = new OTP({
      email,
      otp,
      userType
    });
    await otpDoc.save();

    // Send OTP via email
    await sendOTP(email, otp, userType);

    res.status(200).json({
      message: 'OTP sent successfully to your email',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1****$3') // Show masked email
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

// Step 2: Verify OTP and Register
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, userType, userData } = req.body;

    // Validate input
    if (!email || !otp || !userType || !userData) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, userType });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }

    if (otpRecord.isUsed) {
      return res.status(400).json({ message: 'OTP already used. Please request a new one.' });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Maximum OTP attempts reached. Please request a new one.' });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        message: 'Invalid OTP',
        attemptsLeft: otpRecord.maxAttempts - otpRecord.attempts
      });
    }

    // OTP verified, mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    let newUser;

    // Create user based on type
    if (userType === 'user') {
      newUser = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        userType: userData.userType || 'buyer',
        isVerified: true
      });
    } else if (userType === 'agent') {
      // Agents need approval
      newUser = await Agent.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        company: userData.company,
        license: userData.license,
        isVerified: true,
        status: 'pending' // Waiting for admin approval
      });
    }

    // Send welcome email
    await sendWelcomeEmail(email, userData.name, userType);

    // Generate token
    const token = generateToken(newUser._id, userType);

    res.status(201).json({
      message: userType === 'agent' ? 'Registration successful! Waiting for admin approval.' : 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType || userType,
        status: newUser.status || 'active'
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Email, password, and user type are required' });
    }

    let user = null;

    // Find user based on type
    if (userType === 'user') {
      user = await User.findOne({ email }).select('+password');
      if (!user || !user.isVerified) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else if (userType === 'agent') {
      user = await Agent.findOne({ email }).select('+password');
      if (!user || !user.isVerified) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      if (user.status === 'pending') {
        return res.status(403).json({ message: 'Your account is pending admin approval' });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({ message: 'Your account has been rejected' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }
    } else if (userType === 'admin') {
      user = await Admin.findOne({ email }).select('+password');
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login for admin
    if (userType === 'admin') {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id, userType);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: userType,
        status: user.status || 'active'
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Verify Token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      message: 'Token is valid',
      decoded
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
