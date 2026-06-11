// Admin Panel JavaScript
const API_BASE = '/api';

let authToken = localStorage.getItem('adminToken');
let engineerToken = localStorage.getItem('engineerToken');

// Leaflet Map variables
window.leafletMap = null;
window.engineerMarkers = {};
window.defaultMapCenter = [21.1458, 79.0882]; // Center of India (Nagpur)

// Backward compatibility
let engineerMarkers = window.engineerMarkers;
const defaultMapCenter = window.defaultMapCenter;

// Initialize Leaflet Map
function initializeLeafletMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || window.leafletMap) return;

    mapContainer.style.height = '600px';
    
    // Initialize map
    window.leafletMap = L.map('map').setView(window.defaultMapCenter, 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(window.leafletMap);
    
    console.log('✅ Leaflet Map initialized successfully');
}

// Theme Management handled by theme.js

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    console.log('Browser navigation detected');
    if (authToken) {
        localStorage.removeItem('adminToken');
        authToken = null;
        showLogin();
    }
});

// Prevent browser caching of authenticated pages
window.addEventListener('beforeunload', () => {
    if (authToken) {
        return '';
    }
});

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin.js loaded');

    // Theme is initialized by theme.js

    const loginForm = document.getElementById('adminLoginForm');
    const engineerLoginForm = document.getElementById('engineerLoginForm');
    console.log('Admin login form found:', loginForm ? 'Yes' : 'No');
    console.log('Engineer login form found:', engineerLoginForm ? 'Yes' : 'No');

    if (authToken) {
        showDashboard();
    } else if (engineerToken) {
        window.location.href = '/engineer';
    } else {
        showLogin();
    }

    // Toggle between admin and engineer login
    const authWrapper = document.querySelector('.auth-wrapper');
    const engineerTrigger = document.querySelector('.engineer-trigger');
    const adminTrigger = document.querySelector('.admin-trigger');

    console.log('Auth wrapper found:', authWrapper ? 'Yes' : 'No');
    console.log('Engineer trigger found:', engineerTrigger ? 'Yes' : 'No');
    console.log('Admin trigger found:', adminTrigger ? 'Yes' : 'No');

    if (engineerTrigger) {
        engineerTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            authWrapper.classList.add('toggled');
        });
    }

    if (adminTrigger) {
        adminTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            authWrapper.classList.remove('toggled');
        });
    }

    // Mobile menu toggle for dashboard
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
            document.body.classList.toggle('sidebar-open');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        });
    }

    // Close sidebar when clicking nav links on mobile
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                document.body.classList.remove('sidebar-open');
            }
        });
    });

    // Auto-close sidebar on resize past mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });

    // Theme toggles are handled by theme.js
});

// Admin Login Event Listener
const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Admin login form submitted');

        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        const errorElement = document.getElementById('adminLoginError');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Clear previous error
        errorElement.textContent = '';

        // Validate inputs
        if (!username || !password) {
            errorElement.textContent = 'Please enter both username and password';
            return;
        }

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

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
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorElement.textContent = 'Network error. Please check your internet connection.';
            } else {
                errorElement.textContent = 'Server error. Please try again.';
            }
            console.error('Login error:', error);
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    });
}

