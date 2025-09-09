const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['road', 'water', 'electricity', 'garbage', 'park', 'other']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  images: [{
    type: String,
    trim: true
  }],
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous submissions
  },
  citizenName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  citizenContact: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
issueSchema.index({ status: 1, category: 1, createdAt: -1 });
issueSchema.index({ citizenId: 1 });
issueSchema.index({ assignedOfficer: 1 });

module.exports = mongoose.model('Issue', issueSchema);