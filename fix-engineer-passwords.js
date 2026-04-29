require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Engineer = require('./models/Engineer');

async function fixPasswords() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services');
        console.log('✅ Connected to MongoDB');

        // Update passwords for vrcs02 to vrcs05 (including uppercase VRCS05)
        const engineers = ['vrcs02', 'vrcs03', 'vrcs04', 'vrcs05', 'VRCS05'];
        const newPassword = await bcrypt.hash('123456', 10);

        for (const username of engineers) {
            const engineer = await Engineer.findOne({ username });
            if (engineer) {
                engineer.password = newPassword;
                await engineer.save();
                console.log(`✅ Password updated for: ${username}`);
            } else {
                console.log(`⚠️ Engineer not found: ${username}`);
            }
        }

        console.log('\n✅ Password fix complete!');
        console.log('All engineers can now login with password: 123456');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

fixPasswords();
