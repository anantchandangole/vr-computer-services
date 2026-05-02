# 🚀 Quick Deployment Guide - VR Computer Services

Your code has been pushed to GitHub and is ready to deploy online!

## **Recommended: Deploy on Render.com (Free & Easy)**

### Step 1: Setup MongoDB Atlas (Free Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Sign Up"** (or login if you have account)
3. Create a free account
4. Click "Create Deployment" → Select **"M0 (Free)"**
5. Choose region closest to India
6. Click "Create"
7. Go to **"Database"** → **"Connect"** → **"Drivers"**
8. Copy the connection string (it will look like):
   ```
   mongodb+srv://username:password@cluster0.xxx.mongodb.net/engineer-trac?retryWrites=true&w=majority
   ```
   **Important:** Replace `<username>` and `<password>` with your credentials

### Step 2: Deploy on Render.com
1. Go to https://render.com
2. Click **"Sign Up"** and choose **"Sign up with GitHub"**
3. Authorize Render to access your GitHub
4. Click **"New +"** → **"Web Service"**
5. Select repository: **"anantchandangole/vr-computer-services"**
6. Configure settings:
   - **Name**: `vr-computer-services`
   - **Region**: `Singapore` (closest to India)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
7. Click **"Create Web Service"**

### Step 3: Add Environment Variables
1. In Render dashboard, go to your service → **"Environment"** tab
2. Add these variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/engineer-trac?retryWrites=true&w=majority
   JWT_SECRET=your-random-secret-key-here-change-this
   ```
3. Click **"Save"**

### Step 4: Wait for Deployment
- Render will automatically build and deploy
- Check deployment status in the dashboard
- You'll see logs as it builds
- Once complete, you'll get a URL like: `https://vr-computer-services.onrender.com`

### Step 5: Initialize Database
1. Open your deployed app: `https://vr-computer-services.onrender.com/api/admin/initialize`
2. You should see: `{"success":false,"message":"Admin already initialized"}`
3. If this works, your app is live! ✅

---

## **Try These Admin & Engineer Logins:**

| Role | Username | Password |
|------|----------|----------|
| Admin | administrator | desk@123 |
| Engineer 1 | vrcs01 | 123456 |
| Engineer 2 | vrcs02 | 123456 |
| Engineer 3 | vrcs03 | 123456 |
| Engineer 4 | vrcs04 | 123456 |
| Engineer 5 | vrcs05 | 123456 |

---

## **Alternative: Deploy on Railway.app**

1. Go to https://railway.app
2. Click **"Start Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway automatically detects Node.js
5. Add environment variables (same as above)
6. Click **"Deploy"**
7. Railway will provide a domain

---

## **Common Issues & Fixes**

### ❌ "MongoDB Connection Error"
- Check your `MONGODB_URI` in environment variables
- Make sure MongoDB Atlas cluster is running
- Verify username/password are correct

### ❌ "Port already in use"
- This shouldn't happen on Render/Railway (they assign a port)
- Locally, restart the service

### ❌ "Cannot login"
- Call the `/api/admin/initialize` endpoint
- Make sure MongoDB is connected
- Check credentials: `administrator` / `desk@123`

---

## **Your App URLs After Deployment**

Once deployed on Render:
- **Main URL**: `https://vr-computer-services.onrender.com`
- **Admin Panel**: `https://vr-computer-services.onrender.com/admin`
- **Engineer Portal**: `https://vr-computer-services.onrender.com/engineer`
- **API Base**: `https://vr-computer-services.onrender.com/api`

---

## **Need Help?**

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.mongodb.com/manual/
- **GitHub Issues**: Check your repository for any errors

---

**Happy Deploying! 🎉**
