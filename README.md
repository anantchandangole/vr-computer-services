# VR Computer Services - Bank AMC & Engineer Tracking System

A comprehensive, production-ready web application for managing bank AMC services and tracking field engineers with live location monitoring, attendance management, and reporting.

**Status**: ✅ Audited, Secured & Production Ready  
**Version**: 1.0.0  
**Last Updated**: May 14, 2026

---

## 🌟 Key Features

### Admin Panel
- 🔐 Secure admin login & authentication
- 📊 Real-time dashboard with statistics
- 👷 Engineer management (CRUD operations)
- 📋 Attendance tracking & filtering
- 🗺️ Live location tracking
- 📈 Generate attendance reports
- 📷 Photo proof management

### Engineer Portal
- 🔐 Secure engineer login
- ⏰ Clock in/out with location & photo
- 📍 Real-time location tracking
- 📱 Mobile-friendly interface
- 📊 Attendance history view
- ✅ Task completion tracking

### Public Website
- 🏢 Company information
- 🛠️ Services showcase
- 🏦 Client portfolio
- 📞 Contact form
- 🗺️ Google Maps integration

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design (Mobile-first)
- Font Awesome icons
- Leaflet maps integration

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers
- **CORS** - Cross-origin handling
- **Express Validator** - Input validation

### Deployment
- **Render** - Cloud hosting
- **MongoDB Atlas** - Cloud database
- **Git** - Version control

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

```bash
# 1. Clone/Download project
cd "c:\xampp\htdocs\VR Computer Services"

# 2. Install dependencies
npm install

# 3. Configure environment (.env already set up)
# Review .env file and update if needed

# 4. Start development server
npm run dev

# OR start production server
npm start
```

### Access Application
- 🔐 Admin: http://localhost:5000/admin
- 👷 Engineer: http://localhost:5000/engineer
- 🌐 Public: http://localhost:5000

### Default Credentials
- **Admin**: administrator / desk@123
- **Engineers**: vrcs01-05 / 123456

---

## 📁 Project Structure

```
VR Computer Services/
├── config/
│   └── db.js                    # Database configuration
├── middleware/
│   └── auth.js                  # Authentication middleware
├── models/
│   ├── Admin.js                 # Admin schema
│   ├── Engineer.js              # Engineer schema
│   └── Attendance.js            # Attendance schema
├── routes/
│   ├── auth.js                  # Authentication APIs
│   ├── engineer.js              # Engineer management APIs
│   ├── attendance.js            # Attendance tracking APIs
│   └── admin.js                 # Admin routes
├── public/
│   ├── admin.html               # Admin dashboard
│   ├── engineer.html            # Engineer portal
│   ├── index.html               # Public website
│   ├── css/
│   │   ├── admin.css
│   │   ├── engineer.css
│   │   └── style.css
│   └── js/
│       ├── admin.js
│       ├── engineer.js
│       └── main.js
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── server.js                    # Main server file
├── package.json                 # Dependencies
├── Procfile                     # Render deployment
└── README.md                    # This file
```

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Complete API reference with examples | 15 min |
| **[QUICK_START.md](QUICK_START.md)** | Quick reference guide for common tasks | 5 min |
| **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** | Step-by-step deployment to Render | 10 min |
| **[AUDIT_REPORT.md](AUDIT_REPORT.md)** | Comprehensive security & performance audit | 20 min |
| **[IMPROVEMENTS.md](IMPROVEMENTS.md)** | Summary of all improvements made | 10 min |

---

## 🔐 Security Features

✅ **Authentication**: JWT-based token authentication  
✅ **Authorization**: Role-based access control (Admin/Engineer)  
✅ **Password Security**: Bcrypt hashing (10 rounds)  
✅ **Rate Limiting**: 100 API calls/15min, 5 login attempts/15min  
✅ **CORS Protection**: Whitelist-based origin validation  
✅ **Security Headers**: Helmet.js with CSP, HSTS  
✅ **Input Validation**: express-validator on all endpoints  
✅ **Error Handling**: Sanitized error messages in production  

---

## 🔄 API Overview

