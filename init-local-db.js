// Initialize local database with admin and engineer accounts
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Engineer = require('./models/Engineer');

async function initDatabase() {
    try {
        console.log('🔌 Connecting to local MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services');
        console.log('✅ Connected to local MongoDB');

        // Initialize Admin
        const existingAdmin = await Admin.findOne({ username: 'administrator' });
        if (!existingAdmin) {
            const adminPassword = await bcrypt.hash('desk@123', 10);
            const admin = new Admin({ username: 'administrator', password: adminPassword });
            await admin.save();
            console.log('✅ Admin created: administrator / desk@123');
        } else {
            console.log('ℹ️ Admin already exists');
        }

        // Initialize Engineers
        const defaultEngineers = [
            { username: 'vrcs01', name: 'Engineer 01', mobile: '1234567890' },
            { username: 'vrcs02', name: 'Engineer 02', mobile: '1234567891' },
            { username: 'vrcs03', name: 'Engineer 03', mobile: '1234567892' },
            { username: 'vrcs04', name: 'Engineer 04', mobile: '1234567893' },
            { username: 'vrcs05', name: 'Engineer 05', mobile: '1234567894' },
            { username: 'VRCS05', name: 'Engineer 05 (Uppercase)', mobile: '1234567895' }
        ];

        const engineerPassword = await bcrypt.hash('123456', 10);

        for (const eng of defaultEngineers) {
            const existing = await Engineer.findOne({ username: eng.username });
            if (!existing) {
                const engineer = new Engineer({
                    ...eng,
                    password: engineerPassword,
                    status: 'active'
                });
                await engineer.save();
                console.log(`✅ Engineer created: ${eng.username} / 123456`);
            } else {
                console.log(`ℹ️ Engineer ${eng.username} already exists`);
            }
        }

        console.log('\n✅ Database initialization complete');
        console.log('\n📝 Login credentials:');
        console.log('   Admin: administrator / desk@123');
        console.log('   Engineers: vrcs01-vrcs05, VRCS05 / 123456');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

initDatabase();
