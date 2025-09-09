const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['citizen', 'officer'],
    default: 'citizen'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Officer-specific fields
  officerId: {
    type: String,
    sparse: true, // Only required for officers
    unique: true,
    trim: true
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  designation: {
    type: String,
    trim: true,
    maxlength: 100
  },
  isVerified: {
    type: Boolean,
    default: function() {
      return this.role === 'citizen'; // Citizens are auto-verified, officers need manual verification
    }
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Account lock constants
userSchema.statics.MAX_LOGIN_ATTEMPTS = 5;
userSchema.statics.LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Compare password method with account lockout
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If account is locked, don't attempt password comparison
  if (this.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  // If password doesn't match, increment login attempts
  if (!isMatch) {
    this.loginAttempts += 1;
    
    // If we have reached max attempts and it's not locked already, lock the account
    if (this.loginAttempts >= this.constructor.MAX_LOGIN_ATTEMPTS && !this.isLocked) {
      this.lockUntil = Date.now() + this.constructor.LOCK_TIME;
    }
    
    await this.save();
    throw new Error('Invalid password');
  }
  
  // If password matches and there were previous failed attempts, reset them
  if (this.loginAttempts > 0) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    this.lastLogin = new Date();
    await this.save();
  }
  
  return true;
};

// Verify officer method
userSchema.methods.verifyOfficer = async function(verifiedByUserId) {
  if (this.role !== 'officer') {
    throw new Error('Only officers can be verified');
  }
  
  this.isVerified = true;
  this.verifiedBy = verifiedByUserId;
  this.verifiedAt = new Date();
  await this.save();
  
  return this;
};

// Check if officer is verified
userSchema.methods.isOfficerVerified = function() {
  return this.role === 'officer' ? this.isVerified : true;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

module.exports = mongoose.model('User', userSchema);