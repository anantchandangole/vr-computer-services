require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/auth');
const engineerRoutes = require('./routes/engineer');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'imag')));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/engineer', engineerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Initialize Database Route (Direct access for production setup)
app.get('/initialize-db', async (req, res) => {
  try {
    const Admin = require('./models/Admin');
    const Engineer = require('./models/Engineer');
    const bcrypt = require('bcryptjs');

    const existingAdmin = await Admin.findOne({ username: 'administrator' });
    if (existingAdmin) {
      const password = await bcrypt.hash('desk@123', 10);
      existingAdmin.password = password;
      await existingAdmin.save();
    } else {
      const password = await bcrypt.hash('desk@123', 10);
      const admin = new Admin({ username: 'administrator', password });
      await admin.save();
    }

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
    }

    res.send(`
      <html>
        <head><title>Database Initialized</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: green;">✅ Database Initialized Successfully!</h1>
          <h2>Login Credentials:</h2>
          <p><strong>Admin:</strong> administrator / desk@123</p>
          <p><strong>Engineers:</strong> vrcs01, vrcs02, vrcs03, vrcs04, vrcs05, VRCS05 / 123456</p>
          <p><a href="/admin">Go to Admin Login</a></p>
          <p><a href="/engineer">Go to Engineer Login</a></p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Initialize error:', error);
    res.status(500).send(`
      <html>
        <head><title>Initialization Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: red;">❌ Initialization Failed</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Stack:</strong> ${error.stack}</p>
        </body>
      </html>
    `);
  }
});

// Serve Public Website (Frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve Admin Panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve Engineer Portal
app.get('/engineer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'engineer.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Public Site: http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`👷 Engineer Portal: http://localhost:${PORT}/engineer`);
});
