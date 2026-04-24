const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  engineerId: {
    type: String,
    required: true,
    ref: 'Engineer'
  },
  engineerName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  inTime: {
    type: String
  },
  outTime: {
    type: String
  },
  workingHours: {
    type: String
  },
  status: {
    type: String,
    enum: ['Working', 'Idle', 'Completed'],
    default: 'Idle'
  },
  remark: {
    type: String,
    default: ''
  },
  location: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    },
    address: {
      type: String
    }
  },
  photo: {
    type: String
  },
  taskCompleted: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
attendanceSchema.index({ engineerId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
