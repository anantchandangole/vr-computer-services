const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Engineer = require('../models/Engineer');
const bcrypt = require('bcryptjs');
const Attendance = require('../models/Attendance');
const { authenticate, adminOnly } = require('../middleware/auth');

// Initialize Admin (First Time Setup) - No authentication required
router.post('/initialize', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ username: 'administrator' });
    if (existingAdmin) {
      // Update admin password if already exists
      const password = await bcrypt.hash('desk@123', 10);
      existingAdmin.password = password;
      await existingAdmin.save();
    } else {
      // Create new admin
      const password = await bcrypt.hash('desk@123', 10);
      const admin = new Admin({ username: 'administrator', password });
      await admin.save();
    }

    // Create or update engineers
    const sampleEngineers = [];
    const engineerData = [
      { username: 'vrcs01', name: 'Engineer 01', mobile: '1234567890' },
      { username: 'vrcs02', name: 'Engineer 02', mobile: '1234567891' },
      { username: 'vrcs03', name: 'Engineer 03', mobile: '1234567892' },
      { username: 'vrcs04', name: 'Engineer 04', mobile: '1234567893' },
      { username: 'vrcs05', name: 'Engineer 05', mobile: '1234567894' },
      { username: 'VRCS05', name: 'Engineer 05 (Uppercase)', mobile: '1234567895' }
    ];

    for (const eng of engineerData) {
      const engineerPassword = await bcrypt.hash('123456', 10);
      const existingEngineer = await Engineer.findOne({ username: eng.username });
      if (existingEngineer) {
        existingEngineer.password = engineerPassword;
        existingEngineer.name = eng.name;
        existingEngineer.mobile = eng.mobile;
        existingEngineer.status = 'active';
        await existingEngineer.save();
      } else {
        const engineer = new Engineer({
          username: eng.username,
          password: engineerPassword,
          name: eng.name,
          mobile: eng.mobile,
          status: 'active'
        });
        await engineer.save();
      }
      sampleEngineers.push({ username: eng.username, name: eng.name, password: '123456' });
    }

    res.json({ 
      success: true, 
      message: 'Database initialized successfully',
      admin: { username: 'administrator', password: 'desk@123' },
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

// Reset All Engineer Passwords (Admin Only)
router.post('/reset-engineer-passwords', authenticate, adminOnly, async (req, res) => {
  try {
    const { newPassword = '123456' } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const engineers = await Engineer.find();
    let count = 0;

    for (const engineer of engineers) {
      engineer.password = hashedPassword;
      await engineer.save();
      count++;
    }

    res.json({
      success: true,
      message: `Reset passwords for ${count} engineers`,
      count,
      newPassword
    });
  } catch (error) {
    console.error('Reset engineer passwords error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
