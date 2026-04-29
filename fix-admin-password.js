require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function fixAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services');
        console.log('✅ Connected to MongoDB');

        // Find admin
        const admin = await Admin.findOne({ username: 'administrator' });
        if (admin) {
            const newPassword = await bcrypt.hash('desk@123', 10);
            admin.password = newPassword;
            await admin.save();
            console.log('✅ Admin password updated successfully');
            console.log('   Username: administrator');
            console.log('   Password: desk@123');
        } else {
            // Create admin if not exists
            const adminPassword = await bcrypt.hash('desk@123', 10);
            const newAdmin = new Admin({
                username: 'administrator',
                password: adminPassword
            });
            await newAdmin.save();
            console.log('✅ Admin created successfully');
            console.log('   Username: administrator');
            console.log('   Password: desk@123');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

fixAdminPassword();
