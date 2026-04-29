# VR Computer Services - Bank AMC & Engineer Tracking System

A comprehensive web application for managing bank AMC services and tracking field engineers with live location monitoring, attendance management, and reporting.

## 🌟 Features

### Public Website
- **Home Page**: Company introduction and key statistics
- **About Us**: Company background and certifications
- **Services**: Hardware repair, networking, security systems, bank AMC
- **Clients**: Bank client showcase (SBI, Central Bank)
- **Contact**: Contact form and Google Maps integration

### Admin Panel
- **Authentication**: Secure admin login
- **Dashboard**: Real-time statistics and today's attendance
- **Engineer Management**: Add, edit, delete engineers
- **Attendance Tracking**: View all attendance records with filters
- **Live Tracking**: Monitor engineer locations in real-time
- **Reports**: Generate and export attendance reports
- **Photo Management**: View engineer photo proofs

### Engineer Portal
- **Authentication**: Secure engineer login
- **Clock In/Out**: Mark attendance with location and photo
- **Live Status**: Update current work status and location
- **Attendance History**: View personal attendance records
- **Mobile Responsive**: Optimized for field use

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcryptjs** - Password hashing

### Frontend
- **HTML5/CSS3** - Markup and styling
- **JavaScript (ES6+)** - Client-side logic
- **Font Awesome** - Icons
- **Responsive Design** - Mobile-first approach

## 📁 Project Structure

```
VR Computer Services/
├── config/
│   └── db.js                 # Database configuration
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── Admin.js              # Admin model
│   ├── Engineer.js           # Engineer model
│   └── Attendance.js         # Attendance model
├── routes/
│   ├── admin.js              # Admin routes
│   ├── auth.js               # Authentication routes
│   ├── attendance.js         # Attendance routes
│   └── engineer.js           # Engineer routes
├── public/
│   ├── css/
│   │   ├── admin.css         # Admin panel styles
│   │   ├── engineer.css      # Engineer portal styles
│   │   └── style.css         # Public website styles
│   ├── js/
│   │   ├── admin.js          # Admin panel JavaScript
│   │   ├── engineer.js       # Engineer portal JavaScript
│   │   └── main.js           # Public website JavaScript
│   ├── images/               # Image assets
│   ├── admin.html            # Admin panel
│   ├── engineer.html         # Engineer portal
│   └── index.html            # Public website homepage
├── uploads/                  # Uploaded photos (auto-created)
├── .env                      # Environment variables (create this)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── package.json              # Node dependencies
├── server.js                 # Main server file
└── README.md                 # This file
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git (optional)

### Step 1: Clone or Download
```bash
cd "c:\xampp\htdocs\VR Computer Services"
```

### Step 2: Install Dependencies
```bash
npm install
```

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
