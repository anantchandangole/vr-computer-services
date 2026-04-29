// Script to connect to MongoDB Atlas and fix engineer passwords
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Engineer = require('./models/Engineer');

async function connectAndFix() {
    const mongodbUri = 'mongodb+srv://anantdvd1990_db_user:N0XEbMpYUgzFMCsN@cluster0.kysda1a.mongodb.net/vr-computer-services?retryWrites=true&w=majority';

    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(mongodbUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        console.log('✅ Connected to MongoDB Atlas');

        // Get all engineers
        const engineers = await Engineer.find();
        console.log(`\n📊 Found ${engineers.length} engineers in database`);

        if (engineers.length === 0) {
            console.log('⚠️ No engineers found. Creating default engineers...');
            
            const defaultEngineers = [
                { username: 'vrcs01', name: 'Engineer 01', mobile: '1234567890' },
                { username: 'vrcs02', name: 'Engineer 02', mobile: '1234567891' },
                { username: 'vrcs03', name: 'Engineer 03', mobile: '1234567892' },
                { username: 'vrcs04', name: 'Engineer 04', mobile: '1234567893' },
                { username: 'vrcs05', name: 'Engineer 05', mobile: '1234567894' },
                { username: 'VRCS05', name: 'Engineer 05 (Uppercase)', mobile: '1234567895' }
            ];

            const newPassword = await bcrypt.hash('123456', 10);

            for (const eng of defaultEngineers) {
                const existing = await Engineer.findOne({ username: eng.username });
                if (!existing) {
                    const newEngineer = new Engineer({
                        ...eng,
                        password: newPassword,
                        status: 'active'
                    });
                    await newEngineer.save();
                    console.log(`✅ Created engineer: ${eng.username}`);
                }
            }
        } else {
            // Update passwords for existing engineers
            const newPassword = await bcrypt.hash('123456', 10);
            
            for (const engineer of engineers) {
                engineer.password = newPassword;
                await engineer.save();
                console.log(`✅ Password updated for: ${engineer.username} (${engineer.name})`);
            }
        }

        console.log('\n✅ All engineer passwords have been reset to: 123456');
        console.log('\n📝 Login credentials:');
        console.log('   Username: vrcs01, vrcs02, vrcs03, vrcs04, vrcs05, VRCS05');
        console.log('   Password: 123456');
        console.log('\n🌐 Production URL: https://vr-computer-services.onrender.com/engineer');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nTroubleshooting tips:');
        console.error('1. Check if IP 152.56.8.71/32 is whitelisted in MongoDB Atlas');
        console.error('2. Verify username and password are correct');
        console.error('3. Ensure database name is correct (vr-computer-services)');
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

connectAndFix();
