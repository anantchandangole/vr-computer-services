const jwt = require('jsonwebtoken');
const Engineer = require('../models/Engineer');
const Admin = require('../models/Admin');

// Middleware to verify JWT token and attach user to request
exports.authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      });
    }

    // Parse Bearer token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }

    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired' 
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      throw error;
    }

    // Retrieve user based on role
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({ 
          success: false, 
          message: 'Admin not found' 
        });
      }
      req.user = admin;
      req.role = 'admin';
    } else if (decoded.role === 'engineer') {
      const engineer = await Engineer.findById(decoded.id);
      if (!engineer) {
        return res.status(401).json({ 
          success: false, 
          message: 'Engineer not found' 
        });
      }
      if (engineer.status !== 'active') {
        return res.status(403).json({ 
          success: false, 
          message: 'Account is inactive' 
        });
      }
      req.user = engineer;
      req.role = 'engineer';
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid role in token' 
      });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// Middleware to verify admin access
exports.adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Middleware to verify engineer access
exports.engineerOnly = (req, res, next) => {
  if (req.role !== 'engineer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Engineer privileges required.' 
    });
  }
  next();
};

// Middleware for optional authentication
exports.optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.role === 'engineer') {
        const engineer = await Engineer.findById(decoded.id);
        if (engineer) {
          req.user = engineer;
          req.role = 'engineer';
        }
      }
    }
    next();
  } catch (error) {
    // If auth fails, just continue without user
    next();
  }
};
