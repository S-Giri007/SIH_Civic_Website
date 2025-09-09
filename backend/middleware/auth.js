const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const requireOfficer = (req, res, next) => {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ message: 'Access denied. Officer role required.' });
  }
  next();
};

const requireCitizen = (req, res, next) => {
  if (req.user.role !== 'citizen') {
    return res.status(403).json({ message: 'Access denied. Citizen role required.' });
  }
  next();
};

module.exports = { auth, requireOfficer, requireCitizen };