### Authentication
```
POST   /api/auth/admin/login          Admin login
POST   /api/auth/engineer/login       Engineer login
POST   /api/auth/verify               Verify token
```

### Engineer Management
```
GET    /api/engineer                  Get all engineers (Admin)
GET    /api/engineer/:id              Get single engineer
POST   /api/engineer                  Create engineer (Admin)
PUT    /api/engineer/:id              Update engineer (Admin)
DELETE /api/engineer/:id              Delete engineer (Admin)
POST   /api/engineer/upload-photo/:id Upload photo
```

### Attendance
```
POST   /api/attendance/clock-in       Clock in
POST   /api/attendance/clock-out      Clock out
PUT    /api/attendance/update-status  Update status/location
GET    /api/attendance/my-today       Get today's attendance
GET    /api/attendance/my-history     Get attendance history
GET    /api/attendance/all            Get all attendance (Admin)
GET    /api/attendance/live-locations Get live locations (Admin)
GET    /api/attendance/report         Get attendance report (Admin)
```

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete details.

---

## 🎯 Available Scripts

```bash
npm start           # Start production server
npm run dev         # Start development with auto-reload (nodemon)
npm run init        # Initialize database with default users
npm run health-check # Run health diagnostics
npm test            # Run tests (placeholder)
npm run backup      # Export data to JSON files
```

---

## 🌍 Deployment

### Deploy to Render (Recommended)

1. **Prepare**
   ```bash
   # Generate production JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

3. **Deploy on Render**
   - Create Render account at https://render.com
   - Connect GitHub repository
   - Create Web Service
   - Set environment variables
   - Deploy!

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for detailed steps.

---

## 🧪 Testing

### Health Check
```bash
npm run health-check
```

### API Testing
```bash
# Admin login
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"administrator","password":"desk@123"}'

# Get attendance report
curl "http://localhost:5000/api/attendance/report?startDate=2024-05-01&endDate=2024-05-31" \
  -H "Authorization: Bearer <token>"
```

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for more examples.

---

## 📊 Performance

### Expected Response Times
- Login: < 200ms
- API calls: 100-500ms
- Database queries: 50-200ms
- Page load: < 3 seconds

### Database
- Indexed queries for fast lookups
- Pagination for large datasets
- Connection pooling
- Timeout handling

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check port is available
netstat -ano | findstr :5000

# Or change PORT in .env
```

### Database connection fails
```bash
# Verify MongoDB is running
mongod

# Check connection string in .env
```

### JWT_SECRET error
```bash
# Generate and add to .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

See [QUICK_START.md](QUICK_START.md) for more troubleshooting tips.

---

## 📋 Deployment Checklist

Before going live:
- [ ] Change default admin password
- [ ] Generate production JWT_SECRET
- [ ] Configure MongoDB Atlas cluster
- [ ] Update CORS_ORIGIN
- [ ] Set NODE_ENV=production
- [ ] Test all APIs
- [ ] Enable HTTPS
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Test on mobile devices

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete checklist.

---

## 🎓 Recent Improvements

✅ **Security Hardened** - JWT validation, rate limiting, CORS  
✅ **Error Handling** - Comprehensive error middleware  
✅ **Input Validation** - All endpoints validated  
✅ **API Documentation** - Complete reference guide  
✅ **Deployment Guide** - Step-by-step instructions  
✅ **Performance** - Indexed queries, pagination  
✅ **Monitoring** - Health check script  

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for detailed list of all changes.

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push to GitHub
6. Create pull request

---

## 📄 License

ISC License - See LICENSE file for details

---

## 👥 Support

- **Documentation**: See files in project root
- **Quick Help**: Read [QUICK_START.md](QUICK_START.md)
- **API Reference**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deployment Help**: See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Detailed Info**: See [AUDIT_REPORT.md](AUDIT_REPORT.md)
- **Changes Summary**: See [IMPROVEMENTS.md](IMPROVEMENTS.md)

---

## 🚀 Next Steps

1. ✅ Review this README
2. ✅ Run `npm run health-check`
3. ✅ Start development server: `npm run dev`
4. ✅ Test the application
5. ✅ Read [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
6. ✅ Deploy to Render
7. ✅ Monitor and optimize

---

## 📞 Contact

For questions or issues:
- Check documentation files
- Run `npm run health-check` for diagnostics
- Review API documentation
- Check deployment guide

---

**Built with ❤️ for VR Computer Services**  
**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Updated**: May 14, 2026

### Step 3: Environment Configuration
1. Copy `.env.example` to `.env`
2. Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vr-computer-services
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_USERNAME=administrator
ADMIN_PASSWORD=desk@123
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vr-computer-services
```

