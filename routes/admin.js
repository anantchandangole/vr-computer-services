const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Engineer = require('../models/Engineer');
const Attendance = require('../models/Attendance');
const { authenticate, adminOnly } = require('../middleware/auth');

// Initialize Admin (First Time Setup)
router.post('/initialize', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'administrator' });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already initialized' });
    }

    const password = await bcrypt.hash('desk@123', 10);
    const admin = new Admin({ username: 'administrator', password });
    await admin.save();

    // Create sample engineers
    const sampleEngineers = [];
    for (let i = 1; i <= 5; i++) {
      const username = `vrcs${String(i).padStart(2, '0')}`;
      const engineerPassword = await bcrypt.hash('123456', 10);
      const engineer = new Engineer({
        username,
        password: engineerPassword,
        name: `Engineer ${i}`,
        mobile: `987654321${i}`
      });
      await engineer.save();
      sampleEngineers.push({ username: engineer.username, name: engineer.name, password: '123456' });
    }

    res.json({ 
      success: true, 
      message: 'Admin initialized successfully',
      admin: { username: admin.username, password: 'desk@123' },
      sampleEngineers
    });
  } catch (error) {
    console.error('Initialize error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard Stats
router.get('/dashboard-stats', authenticate, adminOnly, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalEngineers = await Engineer.countDocuments({ status: 'active' });
    const presentToday = await Attendance.countDocuments({ date: today, inTime: { $exists: true } });
    const workingNow = await Attendance.countDocuments({ date: today, status: 'Working' });
    
    const todayAttendance = await Attendance.find({ date: today });

    res.json({
      success: true,
      stats: {
        totalEngineers,
        presentToday,
        workingNow,
        absentToday: totalEngineers - presentToday
      },
      todayAttendance
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change Admin Password
router.put('/change-password', authenticate, adminOnly, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
