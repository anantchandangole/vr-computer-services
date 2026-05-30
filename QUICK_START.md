# VR Computer Services - Quick Start Guide

## Getting Started (5 Minutes)

### 1. Initial Setup

```bash
# Navigate to project directory
cd "c:\xampp\htdocs\VR Computer Services"

# Install dependencies
npm install

# The .env file is already configured for development
```

### 2. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
NODE_ENV=production npm start
```

### 3. Access the Application

- **Admin Panel**: http://localhost:5000/admin
- **Engineer Portal**: http://localhost:5000/engineer
- **API Base URL**: http://localhost:5000/api

---

## Default Credentials

### Admin Login
- **Username**: administrator
- **Password**: desk@123

### Engineer Logins
- **vrcs01** / 123456
- **vrcs02** / 123456
- **vrcs03** / 123456
- **vrcs04** / 123456
- **vrcs05** / 123456

---

## API Quick Reference

### Authentication
```bash
# Admin Login
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"administrator","password":"desk@123"}'

# Engineer Login
curl -X POST http://localhost:5000/api/auth/engineer/login \
  -H "Content-Type: application/json" \
  -d '{"username":"vrcs01","password":"123456"}'
```

### Clock In
```bash
curl -X POST http://localhost:5000/api/attendance/clock-in \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"lat": 28.7041, "lng": 77.1025, "address": "Office"},
    "remark": "Starting work"
  }'
```

### Get Attendance Report
```bash
curl "http://localhost:5000/api/attendance/report?startDate=2024-05-01&endDate=2024-05-31" \
  -H "Authorization: Bearer <token>"
```

---

## Available Scripts

```bash
npm start           # Start production server
npm run dev         # Start development server with hot-reload
npm run init        # Initialize database with default users
npm run health-check # Run health check diagnostics
npm run backup      # Export data to JSON files
npm test            # Run tests (placeholder)
```

---

## Project Structure

```
VR Computer Services/
├── .env                    # Environment variables (local)
├── .env.example            # Environment template
├── server.js               # Main server file
├── package.json            # Dependencies
├── Procfile                # Render deployment config
│
├── config/
│   └── db.js              # Database configuration
│
├── middleware/
│   └── auth.js            # Authentication & authorization
│
├── models/
│   ├── Admin.js           # Admin schema
│   ├── Engineer.js        # Engineer schema
│   └── Attendance.js      # Attendance schema
│
├── routes/
│   ├── auth.js            # Authentication APIs
│   ├── engineer.js        # Engineer management APIs
│   ├── attendance.js      # Attendance/tracking APIs
│   └── admin.js           # Admin management APIs
│
└── public/
    ├── admin.html         # Admin dashboard
    ├── engineer.html      # Engineer portal
    └── css/
        ├── admin.css      # Admin styles
        ├── engineer.css   # Engineer styles
        └── style.css      # Public website styles
```

---

## MongoDB Setup

### Local Development
```bash
# Make sure MongoDB is running locally
mongod

# Test connection
mongo
```

### MongoDB Atlas (Cloud)
```
Connection URL format:
mongodb+srv://username:password@cluster.mongodb.net/vr-computer-services?retryWrites=true&w=majority

Add to .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vr-computer-services?retryWrites=true&w=majority
```

---

## Environment Variables

### Required
- `JWT_SECRET` - Secret key for JWT tokens (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `MONGODB_URI` - MongoDB connection string

### Optional
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - development or production
- `CORS_ORIGIN` - Allowed origins
- `LOG_LEVEL` - debug, info, warn, error

---

## Common Tasks

### Create New Engineer
```bash
curl -X POST http://localhost:5000/api/engineer \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vrcs06",
    "password": "Secure123!",
    "name": "Engineer 06",
    "mobile": "9876543210"
  }'
```

### Get All Engineers
```bash
curl http://localhost:5000/api/engineer \
  -H "Authorization: Bearer <admin_token>"
```

### View Attendance Report
```bash
curl "http://localhost:5000/api/attendance/report?startDate=2024-05-01&endDate=2024-05-31" \
  -H "Authorization: Bearer <admin_token>"
```

### Get Live Locations
```bash
curl http://localhost:5000/api/attendance/live-locations \
  -H "Authorization: Bearer <admin_token>"
```

---

## Testing Checklist

- [ ] Admin login works
- [ ] Engineer login works
- [ ] Clock in creates attendance record
- [ ] Clock out calculates working hours
- [ ] Location is saved
- [ ] Photo upload works
- [ ] Attendance history displays
- [ ] Reports generate correctly
- [ ] Live tracking shows locations

---

## Troubleshooting

### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :5000

# Kill process using port
taskkill /PID <PID> /F

# Or change port in .env
```

### Database connection fails
```bash
# Check MongoDB URI in .env
# Make sure MongoDB is running
mongod

# Test connection
mongo "<your-connection-string>"
```

### "JWT_SECRET not set" error
```bash
# Generate and add to .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env: JWT_SECRET=<generated-key>
```

### CORS errors
```bash
# Make sure CORS_ORIGIN in .env matches your frontend URL
# For development: http://localhost:5000
# For production: https://yourdomain.com
```

---

## Performance Tips

1. **Database**: Add indexes for frequently queried fields
2. **Caching**: Use browser cache for static assets
3. **Images**: Compress photos before upload
4. **API**: Use pagination for large result sets
5. **Frontend**: Minify CSS/JS in production

---

## Security Tips

1. ✅ Never commit `.env` to Git
2. ✅ Change default credentials in production
3. ✅ Use strong JWT_SECRET (32+ characters)
4. ✅ Enable HTTPS in production
5. ✅ Regular database backups
6. ✅ Keep dependencies updated

---

## Deployment Checklist

- [ ] `.env.example` has placeholders (no actual values)
- [ ] `.env` not in Git
- [ ] MongoDB Atlas cluster created
- [ ] JWT_SECRET generated and set
- [ ] CORS_ORIGIN set to production URL
- [ ] NODE_ENV=production
- [ ] All credentials changed
- [ ] HTTPS enabled
- [ ] Rate limiting tested
- [ ] Monitoring setup

---

## Support Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Deployment Guide**: See `PRODUCTION_DEPLOYMENT.md`
- **Audit Report**: See `AUDIT_REPORT.md`
- **Health Check**: Run `npm run health-check`

---

## Getting Help

1. Check error logs: `npm run health-check`
2. Review API docs: `API_DOCUMENTATION.md`
3. Test with Postman or curl
4. Check browser console for frontend errors
5. Review server logs for API errors

---

## Next Steps

1. ✅ Test application locally
2. ✅ Create production MongoDB Atlas cluster
3. ✅ Generate production JWT_SECRET
4. ✅ Deploy to Render
5. ✅ Configure domain and SSL
6. ✅ Setup monitoring
7. ✅ Go live!

For detailed deployment instructions, see `PRODUCTION_DEPLOYMENT.md`
