# VR Computer Services - API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All protected endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // if validation errors
}
```

---

## Authentication Endpoints

### Admin Login
**POST** `/auth/admin/login`

Request:
```json
{
  "username": "administrator",
  "password": "desk@123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "administrator",
    "role": "admin"
  }
}
```

---

### Engineer Login
**POST** `/auth/engineer/login`

Request:
```json
{
  "username": "vrcs01",
  "password": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "vrcs01",
    "name": "Engineer 01",
    "mobile": "1234567890",
    "role": "engineer"
  }
}
```

---

### Verify Token
**POST** `/auth/verify`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "role": "engineer",
    "username": "vrcs01"
  }
}
```

---

## Engineer Endpoints

### Get All Engineers (Admin Only)
**GET** `/engineer`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "engineers": [
    {
      "_id": "123...",
      "username": "vrcs01",
      "name": "Engineer 01",
      "mobile": "1234567890",
      "status": "active",
      "photo": "/uploads/engineer-xxx.jpg"
    }
  ]
}
```

---

### Get Single Engineer
**GET** `/engineer/:id`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "engineer": {
    "_id": "123...",
    "username": "vrcs01",
    "name": "Engineer 01",
    "mobile": "1234567890",
    "status": "active",
    "photo": "/uploads/engineer-xxx.jpg"
  }
}
```

---

### Create Engineer (Admin Only)
**POST** `/engineer`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "username": "vrcs06",
  "password": "SecurePass123!",
  "name": "Engineer 06",
  "mobile": "9876543210"
}
```

Response:
```json
{
  "success": true,
  "message": "Engineer created successfully",
  "engineer": {
    "username": "vrcs06",
    "name": "Engineer 06",
    "mobile": "9876543210"
  }
}
```

---

### Update Engineer (Admin Only)
**PUT** `/engineer/:id`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "name": "Engineer 06 Updated",
  "mobile": "9876543210",
  "status": "active",
  "password": "NewPassword123!" // optional
}
```

---

### Delete Engineer (Admin Only)
**DELETE** `/engineer/:id`

Headers: `Authorization: Bearer <token>`

---

### Upload Engineer Photo
**POST** `/engineer/upload-photo/:engineerId`

Headers:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form Data: `photo: <file>`

---

## Attendance Endpoints

### Clock In
**POST** `/attendance/clock-in`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "location": {
    "lat": 28.7041,
    "lng": 77.1025,
    "address": "123 Main Street, Delhi"
  },
  "photo": "data:image/jpeg;base64,...",
  "remark": "Starting work at office"
}
```

Response:
```json
{
  "success": true,
  "message": "Clocked in successfully",
  "attendance": {
    "_id": "123...",
    "engineerId": "456...",
    "engineerName": "Engineer 01",
    "date": "2024-05-14",
    "inTime": "09:30",
    "status": "Working",
    "location": {
      "lat": 28.7041,
      "lng": 77.1025,
      "address": "123 Main Street, Delhi"
    }
  }
}
```

---

### Clock Out
**POST** `/attendance/clock-out`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "taskCompleted": "Completed system installation at office",
  "remark": "Work finished successfully"
}
```

Response:
```json
{
  "success": true,
  "message": "Clocked out successfully",
  "attendance": {
    "outTime": "17:30",
    "workingHours": "8h 0m",
    "status": "Completed",
    "taskCompleted": "Completed system installation at office"
  }
}
```

---

### Update Status/Location
**PUT** `/attendance/update-status`

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Request:
```json
{
  "location": {
    "lat": 28.7050,
    "lng": 77.1030,
    "address": "456 Work Street"
  },
  "status": "Idle",
  "remark": "Moved to next job site"
}
```

---

### Get My Today's Attendance
**GET** `/attendance/my-today`

Headers: `Authorization: Bearer <token>`

---

### Get My Attendance History
**GET** `/attendance/my-history?startDate=2024-05-01&endDate=2024-05-31&page=1&limit=30`

Headers: `Authorization: Bearer <token>`

---

### Get All Attendance (Admin)
**GET** `/attendance/all?date=2024-05-14&page=1&limit=50`

Headers: `Authorization: Bearer <token>`

---

### Get Live Locations (Admin)
**GET** `/attendance/live-locations`

Headers: `Authorization: Bearer <token>`

Returns only engineers with active locations today.

---

### Get Attendance Report (Admin)
**GET** `/attendance/report?startDate=2024-05-01&endDate=2024-05-31&engineerId=123`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "attendance": [],
  "summary": {
    "totalDays": 20,
    "presentDays": 19,
    "totalHours": 152.5
  }
}
```

---

## Admin Endpoints

### Initialize Database (First Run Only)
**POST** `/admin/initialize`

Headers:
```
Content-Type: application/json
X-Setup-Key: your-setup-key (production only)
```

Creates default admin and engineer accounts.

---

## Status Codes

- **200**: Success
- **400**: Bad Request / Validation Error
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limited)
- **500**: Server Error

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Login Endpoints**: 5 requests per 15 minutes

When rate limited, response status is `429` with message:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## Error Examples

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "value": "abc",
      "msg": "Username must be between 3 and 50 characters",
      "param": "username",
      "location": "body"
    }
  ]
}
```

### Token Expired
```json
{
  "success": false,
  "message": "Token has expired"
}
```

---

## Examples with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/engineer/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vrcs01",
    "password": "123456"
  }'
```

### Clock In
```bash
curl -X POST http://localhost:5000/api/attendance/clock-in \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "lat": 28.7041,
      "lng": 77.1025,
      "address": "Office"
    },
    "remark": "Starting work"
  }'
```

### Get Attendance Report
```bash
curl "http://localhost:5000/api/attendance/report?startDate=2024-05-01&endDate=2024-05-31" \
  -H "Authorization: Bearer <token>"
```

---

## API Health Check

To check if API is running:

```bash
curl http://localhost:5000/api/auth/verify
# Should return 401 (no token) but API responds
```

---

## Webhooks & Events

Current version does not have webhooks. Future versions may include:
- Attendance notifications
- Engineer location alerts
- Shift completion notifications
