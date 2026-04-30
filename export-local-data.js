// Export local MongoDB data to JSON files
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Engineer = require('./models/Engineer');
const Attendance = require('./models/Attendance');
const fs = require('fs');
const path = require('path');

async function exportData() {
    try {
        console.log('🔌 Connecting to local MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services');
        console.log('✅ Connected to local MongoDB');

        const exportDir = path.join(__dirname, 'export');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }

        // Export Admin
        console.log('\n📦 Exporting Admin data...');
        const admins = await Admin.find();
        fs.writeFileSync(
            path.join(exportDir, 'admins.json'),
            JSON.stringify(admins, null, 2)
        );
        console.log(`✅ Exported ${admins.length} admin records`);

        // Export Engineers
        console.log('\n📦 Exporting Engineer data...');
        const engineers = await Engineer.find();
        fs.writeFileSync(
            path.join(exportDir, 'engineers.json'),
            JSON.stringify(engineers, null, 2)
        );
        console.log(`✅ Exported ${engineers.length} engineer records`);

        // Export Attendance
        console.log('\n📦 Exporting Attendance data...');
        const attendance = await Attendance.find();
        fs.writeFileSync(
            path.join(exportDir, 'attendance.json'),
            JSON.stringify(attendance, null, 2)
        );
        console.log(`✅ Exported ${attendance.length} attendance records`);

        console.log('\n✅ Data export complete');
        console.log(`📁 Export location: ${exportDir}`);
        console.log('\n📝 Files created:');
        console.log('   - admins.json');
        console.log('   - engineers.json');
        console.log('   - attendance.json');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

exportData();
