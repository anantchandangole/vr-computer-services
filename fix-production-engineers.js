// Script to fix engineer passwords on production database
// Run this script locally by providing the production MongoDB URI

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Engineer = require('./models/Engineer');

async function fixProductionEngineers() {
    // Use production MongoDB URI from environment or command line
    const productionMongodbUri = process.env.PRODUCTION_MONGODB_URI || process.env.MONGODB_URI;

    if (!productionMongodbUri) {
        console.error('❌ Error: Production MongoDB URI not found.');
        console.log('Please set PRODUCTION_MONGODB_URI environment variable or run:');
        console.log('set PRODUCTION_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vr-computer-services');
        console.log('node fix-production-engineers.js');
        return;
    }

    try {
        console.log('🔌 Connecting to production MongoDB...');
        await mongoose.connect(productionMongodbUri);
        console.log('✅ Connected to production MongoDB');

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

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

fixProductionEngineers();
