require('dotenv').config();
const mongoose = require('mongoose');
const Engineer = require('./models/Engineer');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-computer-services')
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Check if engineer exists
        const engineers = await Engineer.find({});
        console.log('Total engineers:', engineers.length);
        
        engineers.forEach(eng => {
            console.log('Username:', eng.username);
            console.log('Name:', eng.name);
            console.log('Status:', eng.status);
            console.log('---');
        });
        
        // Check specific engineer
        const engineer = await Engineer.findOne({ username: 'vrcs01' });
        if (engineer) {
            console.log('Engineer vrcs01 found');
            console.log('Status:', engineer.status);
        } else {
            console.log('Engineer vrcs01 NOT found');
        }
        
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
