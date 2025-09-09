const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Issue = require('../models/Issue');
const { auth, requireOfficer } = require('../middleware/auth');

const router = express.Router();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Register user
router.post('/auth/register', async (req, res) => {
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
router.post('/auth/login', async (req, res) => {
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

// Simple login without JWT - just check database
router.post('/auth/simple-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Simple password check (you can make this even simpler by removing bcrypt)
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
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

    res.json({
      message: 'Login successful',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Simple login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Get current user
router.get('/auth/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Logout (client-side token removal)
router.post('/auth/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Verify officer account (simplified - no auth required)
router.post('/auth/verify-officer/:officerId', async (req, res) => {
  try {

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

    // Find any verified officer to use as verifier
    const verifier = await User.findOne({ role: 'officer', isVerified: true });
    if (!verifier) {
      return res.status(400).json({ message: 'No verified officer found to perform verification' });
    }
    
    await officer.verifyOfficer(verifier._id);

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
router.get('/auth/unverified-officers', auth, async (req, res) => {
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

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

// Get all users (simplified - no auth required)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query = { isActive: true };
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users', 
      error: error.message 
    });
  }
});

// Get user by ID
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users can only view their own profile, officers can view any
    if (req.user.role !== 'officer' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user', 
      error: error.message 
    });
  }
});

// Update user profile
router.put('/users/:id', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.params.id;

    // Users can only update their own profile, officers can update any
    if (req.user.role !== 'officer' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
});

// Deactivate user (simplified - no auth required)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ 
      message: 'Failed to deactivate user', 
      error: error.message 
    });
  }
});

// ============================================================================
// ISSUE MANAGEMENT ROUTES
// ============================================================================

// Create new issue (public or authenticated)
router.post('/issues', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      location,
      images,
      citizenName,
      citizenContact
    } = req.body;

    const issueData = {
      title,
      description,
      category,
      priority: priority || 'medium',
      location,
      images: images || [],
      citizenName,
      citizenContact
    };

    // If user is authenticated, link the issue to them
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          issueData.citizenId = user._id;
        }
      } catch (error) {
        // Continue with anonymous submission if token is invalid
        console.log('Invalid token for issue creation, proceeding anonymously');
      }
    }

    const issue = new Issue(issueData);
    await issue.save();

    // Populate citizen info if linked
    await issue.populate('citizenId', 'name email');

    res.status(201).json({
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ 
      message: 'Failed to create issue', 
      error: error.message 
    });
  }
});

// Get all issues with filtering
router.get('/issues', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      priority,
      assignedOfficer,
      search,
      citizenId
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedOfficer) query.assignedOfficer = assignedOfficer;
    if (citizenId) query.citizenId = citizenId;

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { citizenName: { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(query)
      .populate('citizenId', 'name email')
      .populate('assignedOfficer', 'name username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch issues', 
      error: error.message 
    });
  }
});

// Get issue by ID
router.get('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('citizenId', 'name email')
      .populate('assignedOfficer', 'name username');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch issue', 
      error: error.message 
    });
  }
});

// Update issue (simplified - no auth required)
router.put('/issues/:id', async (req, res) => {
  try {
    const { status, assignedOfficer, notes, priority } = req.body;
    
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Update allowed fields
    if (status) issue.status = status;
    if (assignedOfficer) issue.assignedOfficer = assignedOfficer;
    if (notes !== undefined) issue.notes = notes;
    if (priority) issue.priority = priority;

    await issue.save();

    // Populate related data
    await issue.populate('citizenId', 'name email');
    await issue.populate('assignedOfficer', 'name username');

    res.json({
      message: 'Issue updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ 
      message: 'Failed to update issue', 
      error: error.message 
    });
  }
});

// Assign issue to officer (simplified - no auth required)
router.patch('/issues/:id/assign', async (req, res) => {
  try {
    const { officerId } = req.body;
    
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Verify officer exists
    if (officerId) {
      const officer = await User.findById(officerId);
      if (!officer || officer.role !== 'officer') {
        return res.status(400).json({ message: 'Invalid officer ID' });
      }
    }

    issue.assignedOfficer = officerId;
    if (issue.status === 'pending') {
      issue.status = 'in-progress';
    }

    await issue.save();
    await issue.populate('assignedOfficer', 'name username');

    res.json({
      message: 'Issue assigned successfully',
      issue
    });
  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({ 
      message: 'Failed to assign issue', 
      error: error.message 
    });
  }
});

// Get issue statistics (simplified - no auth required)
router.get('/issues/stats/overview', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Issue.countDocuments();

    res.json({
      total,
      statusStats: stats,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics', 
      error: error.message 
    });
  }
});

// Delete issue (simplified - no auth required)
router.delete('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ 
      message: 'Failed to delete issue', 
      error: error.message 
    });
  }
});

module.exports = router;