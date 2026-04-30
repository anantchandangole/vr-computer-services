// Check admin account in database
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function checkAdmin() {
    try {
        console.log('🔌 Connecting to local MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services');
        console.log('✅ Connected to local MongoDB');

        const admin = await Admin.findOne({ username: 'administrator' });
        
        if (admin) {
            console.log('\n✅ Admin account found:');
            console.log('   Username:', admin.username);
            console.log('   Password (hashed):', admin.password.substring(0, 20) + '...');
            console.log('   Created:', admin.createdAt);
        } else {
            console.log('\n❌ Admin account not found');
            console.log('   Creating admin account...');
            
            const bcrypt = require('bcryptjs');
            const adminPassword = await bcrypt.hash('desk@123', 10);
            const newAdmin = new Admin({ username: 'administrator', password: adminPassword });
            await newAdmin.save();
            console.log('✅ Admin account created: administrator / desk@123');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

checkAdmin();
