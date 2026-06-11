const fetch = require('node-fetch'); // or use native fetch if node > 18

async function testFlow() {
    let token = '';
    // 1. Login
    try {
        const engRes = await fetch('http://localhost:5000/api/auth/engineer/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'vrcs01', password: '123456' })
        });
        const engData = await engRes.json();
        if (engData.success) {
            token = engData.token;
            console.log('Login successful');
        } else {
            console.error('Login failed', engData);
            return;
        }
    } catch(e) { console.error('Login error', e); return; }

    // 2. Fetch my-today
    try {
        const todayRes = await fetch('http://localhost:5000/api/attendance/my-today', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const todayData = await todayRes.json();
        console.log('Today attendance:', JSON.stringify(todayData, null, 2));
    } catch(e) { console.error('Today error', e); }
}

testFlow();
