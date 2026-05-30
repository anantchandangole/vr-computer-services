const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Engineer = require('../models/Engineer');
const Admin = require('../models/Admin');

// ===== ADMIN LOGIN =====
router.post('/admin/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username contains invalid characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: 'admin',
        username: admin.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Admin login successful: ${username}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        username: admin.username, 
        role: 'admin' 
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// ===== ENGINEER LOGIN =====
router.post('/engineer/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username contains invalid characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Find engineer
    const engineer = await Engineer.findOne({ username }).select('+password');
    if (!engineer) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Check if account is active
    if (engineer.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been deactivated. Contact admin.' 
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, engineer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: engineer._id, 
        role: 'engineer',
        username: engineer.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Engineer login successful: ${username}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: engineer.username,
        name: engineer.name,
        mobile: engineer.mobile,
        role: 'engineer'
      }
    });
  } catch (error) {
    console.error('❌ Engineer login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// ===== VERIFY TOKEN (Optional) =====
router.post('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        role: decoded.role,
        username: decoded.username
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
});

module.exports = router;
