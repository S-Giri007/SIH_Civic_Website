const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this username or email already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      name,
      email,
      phone,
      role: role || 'citizen'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' 
      });
    }

    // Check password (this method handles login attempts and locking)
    try {
      await user.comparePassword(password);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    // For officers, check if they are verified
    if (user.role === 'officer' && !user.isVerified) {
      return res.status(403).json({ 
        message: 'Officer account is not verified. Please contact administrator.' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Verify officer account (admin only)
router.post('/verify-officer/:officerId', auth, async (req, res) => {
  try {
    // Only verified officers can verify other officers
    if (req.user.role !== 'officer' || !req.user.isVerified) {
      return res.status(403).json({ message: 'Access denied. Only verified officers can verify accounts.' });
    }

    const officer = await User.findById(req.params.officerId);
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    if (officer.role !== 'officer') {
      return res.status(400).json({ message: 'User is not an officer' });
    }

    if (officer.isVerified) {
      return res.status(400).json({ message: 'Officer is already verified' });
    }

    await officer.verifyOfficer(req.user._id);

    res.json({
      message: 'Officer verified successfully',
      officer: officer.toJSON()
    });
  } catch (error) {
    console.error('Verify officer error:', error);
    res.status(500).json({ 
      message: 'Failed to verify officer', 
      error: error.message 
    });
  }
});

// Get unverified officers (admin only)
router.get('/unverified-officers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'officer' || !req.user.isVerified) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const unverifiedOfficers = await User.find({
      role: 'officer',
      isVerified: false,
      isActive: true
    }).select('-password');

    res.json({ officers: unverifiedOfficers });
  } catch (error) {
    console.error('Get unverified officers error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch unverified officers', 
      error: error.message 
    });
  }
});

module.exports = router;