// Dummy callback for Google Maps API to prevent "initMap is not a function" error
window.initMap = function() {
    console.log('✅ Google Maps API script loaded via callback.');
    // The actual map initialization happens in admin.js when the Live Tracking tab is opened.
};
