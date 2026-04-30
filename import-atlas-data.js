// Import data to MongoDB Atlas from JSON files
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Engineer = require('./models/Engineer');
const Attendance = require('./models/Attendance');
const fs = require('fs');
const path = require('path');

async function importData() {
    const mongodbUri = 'mongodb+srv://anantdvd1990_db_user:N0XEbMpYUgzFMCsN@cluster0.kysda1a.mongodb.net/engineer-trac?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000&connectTimeoutMS=30000&socketTimeoutMS=30000';

    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(mongodbUri);
        console.log('✅ Connected to MongoDB Atlas (engineer-trac)');

        const exportDir = path.join(__dirname, 'export');

        // Import Admin
        console.log('\n📥 Importing Admin data...');
        const adminData = JSON.parse(fs.readFileSync(path.join(exportDir, 'admins.json'), 'utf8'));
        for (const admin of adminData) {
            const existing = await Admin.findOne({ username: admin.username });
            if (!existing) {
                await Admin.create(admin);
                console.log(`✅ Imported admin: ${admin.username}`);
            } else {
                console.log(`ℹ️ Admin ${admin.username} already exists, skipping`);
            }
        }

        // Import Engineers
        console.log('\n📥 Importing Engineer data...');
        const engineerData = JSON.parse(fs.readFileSync(path.join(exportDir, 'engineers.json'), 'utf8'));
        for (const engineer of engineerData) {
            const existing = await Engineer.findOne({ username: engineer.username });
            if (!existing) {
                await Engineer.create(engineer);
                console.log(`✅ Imported engineer: ${engineer.username}`);
            } else {
                console.log(`ℹ️ Engineer ${engineer.username} already exists, skipping`);
            }
        }

        // Import Attendance
        console.log('\n📥 Importing Attendance data...');
        const attendanceData = JSON.parse(fs.readFileSync(path.join(exportDir, 'attendance.json'), 'utf8'));
        for (const record of attendanceData) {
            const existing = await Attendance.findOne({ 
                engineerId: record.engineerId, 
                date: record.date 
            });
            if (!existing) {
                await Attendance.create(record);
                console.log(`✅ Imported attendance: ${record.engineerId} - ${record.date}`);
            } else {
                console.log(`ℹ️ Attendance ${record.engineerId} - ${record.date} already exists, skipping`);
            }
        }

        console.log('\n✅ Data import complete');
        console.log('\n📊 Summary:');
        console.log(`   Admins: ${adminData.length}`);
        console.log(`   Engineers: ${engineerData.length}`);
        console.log(`   Attendance: ${attendanceData.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB Atlas');
    }
}

importData();
