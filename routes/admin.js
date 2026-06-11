const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Engineer = require('../models/Engineer');
const bcrypt = require('bcryptjs');
const Attendance = require('../models/Attendance');
const { authenticate, adminOnly } = require('../middleware/auth');
const { getISTDate } = require('../utils/istDateTime');



// Dashboard Stats
router.get('/dashboard-stats', authenticate, adminOnly, async (req, res) => {
  try {
    const today = getISTDate();

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
