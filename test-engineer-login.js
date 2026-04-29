require('dotenv').config();

async function testEngineerLogin() {
    console.log('Testing Engineer Login API...');
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/engineer/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: 'vrcs01', 
                password: '123456' 
            })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ Engineer login API is working');
        } else {
            console.log('❌ Engineer login failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEngineerLogin();
