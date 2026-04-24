const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Engineer = require('../models/Engineer');
const { authenticate, adminOnly } = require('../middleware/auth');

// Configure Multer for Photo Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../imag'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'engineer-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, PNG images are allowed'));
  }
});

// Get All Engineers (Admin Only)
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const engineers = await Engineer.find().select('-password');
    res.json({ success: true, engineers });
  } catch (error) {
    console.error('Error fetching engineers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get All Engineers (Public - for gallery)
router.get('/public', async (req, res) => {
  try {
    const engineers = await Engineer.find({ status: 'active' }).select('-password');
    res.json({ success: true, engineers });
  } catch (error) {
    console.error('Error fetching engineers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Single Engineer
router.get('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const engineer = await Engineer.findOne({ username: req.params.id }).select('-password');
    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }
    res.json({ success: true, engineer });
  } catch (error) {
    console.error('Error fetching engineer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create Engineer (Admin Only)
router.post('/', authenticate, adminOnly, [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('mobile').isLength({ min: 10, max: 10 }).withMessage('Mobile must be 10 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password, name, mobile } = req.body;

    const existingEngineer = await Engineer.findOne({ username });
    if (existingEngineer) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const engineer = new Engineer({ username, password, name, mobile });
    await engineer.save();

    res.status(201).json({
      success: true,
      message: 'Engineer created successfully',
      engineer: { username: engineer.username, name: engineer.name, mobile: engineer.mobile }
    });
  } catch (error) {
    console.error('Error creating engineer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Engineer (Admin Only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, mobile, status, photo } = req.body;
    
    const engineer = await Engineer.findOneAndUpdate(
      { username: req.params.id },
      { name, mobile, status, photo },
      { new: true }
    ).select('-password');

    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }

    res.json({ success: true, message: 'Engineer updated successfully', engineer });
  } catch (error) {
    console.error('Error updating engineer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete Engineer (Admin Only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const engineer = await Engineer.findOneAndDelete({ username: req.params.id });
    if (!engineer) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }
    res.json({ success: true, message: 'Engineer deleted successfully' });
  } catch (error) {
    console.error('Error deleting engineer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload Photo
router.post('/upload-photo', authenticate, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
