require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// ===== VALIDATION AT STARTUP =====
// Check required environment variables
const requiredEnvVars = ['JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ CRITICAL: Environment variable ${envVar} is not set!`);
    process.exit(1);
  }
});

// Import Routes
const authRoutes = require('./routes/auth');
const engineerRoutes = require('./routes/engineer');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');

// Initialize Express
const app = express();

// ===== SECURITY MIDDLEWARE =====
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https://unpkg.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate Limiting for API routes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limiting for auth routes (5 attempts per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  skip: (req) => process.env.NODE_ENV === 'development'
});

app.use('/api/auth/', authLimiter);

// ===== CORS CONFIGURATION =====
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5000').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
}));

// ===== LOGGING =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ===== BODY PARSER =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== STATIC FILES =====
app.use('/uploads', express.static(path.join(__dirname, 'imag'), {
  maxAge: 86400000,
  etag: true,
  lastModified: true
}));

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 3600000,
  etag: true,
  lastModified: true
}));

// ===== DATABASE CONNECTION =====
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services';
mongoose.connect(mongoUri, {
  retryWrites: true,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err);
});

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/engineer', engineerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// ===== INITIALIZATION ENDPOINT (Protected) =====
// This endpoint should be called during initial setup only
app.post('/api/admin/initialize', async (req, res) => {
  try {
    // Security: Only allow in development mode or with a setup key
    const setupKey = req.header('X-Setup-Key');
    if (process.env.NODE_ENV === 'production' && !setupKey) {
      return res.status(403).json({ 
        success: false, 
        message: 'Initialization not allowed in production' 
      });
    }

    const Admin = require('./models/Admin');
    const Engineer = require('./models/Engineer');
    const bcrypt = require('bcryptjs');

    // Check if already initialized
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
      { username: 'vrcs05', name: 'Engineer 05', mobile: '1234567894' }
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

    res.json({
      success: true,
      message: 'Database initialized successfully',
      credentials: {
        admin: { username: 'administrator', password: 'desk@123' },
        engineers: engineerData
      }
    });
  } catch (error) {
    console.error('Initialize error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Initialization failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// ===== PAGE SERVING =====
// Serve Admin/Engineer HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/engineer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'engineer.html'));
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path
  });
});

// ===== SERVER STARTUP =====
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log('🚀 VR Computer Services Server Started');
  console.log('🚀 ========================================');
  console.log(`📱 Server: http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`👷 Engineer Portal: http://localhost:${PORT}/engineer`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ========================================\n');
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
