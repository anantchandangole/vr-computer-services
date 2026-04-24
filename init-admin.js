require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Engineer = require('./models/Engineer');

async function initialize() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'administrator' });
        if (existingAdmin) {
            console.log('⚠️ Admin already exists. Skipping admin creation.');
        } else {
            // Create admin
            const adminPassword = await bcrypt.hash('desk@123', 10);
            const admin = new Admin({
                username: 'administrator',
                password: adminPassword
            });
            await admin.save();
            console.log('✅ Admin created successfully');
            console.log('   Username: administrator');
            console.log('   Password: desk@123');
        }

        // Create sample engineers
        const sampleEngineers = [
            { username: 'vrcs01', name: 'Engineer 1', mobile: '9876543210' },
            { username: 'vrcs02', name: 'Engineer 2', mobile: '9876543211' },
            { username: 'vrcs03', name: 'Engineer 3', mobile: '9876543212' },
            { username: 'vrcs04', name: 'Engineer 4', mobile: '9876543213' },
            { username: 'vrcs05', name: 'Engineer 5', mobile: '9876543214' }
        ];

        for (const eng of sampleEngineers) {
            const existing = await Engineer.findOne({ username: eng.username });
            if (!existing) {
                const engineerPassword = await bcrypt.hash('123456', 10);
                const engineer = new Engineer({
                    ...eng,
                    password: engineerPassword,
                    status: 'active'
                });
                await engineer.save();
                console.log(`✅ Engineer created: ${eng.username}`);
            } else {
                console.log(`⚠️ Engineer ${eng.username} already exists`);
            }
        }

        console.log('\n✅ Initialization complete!');
        console.log('\n📝 Login Credentials:');
        console.log('   Admin: administrator / desk@123');
        console.log('   Engineers: vrcs01-vrcs05 / 123456');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

initialize();
