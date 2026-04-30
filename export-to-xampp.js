// Export MongoDB data to SQL format for XAMPP (MySQL/MariaDB)
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Engineer = require('./models/Engineer');
const Attendance = require('./models/Attendance');
const fs = require('fs');
const path = require('path');

async function exportToSQL() {
    try {
        console.log('🔌 Connecting to local MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services');
        console.log('✅ Connected to local MongoDB');

        const exportDir = path.join(__dirname, 'xampp-export');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }

        // Generate SQL file
        let sql = '';
        sql += '-- VR Computer Services Database Export for XAMPP\n';
        sql += '-- Generated on: ' + new Date().toISOString() + '\n\n';
        sql += '-- Create Database\n';
        sql += 'CREATE DATABASE IF NOT EXISTS vr_computer_services;\n';
        sql += 'USE vr_computer_services;\n\n';

        // Admin Table
        console.log('\n📦 Exporting Admin data...');
        sql += '-- Admin Table\n';
        sql += 'CREATE TABLE IF NOT EXISTS admins (\n';
        sql += '  id INT AUTO_INCREMENT PRIMARY KEY,\n';
        sql += '  username VARCHAR(255) UNIQUE NOT NULL,\n';
        sql += '  password VARCHAR(255) NOT NULL,\n';
        sql += '  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
        sql += '  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n';
        sql += ');\n\n';

        const admins = await Admin.find();
        if (admins.length > 0) {
            sql += '-- Insert Admin Data\n';
            sql += 'INSERT INTO admins (username, password, createdAt, updatedAt) VALUES\n';
            const adminValues = admins.map((admin, index) => {
                const createdAt = admin.createdAt ? admin.createdAt.toISOString().slice(0, 19).replace('T', ' ') : 'NOW()';
                const updatedAt = admin.updatedAt ? admin.updatedAt.toISOString().slice(0, 19).replace('T', ' ') : 'NOW()';
                return `  ('${admin.username}', '${admin.password}', '${createdAt}', '${updatedAt}')${index < admins.length - 1 ? ',' : ';'}`;
            });
            sql += adminValues.join('\n') + '\n\n';
        }
        console.log(`✅ Exported ${admins.length} admin records`);

        // Engineers Table
        console.log('\n📦 Exporting Engineer data...');
        sql += '-- Engineers Table\n';
        sql += 'CREATE TABLE IF NOT EXISTS engineers (\n';
        sql += '  id INT AUTO_INCREMENT PRIMARY KEY,\n';
        sql += '  username VARCHAR(255) UNIQUE NOT NULL,\n';
        sql += '  name VARCHAR(255) NOT NULL,\n';
        sql += '  mobile VARCHAR(20),\n';
        sql += '  password VARCHAR(255) NOT NULL,\n';
        sql += '  status ENUM("active", "inactive") DEFAULT "active",\n';
        sql += '  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
        sql += '  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n';
        sql += ');\n\n';

        const engineers = await Engineer.find();
        if (engineers.length > 0) {
            sql += '-- Insert Engineer Data\n';
            sql += 'INSERT INTO engineers (username, name, mobile, password, status, createdAt, updatedAt) VALUES\n';
            const engineerValues = engineers.map((eng, index) => {
                const createdAt = eng.createdAt ? eng.createdAt.toISOString().slice(0, 19).replace('T', ' ') : 'NOW()';
                const updatedAt = eng.updatedAt ? eng.updatedAt.toISOString().slice(0, 19).replace('T', ' ') : 'NOW()';
                return `  ('${eng.username}', '${eng.name}', '${eng.mobile || ''}', '${eng.password}', '${eng.status}', '${createdAt}', '${updatedAt}')${index < engineers.length - 1 ? ',' : ';'}`;
            });
            sql += engineerValues.join('\n') + '\n\n';
        }
        console.log(`✅ Exported ${engineers.length} engineer records`);

        // Attendance Table
        console.log('\n📦 Exporting Attendance data...');
        sql += '-- Attendance Table\n';
        sql += 'CREATE TABLE IF NOT EXISTS attendance (\n';
        sql += '  id INT AUTO_INCREMENT PRIMARY KEY,\n';
        sql += '  engineerId VARCHAR(255) NOT NULL,\n';
        sql += '  engineerName VARCHAR(255),\n';
        sql += '  date DATE NOT NULL,\n';
        sql += '  inTime TIME,\n';
        sql += '  outTime TIME,\n';
        sql += '  workingHours VARCHAR(50),\n';
        sql += '  taskCompleted TEXT,\n';
        sql += '  location TEXT,\n';
        sql += '  photoUrl TEXT,\n';
        sql += '  remarks TEXT,\n';
        sql += '  currentStatus VARCHAR(50),\n';
        sql += '  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
        sql += '  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n';
        sql += ');\n\n';

        const attendance = await Attendance.find();
        if (attendance.length > 0) {
            sql += '-- Insert Attendance Data\n';
            sql += 'INSERT INTO attendance (engineerId, engineerName, date, inTime, outTime, workingHours, taskCompleted, location, photoUrl, remarks, currentStatus, createdAt, updatedAt) VALUES\n';
            const attendanceValues = attendance.map((att, index) => {
                const createdAt = att.createdAt ? att.createdAt.toISOString().slice(0, 19).replace('T', ' ') : 'NOW()';
                const updatedAt = att.updatedAt ? att.updatedAt.toISOString().slice(0, 19).replace('T', ' ') : 'NOW()';
                const date = att.date ? att.date.toISOString().slice(0, 10) : 'NOW()';
                return `  ('${att.engineerId || ''}', '${att.engineerName || ''}', '${date}', '${att.inTime || ''}', '${att.outTime || ''}', '${att.workingHours || ''}', '${(att.taskCompleted || '').replace(/'/g, "\\'")}', '${(att.location || '').replace(/'/g, "\\'")}', '${att.photoUrl || ''}', '${(att.remarks || '').replace(/'/g, "\\'")}', '${att.currentStatus || ''}', '${createdAt}', '${updatedAt}')${index < attendance.length - 1 ? ',' : ';'}`;
            });
            sql += attendanceValues.join('\n') + '\n\n';
        }
        console.log(`✅ Exported ${attendance.length} attendance records`);

        // Write SQL file
        const sqlFile = path.join(exportDir, 'vr_computer_services.sql');
        fs.writeFileSync(sqlFile, sql);
        console.log('\n✅ SQL export complete');
        console.log(`📁 SQL file location: ${sqlFile}`);
        console.log('\n📝 Summary:');
        console.log(`   Admins: ${admins.length}`);
        console.log(`   Engineers: ${engineers.length}`);
        console.log(`   Attendance: ${attendance.length}`);
        console.log('\n📋 To import into XAMPP:');
        console.log('   1. Open phpMyAdmin (http://localhost/phpmyadmin)');
        console.log('   2. Click "Import" tab');
        console.log('   3. Select the SQL file: ' + sqlFile);
        console.log('   4. Click "Go" to import');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

exportToSQL();
