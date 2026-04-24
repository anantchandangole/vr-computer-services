const jwt = require('jsonwebtoken');
const Engineer = require('../models/Engineer');
const Admin = require('../models/Admin');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Admin not found' });
      }
      req.user = admin;
      req.role = 'admin';
    } else if (decoded.role === 'engineer') {
      const engineer = await Engineer.findById(decoded.id);
      if (!engineer) {
        return res.status(401).json({ success: false, message: 'Engineer not found' });
      }
      req.user = engineer;
      req.role = 'engineer';
    } else {
      return res.status(401).json({ success: false, message: 'Invalid role' });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

exports.engineerOnly = (req, res, next) => {
  if (req.role !== 'engineer') {
    return res.status(403).json({ success: false, message: 'Access denied. Engineer only.' });
  }
  next();
};
