# Deployment Guide - VR Computer Services

## Option 1: Deploy on GitHub Pages (Free)

### Step 1: Install Git (if not already installed)
1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Open Command Prompt or PowerShell and verify:
   ```bash
   git --version
   ```

### Step 2: Initialize Git Repository
```bash
cd "c:\xampp\htdocs\VR Computer Services"
git init
```

### Step 3: Create .gitignore File (if not exists)
Create `.gitignore` file with:
```
node_modules/
.env
uploads/
imag/*.jpg
imag/*.png
imag/*.jpeg
.DS_Store
*.log
```

### Step 4: Create GitHub Repository
1. Go to https://github.com and login/signup
2. Click "+" → "New repository"
3. Name: `vr-computer-services`
4. Description: VR Computer Services Engineer Management System
5. Make it Public
6. Click "Create repository"

### Step 5: Commit and Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vr-computer-services.git
git push -u origin main
```

### Step 6: Deploy to GitHub Pages (Frontend Only)
**Note:** GitHub Pages only hosts static files. For this Node.js/Express app, you need a different approach.

## Option 2: Deploy on Render.com (Free for Node.js)

### Step 1: Push to GitHub
Complete Step 1-5 from above (GitHub setup)

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 3: Deploy Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `vr-computer-services` repository
4. Configure:
   - **Name**: vr-computer-services
   - **Region**: Singapore (closest to India)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Click "Create Web Service"

### Step 4: Set Environment Variables
1. Go to your service on Render
2. Click "Environment" tab
3. Add these variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key
   
### MongoDB Setup for Production:
- **Option A**: Use MongoDB Atlas (Free tier)
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Create free account
  3. Create cluster
  4. Get connection string
  5. Add to Render environment variables

- **Option B**: Use Render MongoDB (Paid)
  1. Create MongoDB instance on Render
  2. Use the connection URL

### Step 5: Your App is Live!
- Render will give you a URL like: `https://vr-computer-services.onrender.com`
- Access your app at that URL

## Option 3: Deploy on Railway.app (Free Tier Available)

### Step 1: Push to GitHub
Complete Step 1-5 from GitHub setup

### Step 2: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 3: Deploy Project
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Railway will detect Node.js automatically
4. Add environment variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key
5. Click "Deploy"

### Step 4: Add MongoDB
1. In Railway, click "+" → "Database"
2. Select "MongoDB"
3. Railway will provide connection string
4. Update `MONGODB_URI` in environment variables

### Step 5: Your App is Live!
- Railway provides a domain like: `https://vr-computer-services.up.railway.app`

## Option 4: Deploy on Vercel (Free)

### Step 1: Push to GitHub
Complete Step 1-5 from GitHub setup

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### Step 3: Deploy
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm install`
   - **Output Directory**: `./`
   - **Install Command**: `npm install`
4. Add environment variables
5. Click "Deploy"

### Step 4: Add MongoDB
Use MongoDB Atlas (free tier) and add connection string to environment variables

## Option 5: Deploy on DigitalOcean (Paid, $4/month)

### Step 1: Create DigitalOcean Account
1. Go to https://digitalocean.com
2. Sign up and add payment method

### Step 2: Create Droplet
1. Click "Create" → "Droplets"
2. Choose: Ubuntu 22.04 LTS
3. Plan: Basic, $4/month
4. Choose region (Singapore recommended)
5. Create droplet

### Step 3: Setup Server
SSH into your droplet:
```bash
ssh root@your-droplet-ip
```

Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Install MongoDB:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 4: Deploy Your App
Clone your repository:
```bash
git clone https://github.com/YOUR_USERNAME/vr-computer-services.git
cd vr-computer-services
npm install
```

Create .env file:
```bash
nano .env
```
Add:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vr-computer-services
JWT_SECRET=your-secret-key
```

Start the app:
```bash
npm start
```

### Step 5: Setup PM2 (Keep app running)
```bash
sudo npm install -g pm2
pm2 start server.js --name vr-computer-services
pm2 startup
pm2 save
```

### Step 6: Setup Nginx (Reverse Proxy)
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/vr-computer-services
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/vr-computer-services /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Add SSL Certificate (Free)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Recommended Hosting Option

**For Beginners:** Render.com (Free, easy setup, good for Node.js)
**For Production:** DigitalOcean ($4/month, full control, reliable)
**For Free Tier:** Railway.app or Vercel

## Important Notes

1. **Never commit .env file** - Use environment variables on hosting platform
2. **MongoDB Atlas Free Tier** - 512MB storage, good for small projects
3. **Image Uploads** - Configure proper storage (use cloud storage like AWS S3 for production)
4. **Domain Name** - Buy domain from Namecheap, GoDaddy, etc. and point to hosting
5. **Backup** - Regularly backup MongoDB database

## Quick Start with Render (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. Go to render.com
# 3. Create account with GitHub
# 4. Click "New Web Service"
# 5. Select your repository
# 6. Configure as shown above
# 7. Add environment variables
# 8. Deploy!
```

Your app will be live in 2-3 minutes!
