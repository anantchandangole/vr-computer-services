// Engineer Portal JavaScript
const API_BASE = '/api';

let authToken = localStorage.getItem('engineerToken');
let currentUser = null;
let map = null;
let marker = null;

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('engineerTheme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
        html.classList.add('light-theme');
    } else {
        html.classList.remove('light-theme');
    }
    localStorage.setItem('engineerTheme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('engineerTheme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function updateThemeIcon(theme) {
    const icons = theme === 'light' 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    const themeToggleDashboard = document.getElementById('themeToggleEngineer');
    const themeToggleGlobal = document.getElementById('themeToggleGlobalEngineer');
    
    if (themeToggleDashboard) themeToggleDashboard.innerHTML = icons;
    if (themeToggleGlobal) themeToggleGlobal.innerHTML = icons;
}

// Show map with location using Leaflet (OpenStreetMap)
function showMap(lat, lng) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    mapContainer.style.display = 'block';
    
    try {
        const location = [parseFloat(lat), parseFloat(lng)];
        
        if (!map) {
            map = L.map('map').setView(location, 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        } else {
            map.setView(location, 15);
        }
        
        if (marker) {
            map.removeLayer(marker);
        }
        
        marker = L.marker(location).addTo(map)
            .bindPopup('Current Location')
            .openPopup();
    } catch (error) {
        console.error('Map error:', error);
        mapContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Unable to load map. Please check your internet connection.</p>';
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Engineer.js loaded');
    
    // Initialize theme
    initializeTheme();

    // Theme toggle buttons
    const themeToggleDashboard = document.getElementById('themeToggleEngineer');
    if (themeToggleDashboard) {
        themeToggleDashboard.addEventListener('click', toggleTheme);
    }
    const themeToggleGlobal = document.getElementById('themeToggleGlobalEngineer');
    if (themeToggleGlobal) {
        themeToggleGlobal.addEventListener('click', toggleTheme);
    }

    const loginForm = document.getElementById('engineerLoginForm');
    console.log('Login form found:', loginForm ? 'Yes' : 'No');
    
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

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    console.log('Browser navigation detected');
    // When back button is pressed, logout and show login
    if (authToken) {
        localStorage.removeItem('engineerToken');
        localStorage.removeItem('engineerUser');
        authToken = null;
        currentUser = null;
        showLogin();
    }
});

// Prevent browser caching of authenticated pages
window.addEventListener('beforeunload', () => {
    // This will force the browser to not cache the page
    if (authToken) {
        return '';
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
    console.log('Engineer login form submitted');
    
    const username = document.getElementById('engineerUsername').value;
    const password = document.getElementById('engineerPassword').value;
    const errorElement = document.getElementById('loginError');

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
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('engineerToken', authToken);
            localStorage.setItem('engineerUser', JSON.stringify(currentUser));
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
                
                // Disable clock-in form completely
                document.getElementById('clockInForm').disabled = true;
                const clockInBtn = document.getElementById('clockInForm').querySelector('button[type="submit"]');
                if (clockInBtn) {
                    clockInBtn.disabled = true;
                    clockInBtn.innerHTML = '<i class="fas fa-check"></i> Already Completed';
                }
            }
        } else {
            // No attendance today - show clock in
            document.getElementById('statusContent').innerHTML = '<p style="text-align: center; color: var(--text-color);">Not clocked in yet</p>';
            document.getElementById('clockInSection').style.display = 'block';
            document.getElementById('clockOutSection').style.display = 'none';
            document.getElementById('updateStatusSection').style.display = 'none';
            
            // Enable clock-in form
            document.getElementById('clockInForm').disabled = false;
            const clockInBtn = document.getElementById('clockInForm').querySelector('button[type="submit"]');
            if (clockInBtn) {
                clockInBtn.disabled = false;
                clockInBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Clock In';
            }
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Get Location
function getLocation(latInput, lngInput, addressInput, statusElement = null) {
    const btn = document.activeElement;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    }

    if (statusElement) {
        statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Acquiring GPS...';
        statusElement.style.display = 'block';
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

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

                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Get Current Location';
                }

                if (statusElement) {
                    statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> Location captured (Accuracy: ±${Math.round(accuracy)}m)`;
                    setTimeout(() => {
                        statusElement.style.display = 'none';
                    }, 3000);
                }
                
                // Show map with location
                showMap(lat, lng);
            },
            (error) => {
                let errorMessage = 'Unable to get location.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }

                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Get Current Location';
                }

                if (statusElement) {
                    statusElement.innerHTML = `<i class="fas fa-exclamation-circle" style="color: var(--danger);"></i> ${errorMessage}`;
                } else {
                    alert(errorMessage);
                }
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    } else {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Get Current Location';
        }
        if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-exclamation-circle" style="color: var(--danger);"></i> Geolocation not supported';
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    }
}

document.getElementById('getLocationBtn').addEventListener('click', () => {
    const statusElement = document.getElementById('locationStatus');
    getLocation('locationLat', 'locationLng', 'locationAddress', statusElement);
});

document.getElementById('updateLocationBtn').addEventListener('click', () => {
    getLocation('updateLocationLat', 'updateLocationLng', 'updateLocationAddress');
});

// Camera Variables
let videoStream = null;
let capturedPhotoDataUrl = null;
let currentFacingMode = 'environment'; // Default to back camera
let availableCameras = [];

// Check available cameras
async function getAvailableCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', availableCameras.length);
        return availableCameras;
    } catch (error) {
        console.error('Error enumerating cameras:', error);
        return [];
    }
}

// Open Camera
document.getElementById('openCameraBtn').addEventListener('click', async () => {
    const cameraError = document.getElementById('cameraError');
    cameraError.style.display = 'none';
    
    try {
        const videoElement = document.getElementById('videoElement');
        const cameraPreview = document.getElementById('cameraPreview');
        const switchCameraBtn = document.getElementById('switchCameraBtn');

        // Get available cameras
        const cameras = await getAvailableCameras();
        
        // Show/hide switch button based on camera count
        if (cameras.length > 1) {
            switchCameraBtn.style.display = 'inline-block';
        } else {
            switchCameraBtn.style.display = 'none';
        }

        // Request camera access with facing mode
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        videoStream = await navigator.mediaDevices.getUserMedia(constraints);

        videoElement.srcObject = videoStream;
        cameraPreview.style.display = 'block';
        document.getElementById('openCameraBtn').style.display = 'none';
    } catch (error) {
        console.error('Camera error:', error);
        const cameraError = document.getElementById('cameraError');
        cameraError.style.display = 'block';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            cameraError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Camera permission denied. Please enable camera access in your browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            cameraError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No camera found on this device. Please use the file upload option below.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            cameraError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
            cameraError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Camera does not support the requested settings. Try using file upload.';
        } else {
            cameraError.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Unable to access camera: ${error.message}. Please use the file upload option below.`;
        }
        
        // Show file input as fallback
        document.getElementById('photoInput').style.display = 'block';
    }
});

