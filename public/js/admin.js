// Admin Panel JavaScript
const API_BASE = '/api';

let authToken = localStorage.getItem('adminToken');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
    } else {
        showLogin();
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
    document.getElementById('dashboardSection').style.display = 'flex';
    document.getElementById('dashboardSection').classList.add('active');
    loadDashboardStats();
}

// Admin Login
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            showDashboard();
        } else {
            errorElement.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorElement.textContent = 'Server error. Please try again.';
    }
});

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
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

        // Show selected section
        const sectionId = link.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');

        // Update page title
        document.getElementById('pageTitle').textContent = link.querySelector('span').textContent;

        // Load section data
        if (sectionId === 'dashboard') loadDashboardStats();
        if (sectionId === 'engineers') loadEngineers();
        if (sectionId === 'attendance') loadAttendance();
        if (sectionId === 'live-tracking') loadLiveTracking();
    });
});

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard-stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('totalEngineers').textContent = data.stats.totalEngineers;
            document.getElementById('presentToday').textContent = data.stats.presentToday;
            document.getElementById('workingNow').textContent = data.stats.workingNow;
            document.getElementById('absentToday').textContent = data.stats.absentToday;

            // Load today's attendance table
            const tbody = document.getElementById('todayAttendanceTable');
            tbody.innerHTML = '';

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
                            <button class="btn btn-sm btn-secondary" onclick="editEngineer('${engineer.username}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteEngineer('${engineer.username}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // Update engineer dropdowns
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
        password: document.getElementById('engineerPassword').value,
        status: document.getElementById('engineerStatus').value
    };

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
        }
    } catch (error) {
        alert('Error loading engineer data');
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
                        <td>${record.engineerName}</td>
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

            // Simple map placeholder (integrate Google Maps API for real implementation)
            mapContainer.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Google Maps Integration</p>
                    <p>${data.engineers.length} engineers currently working</p>
                    <p style="font-size: 0.875rem; color: #666;">Add your Google Maps API key to enable live tracking</p>
                </div>
            `;

            // List engineers
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

// Export to Excel (Placeholder)
document.getElementById('exportExcel').addEventListener('click', () => {
    alert('Excel export feature. Implement with a library like SheetJS or generate CSV on server.');
});
