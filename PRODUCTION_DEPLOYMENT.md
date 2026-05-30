# VR Computer Services - Production Deployment Guide

## Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` in production `.env`
- [ ] Use MongoDB Atlas with strong password
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Review CSP (Content Security Policy) headers
- [ ] Enable rate limiting
- [ ] Add CORS whitelist (not `*`)

### Database
- [ ] Create production MongoDB cluster
- [ ] Set database backups
- [ ] Create database indexes
- [ ] Test data migration

### Frontend
- [ ] Test all pages on mobile/tablet/desktop
- [ ] Verify camera access works
- [ ] Test location services
- [ ] Run Lighthouse audit
- [ ] Minify CSS/JS in production

### Backend
- [ ] Update CORS_ORIGIN URLs
- [ ] Test all API endpoints
- [ ] Verify error messages don't expose internals
- [ ] Set up logging
- [ ] Test rate limiting

## Deployment Steps

### 1. Prepare Environment Variables

Create `.env` with production values:

```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vr-computer-services?retryWrites=true&w=majority
JWT_SECRET=<generate-secure-key>
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
LOG_LEVEL=warn
```

### 2. Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy to Render

1. **Create Render account**: https://render.com
2. **Connect GitHub repository**
3. **Create Web Service**:
   - **Service Name**: vr-computer-services
   - **Region**: Singapore (or closest to your location)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

4. **Set Environment Variables** in Render dashboard:
   - Add all variables from production `.env`

5. **Create MongoDB Database**:
   - Use MongoDB Atlas (recommended)
   - Get connection string
   - Add to environment variables

6. **Deploy**:
   - Render will automatically build and deploy
   - Monitor deployment logs

### 4. Post-Deployment

```bash
# Test API
curl https://your-app.onrender.com/api/auth/verify

# Check logs in Render dashboard
# Monitor performance

# Setup custom domain (optional)
# Add SSL certificate
```

## Common Issues

### Cold Start Problem
- **Issue**: Render takes 30+ seconds to start
- **Solution**: Use Render's paid plans or keep-alive services

### MongoDB Connection Timeout
- **Issue**: `ECONNREFUSED` or `ETIMEDOUT`
- **Solution**: 
  - Check MongoDB URI is correct
  - Allow Render IP in MongoDB Atlas whitelist
  - Increase connection timeout

### CORS Errors
- **Issue**: "Access-Control-Allow-Origin" errors
- **Solution**: Add correct domain to `CORS_ORIGIN`

### Rate Limiting Too Strict
- **Adjust**: Increase `RATE_LIMIT_MAX_REQUESTS` in env

## Monitoring & Maintenance

### Daily Checks
- [ ] API response times
- [ ] Error logs
- [ ] Database size
- [ ] Rate limit hits

### Weekly
- [ ] Attendance data integrity
- [ ] Failed login attempts
- [ ] Backup verification

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Performance optimization
- [ ] Database indexing review

## Rollback Plan

If issues occur:

1. Check recent code changes
2. Rollback to last known good commit
3. Redeploy to Render
4. Verify all systems functional

## Support

For issues:
1. Check deployment logs
2. Test locally first
3. Review error messages
4. Contact hosting support
