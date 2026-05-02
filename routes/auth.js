const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Engineer = require('../models/Engineer');
const Admin = require('../models/Admin');

// Admin Login
router.post('/admin/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    console.log('Admin login attempt:', username);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin not found:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Password mismatch for admin:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET not set' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Admin login successful:', username);
    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: { username: admin.username, role: 'admin' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Engineer Login
router.post('/engineer/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    console.log('Engineer login attempt:', username);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const engineer = await Engineer.findOne({ username });
    if (!engineer) {
      console.log('Engineer not found:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (engineer.status !== 'active') {
      console.log('Engineer account inactive:', username);
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, engineer.password);
    if (!isMatch) {
      console.log('Password mismatch for engineer:', username);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET not set' });
    }

    const token = jwt.sign(
      { id: engineer._id, role: 'engineer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Engineer login successful:', username);
    res.json({
      success: true,
      message: 'Engineer login successful',
      token,
      user: {
        username: engineer.username,
        name: engineer.name,
        mobile: engineer.mobile,
        role: 'engineer'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
