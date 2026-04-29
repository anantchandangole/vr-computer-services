const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Engineer = require('../models/Engineer');
const { authenticate, adminOnly, engineerOnly } = require('../middleware/auth');

// Clock IN
router.post('/clock-in', authenticate, engineerOnly, async (req, res) => {
  try {
    const { location, photo, remark } = req.body;
    const engineerId = req.user.username;
    const engineerName = req.user.name;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const inTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({ engineerId, date: today });
    if (existingAttendance && existingAttendance.inTime) {
      return res.status(400).json({ success: false, message: 'Already clocked in today' });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { engineerId, date: today },
      {
        engineerId,
        engineerName,
        date: today,
        inTime,
        location: location || { lat: null, lng: null, address: '' },
        photo: photo || '',
        remark: remark || '',
        status: 'Working'
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Clocked in successfully', attendance });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clock OUT
router.post('/clock-out', authenticate, engineerOnly, async (req, res) => {
  try {
    const { taskCompleted, remark } = req.body;
    const engineerId = req.user.username;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const outTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const attendance = await Attendance.findOne({ engineerId, date: today });
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No clock-in record found for today' });
    }

    if (attendance.outTime) {
      return res.status(400).json({ success: false, message: 'Already clocked out today' });
    }

    // Calculate working hours
    const inDateTime = new Date(`${today} ${attendance.inTime}`);
    const outDateTime = new Date(`${today} ${outTime}`);
    const diffMs = outDateTime - inDateTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const workingHours = `${diffHours}h ${diffMins}m`;

    attendance.outTime = outTime;
    attendance.workingHours = workingHours;
    attendance.status = 'Completed';
    attendance.taskCompleted = taskCompleted || '';
    if (remark) attendance.remark = remark;
    await attendance.save();

    res.json({ success: true, message: 'Clocked out successfully', attendance });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Status/Location (Live Tracking)
router.put('/update-status', authenticate, engineerOnly, async (req, res) => {
  try {
    const { location, status, remark } = req.body;
    const engineerId = req.user.username;

    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ engineerId, date: today });
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No attendance record found' });
    }

    if (location) attendance.location = location;
    if (status) attendance.status = status;
    if (remark) attendance.remark = remark;
    await attendance.save();

    res.json({ success: true, message: 'Status updated successfully', attendance });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Today's Attendance (Engineer)
router.get('/my-today', authenticate, engineerOnly, async (req, res) => {
  try {
    const engineerId = req.user.username;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ engineerId, date: today });
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Engineer Attendance History (Engineer)
router.get('/my-history', authenticate, engineerOnly, async (req, res) => {
  try {
    const engineerId = req.user.username;
    const { startDate, endDate } = req.query;

    let query = { engineerId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get All Attendance (Admin)
router.get('/all', authenticate, adminOnly, async (req, res) => {
  try {
    const { date, engineerId, startDate, endDate } = req.query;

    let query = {};
    if (date) query.date = date;
    if (engineerId) query.engineerId = engineerId;
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).sort({ date: -1, inTime: -1 });
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Live Engineer Locations (Admin)
router.get('/live-locations', authenticate, adminOnly, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.find({ 
      date: today,
      status: 'Working'
    }).select('engineerId engineerName location status inTime');

    res.json({ success: true, engineers: attendance });
  } catch (error) {
    console.error('Error fetching live locations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Attendance Report (Admin Only)
router.get('/report', authenticate, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, engineerId } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    if (engineerId) {
      query.engineerId = engineerId;
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // Populate engineer names
    const populatedAttendance = await Promise.all(attendance.map(async (record) => {
      const engineer = await Engineer.findOne({ username: record.engineerId });
      return {
        ...record.toObject(),
        engineerName: engineer ? engineer.name : 'Unknown'
      };
    }));

    // Calculate summary
    const totalDays = populatedAttendance.length;
    let totalHours = 0;

    populatedAttendance.forEach(record => {
      if (record.workingHours) {
        // Parse "5h 30m" format to decimal hours
        const match = record.workingHours.match(/(\d+)h\s*(\d+)?m?/);
        if (match) {
          const hours = parseInt(match[1]) || 0;
          const minutes = parseInt(match[2]) || 0;
          totalHours += hours + (minutes / 60);
        }
      }
    });

    res.json({
      success: true,
      attendance: populatedAttendance,
      summary: {
        totalDays,
        totalHours: totalHours.toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
