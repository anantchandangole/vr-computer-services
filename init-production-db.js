// Initialize Production Database (MongoDB Atlas) with Admin and Engineer accounts
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Engineer = require('./models/Engineer');
const bcrypt = require('bcryptjs');

const mongodbUri = 'mongodb+srv://anantdvd1990_db_user:N0XEbMpYUgzFMCsN@cluster0.kysda1a.mongodb.net/engineer-trac?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000&connectTimeoutMS=30000&socketTimeoutMS=30000';

async function initProductionDB() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas (engineer-trac)...');
        await mongoose.connect(mongodbUri);
        console.log('✅ Connected to MongoDB Atlas');

        // Create Admin
        console.log('\n📝 Creating Admin account...');
        const adminPassword = await bcrypt.hash('desk@123', 10);
        const admin = await Admin.findOneAndUpdate(
            { username: 'administrator' },
            { username: 'administrator', password: adminPassword },
            { upsert: true, new: true }
        );
        console.log('✅ Admin created/updated: administrator / desk@123');

        // Create Engineers
        console.log('\n📝 Creating Engineer accounts...');
        const engineerPassword = await bcrypt.hash('123456', 10);
        
        const engineers = [
            { username: 'vrcs01', name: 'Engineer 01', mobile: '1234567890' },
            { username: 'vrcs02', name: 'Engineer 02', mobile: '1234567891' },
            { username: 'vrcs03', name: 'Engineer 03', mobile: '1234567892' },
            { username: 'vrcs04', name: 'Engineer 04', mobile: '1234567893' },
            { username: 'vrcs05', name: 'Engineer 05', mobile: '1234567894' },
            { username: 'VRCS05', name: 'Engineer 05 (Uppercase)', mobile: '1234567895' }
        ];

        for (const eng of engineers) {
            await Engineer.findOneAndUpdate(
                { username: eng.username },
                { ...eng, password: engineerPassword, status: 'active' },
                { upsert: true, new: true }
            );
            console.log(`✅ Engineer created/updated: ${eng.username} / 123456`);
        }

        console.log('\n✅ Production database initialization complete');
        console.log('\n📝 Login credentials:');
        console.log('   Admin: administrator / desk@123');
        console.log('   Engineers: vrcs01-vrcs05, VRCS05 / 123456');
        console.log('\n🌐 Production URL: https://vr-computer-services.onrender.com/admin');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB Atlas');
    }
}

initProductionDB();