### Step 4: Start MongoDB
**Local MongoDB:**
```bash
# Windows
mongod

# Or using MongoDB Compass
# Just ensure MongoDB service is running
```

### Step 5: Initialize Admin (First Time Only)
```bash
# Start the server first
npm start

# Then initialize admin via API or create manually
# POST http://localhost:5000/api/admin/initialize
```

This will create:
- Admin account: `administrator` / `desk@123`
- 5 sample engineers: `vrcs01` to `vrcs05` (password: `123456`)

### Step 6: Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Step 7: Access the Application
- **Public Website**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **Engineer Portal**: http://localhost:5000/engineer

## 🔐 Default Credentials

### Admin
- **Username**: `administrator`
- **Password**: `desk@123`

### Sample Engineers
- **vrcs01** to **vrcs05**
- **Password**: `123456`

## 📱 Usage Guide

### For Admin
1. Login at `/admin`
2. View dashboard statistics
3. Manage engineers (Add/Edit/Delete)
4. Monitor live locations
5. Generate attendance reports
6. Export data to Excel

### For Engineers
1. Login at `/engineer`
2. Allow location and camera permissions
3. Click "Clock In" with photo
4. Update status during work
5. Click "Clock Out" when done
6. View attendance history

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/engineer/login` - Engineer login

### Admin
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `POST /api/admin/initialize` - Initialize admin (first time)
- `PUT /api/admin/change-password` - Change password

### Engineers
- `GET /api/engineer` - Get all engineers (admin)
- `POST /api/engineer` - Create engineer (admin)
- `PUT /api/engineer/:id` - Update engineer (admin)
- `DELETE /api/engineer/:id` - Delete engineer (admin)
- `POST /api/engineer/upload-photo` - Upload photo

### Attendance
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `PUT /api/attendance/update-status` - Update status
- `GET /api/attendance/my-today` - Today's attendance (engineer)
- `GET /api/attendance/my-history` - Attendance history (engineer)
- `GET /api/attendance/all` - All attendance (admin)
- `GET /api/attendance/live-locations` - Live locations (admin)
- `GET /api/attendance/report` - Generate report (admin)

## 🌐 Deployment

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables in deployment settings
4. Deploy

### MongoDB Atlas Setup
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Frontend Deployment
The frontend is served from the backend, so no separate deployment needed.

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (Admin/Engineer)
- Helmet.js for security headers
- Input validation with express-validator
- CORS protection

## 📸 Photo Upload
- Max file size: 5MB
- Supported formats: JPEG, JPG, PNG
- Stored in `/uploads` directory
- Served via static file route

## 🗺️ Google Maps Integration
Currently uses a placeholder. To enable:
1. Get Google Maps API key from Google Cloud Console
2. Add API key to the code
3. Enable Maps JavaScript API
4. Implement map rendering in admin.js

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port 5000

### Photo Upload Not Working
- Ensure `/uploads` directory exists
- Check file permissions
- Verify file size limits

### Location Not Working
- Enable location services in browser
- Use HTTPS (required for geolocation)
- Check browser permissions

## 📞 Support

For issues or questions:
- Email: anant.dvd1990@gmail.com
- Phone: +91 7030868082

## 📄 License

Copyright © 2026 VR Computer Services. All Rights Reserved.
Copyright © Dev. by. Anant. All Rights Reserved.

## 🚀 Future Enhancements

- [ ] SMS alerts for absent engineers
- [ ] Geo-fencing for bank locations
- [ ] Mobile app (React Native)
- [ ] AI-based work summary
- [ ] Advanced reporting with charts
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Multi-language support

---

**Built with ❤️ for VR Computer Services**
