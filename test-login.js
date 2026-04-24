require('dotenv').config();

async function testLogin() {
    console.log('Testing Admin Login API...');
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: 'administrator', 
                password: 'desk@123' 
            })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ Admin login API is working');
        } else {
            console.log('❌ Admin login failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    console.log('\nTesting Engineer Login API...');
    
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

testLogin();
