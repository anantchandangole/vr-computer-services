const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Engineer = require('../models/Engineer');
const { authenticate, adminOnly, engineerOnly } = require('../middleware/auth');

// ===== CLOCK IN =====
router.post('/clock-in', authenticate, engineerOnly, [
  body('location.lat')
    .optional()
    .isFloat()
    .withMessage('Location latitude must be a valid number'),
  body('location.lng')
    .optional()
    .isFloat()
    .withMessage('Location longitude must be a valid number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { location, photo, remark } = req.body;
    const engineerId = req.user._id;
    const engineerName = req.user.name;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const inTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({ engineerId, date: today });
    if (existingAttendance) {
      if (existingAttendance.inTime && !existingAttendance.outTime) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already clocked in today. Please clock out first.' 
        });
      }
      if (existingAttendance.outTime) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already completed attendance for today. Cannot clock in again.' 
        });
      }
    }

    const attendance = await Attendance.findOneAndUpdate(
      { engineerId, date: today },
      {
        engineerId,
        engineerName,
        date: today,
        inTime,
        location: location ? {
          lat: parseFloat(location.lat) || null,
          lng: parseFloat(location.lng) || null,
          address: String(location.address || '').trim()
        } : { lat: null, lng: null, address: '' },
        photo: String(photo || '').trim(),
        remark: String(remark || '').trim(),
        status: 'Working'
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Clock-in: Engineer ${engineerName} at ${inTime}`);

    res.json({ 
      success: true, 
      message: 'Clocked in successfully', 
      attendance 
    });
  } catch (error) {
    console.error('❌ Clock in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// ===== CLOCK OUT =====
router.post('/clock-out', authenticate, engineerOnly, [
  body('taskCompleted')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Task description cannot exceed 500 characters'),
  body('remark')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remark cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { taskCompleted, remark } = req.body;
    const engineerId = req.user._id;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const outTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const attendance = await Attendance.findOne({ engineerId, date: today });
    if (!attendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'No clock-in record found for today' 
      });
    }

    if (attendance.outTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already clocked out today' 
      });
    }

    // Calculate working hours
    const inDateTime = new Date(`${today} ${attendance.inTime}`);
    const outDateTime = new Date(`${today} ${outTime}`);
    const diffMs = outDateTime - inDateTime;
    
    // Prevent negative working hours
    if (diffMs < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Clock out time cannot be before clock in time' 
      });
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const workingHours = `${diffHours}h ${diffMins}m`;

    attendance.outTime = outTime;
    attendance.workingHours = workingHours;
    attendance.status = 'Completed';
    attendance.taskCompleted = String(taskCompleted || '').trim();
    if (remark) attendance.remark = String(remark).trim();
    
    await attendance.save();

    console.log(`✅ Clock-out: Engineer ${attendance.engineerName} worked ${workingHours}`);

    res.json({ 
      success: true, 
      message: 'Clocked out successfully', 
      attendance 
    });
  } catch (error) {
    console.error('❌ Clock out error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// ===== UPDATE STATUS/LOCATION (LIVE TRACKING) =====
router.put('/update-status', authenticate, engineerOnly, [
  body('location.lat')
    .optional()
    .isFloat()
    .withMessage('Location latitude must be a valid number'),
  body('location.lng')
    .optional()
    .isFloat()
    .withMessage('Location longitude must be a valid number'),
  body('status')
    .optional()
    .isIn(['Working', 'Idle', 'Pending', 'Closed'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { location, status, remark } = req.body;
    const engineerId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ engineerId, date: today });
    if (!attendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'No attendance record found. Please clock in first.' 
      });
    }

    // Update location with proper validation
    if (location) {
      attendance.location = {
        lat: parseFloat(location.lat) || null,
        lng: parseFloat(location.lng) || null,
        address: String(location.address || '').trim()
      };
    }
    
    if (status && ['Working', 'Idle', 'Pending', 'Closed'].includes(status)) {
      attendance.status = status;
    }
    
    if (remark) {
      attendance.remark = String(remark).trim().slice(0, 500);
    }
    
    await attendance.save();

    res.json({ 
      success: true, 
      message: 'Status updated successfully', 
      attendance 
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// ===== GET TODAY'S ATTENDANCE (ENGINEER) =====
router.get('/my-today', authenticate, engineerOnly, async (req, res) => {
  try {
    const engineerId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ engineerId, date: today });
    res.json({ 
      success: true, 
      attendance: attendance || null 
    });
  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== GET ENGINEER ATTENDANCE HISTORY (ENGINEER) =====
router.get('/my-history', authenticate, engineerOnly, async (req, res) => {
  try {
    const engineerId = req.user._id;
    const { startDate, endDate, limit = 30, page = 1 } = req.query;

    let query = { engineerId };
    
    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return res.status(400).json({ 
          success: false, 
          message: 'Start date cannot be after end date' 
        });
      }
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Attendance.countDocuments(query);

    res.json({ 
      success: true, 
      attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== GET ALL ATTENDANCE (ADMIN) =====
router.get('/all', authenticate, adminOnly, async (req, res) => {
  try {
    const { date, engineerId, startDate, endDate, limit = 50, page = 1 } = req.query;

    let query = {};
    
    if (date) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid date format. Use YYYY-MM-DD' 
        });
      }
      query.date = date;
    }
    
    if (engineerId) query.engineerId = engineerId;
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const attendance = await Attendance.find(query)
      .sort({ date: -1, inTime: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Attendance.countDocuments(query);

    res.json({ 
      success: true, 
      attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== GET LIVE ENGINEER LOCATIONS (ADMIN) =====
router.get('/live-locations', authenticate, adminOnly, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.find({ 
      date: today,
      status: 'Working',
      'location.lat': { $exists: true, $ne: null }
    }).select('engineerId engineerName location status inTime');

    res.json({ 
      success: true, 
      engineers: attendance 
    });
  } catch (error) {
    console.error('❌ Error fetching live locations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== GET ATTENDANCE REPORT (ADMIN ONLY) =====
router.get('/report', authenticate, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, engineerId } = req.query;
    const query = {};

    // Validate dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return res.status(400).json({ 
          success: false, 
          message: 'Start date cannot be after end date' 
        });
      }
      query.date = {};
      query.date.$gte = startDate;
      query.date.$lte = endDate;
    }

    if (engineerId) {
      // Validate engineerId format (MongoDB ObjectId)
      if (!/^[a-f\d]{24}$/i.test(engineerId) && !/^[a-zA-Z0-9_-]+$/.test(engineerId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid engineer ID' 
        });
      }
      query.engineerId = engineerId;
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    // Calculate summary
    let totalDays = 0;
    let totalHours = 0;
    let presentDays = 0;

    attendance.forEach(record => {
      if (record.inTime) {
        presentDays++;
      }
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

    totalDays = attendance.length;

    res.json({
      success: true,
      attendance,
      summary: {
        totalDays,
        presentDays,
        totalHours: parseFloat(totalHours.toFixed(1))
      }
    });
  } catch (error) {
    console.error('❌ Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;
