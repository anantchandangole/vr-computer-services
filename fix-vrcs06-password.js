require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Engineer = require('./models/Engineer');

async function fixVrcs06Password() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services');
        console.log('✅ Connected to MongoDB');

        const engineer = await Engineer.findOne({ username: 'vrcs06' });
        if (engineer) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            engineer.password = hashedPassword;
            await engineer.save();
            console.log('✅ Password updated for vrcs06');
            console.log('   Username: vrcs06');
            console.log('   Password: 123456');
        } else {
            console.log('⚠️ Engineer vrcs06 not found');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixVrcs06Password();