// Engineer Login Event Listener
const engineerLoginForm = document.getElementById('engineerLoginForm');
if (engineerLoginForm) {
    engineerLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Engineer login form submitted');
        
        const username = document.getElementById('engineerUsername').value;
        const password = document.getElementById('engineerPassword').value;
        const errorElement = document.getElementById('engineerLoginError');

        console.log('Username:', username);
        console.log('Password length:', password.length);

        try {
            console.log('Sending login request to:', `${API_BASE}/auth/engineer/login`);
            const response = await fetch(`${API_BASE}/auth/engineer/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                engineerToken = data.token;
                localStorage.setItem('engineerToken', engineerToken);
                localStorage.setItem('engineerUser', JSON.stringify(data.user));
                console.log('Redirecting to /engineer...');
                window.location.href = '/engineer';
            } else {
                errorElement.textContent = data.message || 'Login failed';
                console.error('Login failed:', data.message);
            }
        } catch (error) {
            errorElement.textContent = 'Server error. Please try again.';
            console.error('Login error:', error);
        }
    });
} else {
    console.log('Engineer login form not found');
}

// Show Login Section
function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
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

// Reset Engineer Passwords Button
document.getElementById('resetEngineerPasswordsBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reset all engineer passwords to "123456"? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/reset-engineer-passwords`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword: '123456' })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ ${data.message}\n\nAll engineers can now login with password: ${data.newPassword}`);
        } else {
            alert(data.message || 'Failed to reset passwords');
        }
    } catch (error) {
        console.error('Error resetting passwords:', error);
        alert('Server error. Please try again.');
    }
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
                let locStr = '-';
                if (record.clockInLocation && record.clockInLocation.address) {
                    locStr = record.clockInLocation.address;
                } else if (record.location && record.location.address) {
                    locStr = record.location.address;
                }
                const row = `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.engineerName}</td>
                        <td>${record.inTime || '-'}</td>
                        <td>${record.outTime || '-'}</td>
                        <td>${record.workingHours || '-'}</td>
                        <td>${locStr}</td>
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
                engineersList.innerHTML = '<p>No engineers currently working</p>';
                
                // Clear previous markers
                Object.values(window.engineerMarkers).forEach(marker => {
                    if (window.leafletMap) window.leafletMap.removeLayer(marker);
                });
                window.engineerMarkers = {};
                
                // Initialize map if not already initialized
                if (!window.leafletMap && mapContainer) {
                    mapContainer.style.height = '600px';
                    initializeLeafletMap();
                }
                
                if (window.leafletMap) {
                    window.leafletMap.setView(window.defaultMapCenter, 12);
                    setTimeout(() => window.leafletMap.invalidateSize(), 100);
                }
                return;
            }

            // Initialize map if not already initialized
            if (!window.leafletMap && mapContainer) {
                mapContainer.style.height = '600px';
                initializeLeafletMap();
            }

            // Clear previous markers
            Object.values(window.engineerMarkers).forEach(marker => {
                if (window.leafletMap) window.leafletMap.removeLayer(marker);
            });
            window.engineerMarkers = {};

            // Add markers for each engineer
            let bounds = []; // Array of [lat, lng] for Leaflet
            let engineersWithLocation = 0;

            engineersList.innerHTML = '';

            data.engineers.forEach((engineer, index) => {
                const card = `
                    <div class="engineer-card" style="cursor: pointer; transition: transform 0.2s;" onclick="focusEngineer('${engineer.engineerId}')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <h5>${engineer.engineerName}</h5>
                        <p><strong>ID:</strong> ${engineer.engineerId}</p>
                        <p><strong>In Time:</strong> ${engineer.inTime}</p>
                        <p><strong>Status:</strong> <span class="status-badge ${engineer.status}">${engineer.status}</span></p>
                        ${engineer.location && engineer.location.address ? `<p><strong>Location:</strong> ${engineer.location.address}</p>` : ''}
                        ${engineer.location && engineer.location.lat ? `<p><strong>Coordinates:</strong> ${engineer.location.lat.toFixed(4)}, ${engineer.location.lng.toFixed(4)}</p>` : ''}
                    </div>
                `;
                engineersList.innerHTML += card;

                // Add marker if location is available
                if (engineer.location && engineer.location.lat && engineer.location.lng && window.leafletMap) {
                    const position = [parseFloat(engineer.location.lat), parseFloat(engineer.location.lng)];

                    // Custom Leaflet Icon
                    const iconUrl = getEngineerMarkerIcon(engineer.status);
                    const customIcon = L.icon({
                        iconUrl: iconUrl,
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    });

                    const marker = L.marker(position, { icon: customIcon, title: engineer.engineerName })
                        .addTo(window.leafletMap);

                    // Create popup content
                    const popupContent = `
                        <div style="font-family: Arial; padding: 10px; width: 250px;">
                            <h4 style="margin: 0 0 10px 0;">${engineer.engineerName}</h4>
                            <p><strong>ID:</strong> ${engineer.engineerId}</p>
                            <p><strong>In Time:</strong> ${engineer.inTime}</p>
                            <p><strong>Status:</strong> ${engineer.status}</p>
                            ${engineer.location && engineer.location.address ? `<p><strong>Location:</strong> ${engineer.location.address}</p>` : ''}
                        </div>
                    `;
                    marker.bindPopup(popupContent);

                    window.engineerMarkers[engineer.engineerId] = marker;
                    bounds.push(position);
                    engineersWithLocation++;
                }
            });

            // Fit map to show all markers
            if (engineersWithLocation > 0 && window.leafletMap) {
                const leafletBounds = L.latLngBounds(bounds);
                window.leafletMap.fitBounds(leafletBounds, { padding: [50, 50] });
            } else if (window.leafletMap) {
                window.leafletMap.setView(window.defaultMapCenter, 12);
            }

            // Fix map rendering issue when initialized or displayed from a hidden tab
            if (window.leafletMap) {
                setTimeout(() => {
                    window.leafletMap.invalidateSize();
                }, 100);
            }

            console.log(`✅ Loaded ${data.engineers.length} engineers (${engineersWithLocation} with location data)`);
        }
    } catch (error) {
        console.error('Error loading live tracking:', error);
        alert('Error loading live tracking data. Please try again.');
    }
}

// Get marker icon based on engineer status
function getEngineerMarkerIcon(status) {
    const icons = {
        'Working': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        'Idle': 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
        'Pending': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
        'Closed': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    };
    return icons[status] || 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
}

// Focus map on specific engineer
window.focusEngineer = function(engineerId) {
    console.log("Focusing engineer:", engineerId);
    if (window.engineerMarkers && window.engineerMarkers[engineerId] && window.leafletMap) {
        const marker = window.engineerMarkers[engineerId];
        window.leafletMap.setView(marker.getLatLng(), 16, { animate: true });
        marker.openPopup();
        
        // Scroll map into view smoothly (helpful on mobile/small screens)
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        alert("Location data not available for this engineer.");
    }
};

document.getElementById('refreshLocations').addEventListener('click', loadLiveTracking);

// Export to Excel/CSV
document.getElementById('exportExcel').addEventListener('click', async () => {
    try {
        const tbody = document.getElementById('reportTable');
        if (!tbody) {
            alert('Report table not found. Please generate a report first.');
            return;
        }

        const rows = tbody.querySelectorAll('tr');

        if (rows.length === 0) {
            alert('No data to export. Please generate a report first.');
            return;
        }

        let csvContent = 'Date,Engineer Name,In Time,Out Time,Working Hours,Location,Task Completed\n';

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const rowData = Array.from(cells).map(cell => {
                    let text = cell.textContent.trim();
                    text = text.replace(/"/g, '""');
                    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                        text = `"${text}"`;
                    }
                    return text;
                });
                csvContent += rowData.join(',') + '\n';
            }
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

        URL.revokeObjectURL(url);
        alert('CSV file downloaded successfully!');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Error exporting CSV. Please try again.');
    }
});
