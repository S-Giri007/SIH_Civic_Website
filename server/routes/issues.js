const express = require('express');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { auth, requireOfficer } = require('../middleware/auth');

const router = express.Router();

// Create new issue (public or authenticated)
router.post('/', async (req, res) => {
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
        const jwt = require('jsonwebtoken');
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
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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

// Update issue (officers only)
router.put('/:id', auth, requireOfficer, async (req, res) => {
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

// Assign issue to officer
router.patch('/:id/assign', auth, requireOfficer, async (req, res) => {
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

// Get issue statistics (officers only)
router.get('/stats/overview', auth, requireOfficer, async (req, res) => {
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

// Delete issue (officers only)
router.delete('/:id', auth, requireOfficer, async (req, res) => {
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