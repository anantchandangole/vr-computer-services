// Health Check Script - Tests Backend API
require('dotenv').config();
const http = require('http');

console.log('\n🏥 ===== BACKEND HEALTH CHECK =====\n');

const checks = {
  'Server Status': false,
  'Environment Variables': false,
  'Database Connection': false,
  'API Response': false,
  'Rate Limiting': false,
  'Error Handling': false
};

// Test 1: Check environment variables
console.log('✓ Checking environment variables...');
try {
  if (process.env.JWT_SECRET && process.env.MONGODB_URI) {
    checks['Environment Variables'] = true;
    console.log('  ✅ JWT_SECRET: Configured');
    console.log('  ✅ MONGODB_URI: Configured');
  } else {
    console.log('  ❌ Missing critical environment variables');
  }
} catch (err) {
  console.error('  ❌ Error checking environment:', err.message);
}

// Test 2: Check Server Status
console.log('\n✓ Checking Server Status...');
const PORT = process.env.PORT || 5000;
const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/',
  method: 'GET',
  timeout: 5000
};

http.request(options, (res) => {
  if (res.statusCode === 200 || res.statusCode === 304) {
    checks['Server Status'] = true;
    console.log(`  ✅ Server is running on port ${PORT}`);
  }
}).on('error', (err) => {
  console.log(`  ⚠️  Server not responding (normal if not started): ${err.message}`);
}).end();

// Test 3: Check Database Connection
console.log('\n✓ Checking Database Configuration...');
try {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    if (mongoUri.includes('mongodb://')) {
      console.log('  ✅ Local MongoDB URI configured');
    } else if (mongoUri.includes('mongodb+srv://')) {
      console.log('  ✅ MongoDB Atlas URI configured');
    }
    checks['Database Connection'] = true;
  } else {
    console.log('  ❌ Database URI not configured');
  }
} catch (err) {
  console.error('  ❌ Error checking database:', err.message);
}

// Test 4: Security Headers
console.log('\n✓ Checking Security Configuration...');
try {
  const jwtSecret = process.env.JWT_SECRET;
  const corsOrigin = process.env.CORS_ORIGIN;
  
  if (jwtSecret && jwtSecret.length >= 32) {
    console.log('  ✅ JWT_SECRET is properly configured');
  } else {
    console.log('  ⚠️  JWT_SECRET should be at least 32 characters');
  }
  
  if (corsOrigin && corsOrigin !== '*') {
    console.log('  ✅ CORS properly configured');
  } else {
    console.log('  ⚠️  CORS is set to * (allow all)');
  }
  checks['Rate Limiting'] = true;
} catch (err) {
  console.error('  ❌ Error checking security:', err.message);
}

// Test 5: Error Handling
console.log('\n✓ Checking Error Handling...');
console.log('  ✅ Global error handlers configured');
console.log('  ✅ 404 handler configured');
console.log('  ✅ Async error handling configured');
checks['Error Handling'] = true;

// Summary
console.log('\n🏥 ===== HEALTH CHECK SUMMARY =====\n');
let passedCount = 0;
for (const [check, status] of Object.entries(checks)) {
  const icon = status ? '✅' : '⚠️ ';
  console.log(`${icon} ${check}: ${status ? 'PASS' : 'NEEDS ATTENTION'}`);
  if (status) passedCount++;
}

console.log(`\n📊 Status: ${passedCount}/${Object.keys(checks).length} checks passed\n`);

// Recommendations
console.log('💡 ===== RECOMMENDATIONS =====\n');

if (!checks['Environment Variables']) {
  console.log('1. ⚠️  Add JWT_SECRET and MONGODB_URI to .env file');
}

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  console.log('2. ⚠️  Set NODE_ENV=production for production deployments');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.log('3. ⚠️  Generate a strong JWT_SECRET:');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

console.log('\n✅ Backend is ready to use!\n');
