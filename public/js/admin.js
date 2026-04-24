// Admin Panel JavaScript
const API_BASE = '/api';

let authToken = localStorage.getItem('adminToken');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin.js loaded');
    
    const loginForm = document.getElementById('adminLoginForm');
    console.log('Login form found:', loginForm ? 'Yes' : 'No');
    
    if (authToken) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Admin Login Event Listener
const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Admin login form submitted');
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        const errorElement = document.getElementById('loginError');

        console.log('Username:', username);
        console.log('Password length:', password.length);

        try {
            console.log('Sending login request to:', `${API_BASE}/auth/admin/login`);
            const response = await fetch(`${API_BASE}/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                authToken = data.token;
                localStorage.setItem('adminToken', authToken);
                showDashboard();
            } else {
                errorElement.textContent = data.message || 'Login failed';
                console.error('Login failed:', data.message);
            }
        } catch (error) {
            errorElement.textContent = 'Server error. Please try again.';
            console.error('Login error:', error);
        }
    });
}

// Show Login Section
function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
}

// Show Dashboard Section
function showDashboard() {
    console.log('Showing dashboard...');
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) {
        dashboardSection.style.display = 'flex';
        dashboardSection.classList.add('active');
    }
    
    console.log('Dashboard section display:', dashboardSection ? dashboardSection.style.display : 'not found');
    
    loadDashboardStats();
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    authToken = null;
    showLogin();
});

// Navigation
document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

        const sectionId = link.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');

        document.getElementById('pageTitle').textContent = link.querySelector('span').textContent;

        if (sectionId === 'dashboard') loadDashboardStats();
        if (sectionId === 'engineers') loadEngineers();
        if (sectionId === 'attendance') loadAttendance();
        if (sectionId === 'live-tracking') loadLiveTracking();
    });
});

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        console.log('Loading dashboard stats...');
        const response = await fetch(`${API_BASE}/admin/dashboard-stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        console.log('Dashboard stats response:', data);

        if (data.success) {
            const totalEngineersEl = document.getElementById('totalEngineers');
            const presentTodayEl = document.getElementById('presentToday');
            const workingNowEl = document.getElementById('workingNow');
            const absentTodayEl = document.getElementById('absentToday');
            
            if (totalEngineersEl) totalEngineersEl.textContent = data.stats.totalEngineers || 0;
            if (presentTodayEl) presentTodayEl.textContent = data.stats.presentToday || 0;
            if (workingNowEl) workingNowEl.textContent = data.stats.workingNow || 0;
            if (absentTodayEl) absentTodayEl.textContent = data.stats.absentToday || 0;

            const tbody = document.getElementById('todayAttendanceTable');
            if (tbody) {
                tbody.innerHTML = '';

                if (data.todayAttendance && data.todayAttendance.length > 0) {
                    data.todayAttendance.forEach(record => {
                        const row = `
                            <tr>
                                <td>${record.engineerName}</td>
                                <td>${record.inTime || '-'}</td>
                                <td>${record.outTime || '-'}</td>
                                <td><span class="status-badge ${record.status}">${record.status}</span></td>
                                <td>${record.workingHours || '-'}</td>
                            </tr>
                        `;
                        tbody.innerHTML += row;
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No attendance records for today</td></tr>';
                }
            }
        } else {
            console.error('Dashboard stats failed:', data.message);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load Engineers
async function loadEngineers() {
    try {
        const response = await fetch(`${API_BASE}/engineer`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('engineersTable');
            tbody.innerHTML = '';

            data.engineers.forEach(engineer => {
                const row = `
                    <tr>
                        <td>${engineer.username}</td>
                        <td>${engineer.name}</td>
                        <td>${engineer.mobile}</td>
                        <td><span class="status-badge ${engineer.status}">${engineer.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-secondary" data-action="edit" data-username="${engineer.username}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" data-action="delete" data-username="${engineer.username}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
            
            document.querySelectorAll('[data-action="edit"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const username = btn.getAttribute('data-username');
                    editEngineer(username);
                });
            });
            
            document.querySelectorAll('[data-action="delete"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const username = btn.getAttribute('data-username');
                    deleteEngineer(username);
                });
            });

            updateEngineerDropdowns(data.engineers);
        }
    } catch (error) {
        console.error('Error loading engineers:', error);
    }
}

// Update Engineer Dropdowns
function updateEngineerDropdowns(engineers) {
    const dropdowns = ['attendanceEngineer', 'reportEngineer'];
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.innerHTML = '<option value="">All Engineers</option>';
            engineers.forEach(engineer => {
                dropdown.innerHTML += `<option value="${engineer.username}">${engineer.name} (${engineer.username})</option>`;
            });
        }
    });
}

// Add Engineer Modal
document.getElementById('addEngineerBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add Engineer';
    document.getElementById('engineerForm').reset();
    document.getElementById('editEngineerId').value = '';
    document.getElementById('engineerModal').classList.add('active');
});

// Close Modal
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('engineerModal').classList.remove('active');
});

// Save Engineer
document.getElementById('engineerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = document.getElementById('editEngineerId').value;
    const formData = {
        username: document.getElementById('engineerUsername').value,
        name: document.getElementById('engineerName').value,
        mobile: document.getElementById('engineerMobile').value,
        status: document.getElementById('engineerStatus').value
    };

    const password = document.getElementById('engineerPassword').value;
    if (!editId || password !== '123456') {
        formData.password = password;
    }

    try {
        let url = `${API_BASE}/engineer`;
        let method = 'POST';

        if (editId) {
            url = `${API_BASE}/engineer/${editId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            document.getElementById('engineerModal').classList.remove('active');
            loadEngineers();
        } else {
            alert(data.message || 'Operation failed');
        }
    } catch (error) {
        console.error('Error saving engineer:', error);
        alert('Server error. Please try again.');
    }
});

// Edit Engineer
async function editEngineer(username) {
    try {
        const response = await fetch(`${API_BASE}/engineer/${username}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            const engineer = data.engineer;
            document.getElementById('modalTitle').textContent = 'Edit Engineer';
            document.getElementById('editEngineerId').value = engineer.username;
            document.getElementById('engineerUsername').value = engineer.username;
            document.getElementById('engineerName').value = engineer.name;
            document.getElementById('engineerMobile').value = engineer.mobile;
            document.getElementById('engineerStatus').value = engineer.status;
            document.getElementById('engineerPassword').value = '123456';
            document.getElementById('engineerModal').classList.add('active');
        } else {
            alert(data.message || 'Failed to load engineer data');
        }
    } catch (error) {
        console.error('Error loading engineer data:', error);
        alert('Error loading engineer data. Please try again.');
    }
}

// Delete Engineer
async function deleteEngineer(username) {
    if (confirm('Are you sure you want to delete this engineer?')) {
        try {
            const response = await fetch(`${API_BASE}/engineer/${username}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                loadEngineers();
            } else {
                alert(data.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting engineer:', error);
            alert('Server error. Please try again.');
        }
    }
}

// Load Attendance
async function loadAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const engineerId = document.getElementById('attendanceEngineer').value;

    let url = `${API_BASE}/attendance/all`;
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (engineerId) params.append('engineerId', engineerId);
    if (params.toString()) url += '?' + params.toString();

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('attendanceTable');
            tbody.innerHTML = '';

            data.attendance.forEach(record => {
                const row = `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.engineerName || record.engineerId}</td>
                        <td>${record.inTime || '-'}</td>
                        <td>${record.outTime || '-'}</td>
                        <td><span class="status-badge ${record.status}">${record.status}</span></td>
                        <td>${record.workingHours || '-'}</td>
                        <td>${record.remark || '-'}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

document.getElementById('filterAttendance').addEventListener('click', loadAttendance);

// Generate Report
document.getElementById('generateReport').addEventListener('click', async () => {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const engineerId = document.getElementById('reportEngineer').value;

    let url = `${API_BASE}/attendance/report`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (engineerId) params.append('engineerId', engineerId);
    if (params.toString()) url += '?' + params.toString();

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('reportTotalDays').textContent = data.summary.totalDays;
            document.getElementById('reportTotalHours').textContent = data.summary.totalHours + 'h';

            const tbody = document.getElementById('reportTable');
            tbody.innerHTML = '';

            data.attendance.forEach(record => {
                const row = `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.engineerName}</td>
                        <td>${record.inTime || '-'}</td>
                        <td>${record.outTime || '-'}</td>
                        <td>${record.workingHours || '-'}</td>
                        <td>${record.taskCompleted || '-'}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error generating report:', error);
    }
});

// Load Live Tracking
async function loadLiveTracking() {
    try {
        const response = await fetch(`${API_BASE}/attendance/live-locations`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            const mapContainer = document.getElementById('map');
            const engineersList = document.getElementById('liveEngineersList');

            if (data.engineers.length === 0) {
                mapContainer.innerHTML = '<p>No engineers currently working</p>';
                engineersList.innerHTML = '<p>No engineers currently working</p>';
                return;
            }

            mapContainer.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Google Maps Integration</p>
                    <p>${data.engineers.length} engineers currently working</p>
                    <p style="font-size: 0.875rem; color: #666;">Add your Google Maps API key to enable live tracking</p>
                </div>
            `;

            engineersList.innerHTML = '';
            data.engineers.forEach(engineer => {
                const card = `
                    <div class="engineer-card">
                        <h5>${engineer.engineerName}</h5>
                        <p><strong>ID:</strong> ${engineer.engineerId}</p>
                        <p><strong>In Time:</strong> ${engineer.inTime}</p>
                        <p><strong>Status:</strong> ${engineer.status}</p>
                        ${engineer.location && engineer.location.address ? `<p><strong>Location:</strong> ${engineer.location.address}</p>` : ''}
                    </div>
                `;
                engineersList.innerHTML += card;
            });
        }
    } catch (error) {
        console.error('Error loading live tracking:', error);
    }
}

document.getElementById('refreshLocations').addEventListener('click', loadLiveTracking);

// Export to Excel/CSV
document.getElementById('exportExcel').addEventListener('click', async () => {
    try {
        const tbody = document.getElementById('reportTable');
        const rows = tbody.querySelectorAll('tr');
        
        if (rows.length === 0) {
            alert('No data to export. Please generate a report first.');
            return;
        }

        let csvContent = 'Date,Engineer Name,In Time,Out Time,Working Hours,Task Completed\n';
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => {
                let text = cell.textContent.trim();
                text = text.replace(/"/g, '""');
                if (text.includes(',') || text.includes('"')) {
                    text = `"${text}"`;
                }
                return text;
            });
            csvContent += rowData.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_report_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('CSV file downloaded successfully!');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Error exporting CSV. Please try again.');
    }
});