// Switch Camera
document.getElementById('switchCameraBtn').addEventListener('click', async () => {
    // Stop current stream
    stopCamera();
    
    // Toggle facing mode
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    
    // Reopen camera with new facing mode
    try {
        const videoElement = document.getElementById('videoElement');
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = videoStream;
    } catch (error) {
        console.error('Camera switch error:', error);
        const cameraError = document.getElementById('cameraError');
        cameraError.style.display = 'block';
        cameraError.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Unable to switch camera: ${error.message}`;
        
        // Revert to previous mode
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    }
});

// Capture Photo
document.getElementById('captureBtn').addEventListener('click', () => {
    const videoElement = document.getElementById('videoElement');
    const canvasElement = document.getElementById('canvasElement');
    const photoPreview = document.getElementById('photoPreview');
    const cameraPreview = document.getElementById('cameraPreview');

    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw video frame to canvas
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert to data URL
    capturedPhotoDataUrl = canvasElement.toDataURL('image/jpeg', 0.8);

    // Show preview
    photoPreview.innerHTML = `<img src="${capturedPhotoDataUrl}" alt="Captured Photo">`;
    document.getElementById('retakePhotoBtn').style.display = 'inline-block';

    // Stop camera and hide preview
    stopCamera();
    cameraPreview.style.display = 'none';
    document.getElementById('openCameraBtn').style.display = 'inline-block';
});

// Close Camera
document.getElementById('closeCameraBtn').addEventListener('click', () => {
    stopCamera();
    document.getElementById('cameraPreview').style.display = 'none';
    document.getElementById('openCameraBtn').style.display = 'inline-block';
});

// Stop Camera Function
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// Retake Photo
document.getElementById('retakePhotoBtn').addEventListener('click', () => {
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('retakePhotoBtn').style.display = 'none';
    capturedPhotoDataUrl = null;
});

// Fallback: File input for devices that don't support camera API
document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            capturedPhotoDataUrl = e.target.result;
            document.getElementById('photoPreview').innerHTML = `<img src="${e.target.result}" alt="Photo">`;
            document.getElementById('retakePhotoBtn').style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    }
});

// Clock In
document.getElementById('clockInForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if already clocked in today before proceeding
    try {
        const response = await fetch(`${API_BASE}/attendance/my-today`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success && data.attendance) {
            const attendance = data.attendance;
            if (attendance.inTime && !attendance.outTime) {
                alert('You are already clocked in today. Please clock out first.');
                return;
            }
            if (attendance.outTime) {
                alert('You have already completed attendance for today. Cannot clock in again.');
                return;
            }
        }
    } catch (error) {
        console.error('Error checking attendance:', error);
        alert('Error checking attendance status. Please try again.');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const location = {
        lat: document.getElementById('locationLat').value || null,
        lng: document.getElementById('locationLng').value || null,
        address: document.getElementById('locationAddress').value || ''
    };

    const remark = document.getElementById('clockInRemark').value;
    let photoUrl = '';

    // Use captured photo if available, otherwise try file upload
    if (capturedPhotoDataUrl) {
        // Convert data URL to blob and upload
        try {
            const response = await fetch(capturedPhotoDataUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('photo', blob, 'clock-in-photo.jpg');

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
            alert('Failed to upload photo. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
        }
    } else {
        const photoInput = document.getElementById('photoInput');
        if (photoInput.files.length > 0) {
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
            document.getElementById('retakePhotoBtn').style.display = 'none';
            document.getElementById('locationStatus').innerHTML = '';
            document.getElementById('map').style.display = 'none';
            capturedPhotoDataUrl = null;
            loadTodayAttendance();
        } else {
            alert(data.message || 'Clock in failed');
        }
    } catch (error) {
        alert('Server error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// Clock Out
document.getElementById('clockOutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

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
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// Update Status
document.getElementById('updateStatusForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

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
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
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
