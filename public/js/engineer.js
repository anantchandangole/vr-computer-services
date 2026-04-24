// Engineer Portal JavaScript
const API_BASE = '/api';

let authToken = localStorage.getItem('engineerToken');
let currentUser = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        const userData = localStorage.getItem('engineerUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            showDashboard();
        } else {
            showLogin();
        }
    } else {
        showLogin();
    }

    // Set current date
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = today;
    }
});

// Show Login Section
function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
}

// Show Dashboard Section
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('dashboardSection').classList.add('active');
    
    if (currentUser) {
        document.getElementById('engineerName').textContent = currentUser.name;
    }
    
    loadTodayAttendance();
    loadAttendanceHistory();
}

// Engineer Login
document.getElementById('engineerLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('engineerUsername').value;
    const password = document.getElementById('engineerPassword').value;
    const errorElement = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/engineer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('engineerToken', authToken);
            localStorage.setItem('engineerUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            errorElement.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorElement.textContent = 'Server error. Please try again.';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('engineerToken');
    localStorage.removeItem('engineerUser');
    authToken = null;
    currentUser = null;
    showLogin();
});

// Load Today's Attendance
async function loadTodayAttendance() {
    try {
        const response = await fetch(`${API_BASE}/attendance/my-today`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success && data.attendance) {
            const attendance = data.attendance;
            const statusContent = document.getElementById('statusContent');

            let html = `
                <div class="status-item">
                    <span class="status-label">In Time:</span>
                    <span class="status-value">${attendance.inTime || '-'}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Out Time:</span>
                    <span class="status-value">${attendance.outTime || '-'}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Working Hours:</span>
                    <span class="status-value">${attendance.workingHours || '-'}</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Status:</span>
                    <span class="status-badge ${attendance.status}">${attendance.status}</span>
                </div>
            `;

            if (attendance.location && attendance.location.address) {
                html += `
                    <div class="status-item">
                        <span class="status-label">Location:</span>
                        <span class="status-value">${attendance.location.address}</span>
                    </div>
                `;
            }

            statusContent.innerHTML = html;

            // Show/hide sections based on status
            if (attendance.inTime && !attendance.outTime) {
                document.getElementById('clockInSection').style.display = 'none';
                document.getElementById('clockOutSection').style.display = 'block';
                document.getElementById('updateStatusSection').style.display = 'block';
            } else if (attendance.outTime) {
                document.getElementById('clockInSection').style.display = 'none';
                document.getElementById('clockOutSection').style.display = 'none';
                document.getElementById('updateStatusSection').style.display = 'none';
                statusContent.innerHTML += '<p style="margin-top: 1rem; color: var(--success); font-weight: 600;">✓ Completed for today</p>';
            }
        } else {
            // No attendance today - show clock in
            document.getElementById('statusContent').innerHTML = '<p style="text-align: center; color: var(--text-color);">Not clocked in yet</p>';
            document.getElementById('clockInSection').style.display = 'block';
            document.getElementById('clockOutSection').style.display = 'none';
            document.getElementById('updateStatusSection').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Get Location
function getLocation(latInput, lngInput, addressInput) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                document.getElementById(latInput).value = lat;
                document.getElementById(lngInput).value = lng;

                // Reverse geocoding (using a free API)
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    if (data.display_name) {
                        document.getElementById(addressInput).value = data.display_name;
                    }
                } catch (error) {
                    document.getElementById(addressInput).value = `${lat}, ${lng}`;
                }
            },
            (error) => {
                alert('Unable to get location. Please enable location services.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

document.getElementById('getLocationBtn').addEventListener('click', () => {
    getLocation('locationLat', 'locationLng', 'locationAddress');
});

document.getElementById('updateLocationBtn').addEventListener('click', () => {
    getLocation('updateLocationLat', 'updateLocationLng', 'updateLocationAddress');
});

// Photo Preview
document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').innerHTML = `<img src="${e.target.result}" alt="Photo">`;
        };
        reader.readAsDataURL(file);
    }
});

// Clock In
document.getElementById('clockInForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const location = {
        lat: document.getElementById('locationLat').value || null,
        lng: document.getElementById('locationLng').value || null,
        address: document.getElementById('locationAddress').value || ''
    };

    const remark = document.getElementById('clockInRemark').value;
    const photoInput = document.getElementById('photoInput');
    let photoUrl = '';

    if (photoInput.files.length > 0) {
        // Upload photo
        const formData = new FormData();
        formData.append('photo', photoInput.files[0]);

        try {
            const uploadResponse = await fetch(`${API_BASE}/engineer/upload-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
                photoUrl = uploadData.photoUrl;
            }
        } catch (error) {
            console.error('Photo upload error:', error);
        }
    }

    try {
        const response = await fetch(`${API_BASE}/attendance/clock-in`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location, photo: photoUrl, remark })
        });

        const data = await response.json();

        if (data.success) {
            alert('Clocked in successfully!');
            document.getElementById('clockInForm').reset();
            document.getElementById('photoPreview').innerHTML = '';
            loadTodayAttendance();
        } else {
            alert(data.message || 'Clock in failed');
        }
    } catch (error) {
        alert('Server error. Please try again.');
    }
});

// Clock Out
document.getElementById('clockOutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskCompleted = document.getElementById('taskCompleted').value;
    const remark = document.getElementById('clockOutRemark').value;

    try {
        const response = await fetch(`${API_BASE}/attendance/clock-out`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taskCompleted, remark })
        });

        const data = await response.json();

        if (data.success) {
            alert('Clocked out successfully!');
            document.getElementById('clockOutForm').reset();
            loadTodayAttendance();
        } else {
            alert(data.message || 'Clock out failed');
        }
    } catch (error) {
        alert('Server error. Please try again.');
    }
});

// Update Status
document.getElementById('updateStatusForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const status = document.getElementById('currentStatus').value;
    const location = {
        lat: document.getElementById('updateLocationLat').value || null,
        lng: document.getElementById('updateLocationLng').value || null,
        address: document.getElementById('updateLocationAddress').value || ''
    };
    const remark = document.getElementById('updateRemark').value;

    try {
        const response = await fetch(`${API_BASE}/attendance/update-status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, location, remark })
        });

        const data = await response.json();

        if (data.success) {
            alert('Status updated successfully!');
            document.getElementById('updateStatusForm').reset();
            loadTodayAttendance();
        } else {
            alert(data.message || 'Update failed');
        }
    } catch (error) {
        alert('Server error. Please try again.');
    }
});

// Load Attendance History
async function loadAttendanceHistory() {
    try {
        const response = await fetch(`${API_BASE}/attendance/my-history`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('historyTable');
            tbody.innerHTML = '';

            data.attendance.forEach(record => {
                const row = `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.inTime || '-'}</td>
                        <td>${record.outTime || '-'}</td>
                        <td>${record.workingHours || '-'}</td>
                        <td><span class="status-badge ${record.status}">${record.status}</span></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}
