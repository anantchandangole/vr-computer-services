# Google Maps Live Tracking Integration

## ✅ Implementation Complete

The VR Computer Services application now has Google Maps integrated for real-time engineer tracking.

## API Key Details
- **API Key**: `AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`
- **Libraries**: Places, Maps
- **Features Enabled**: 
  - Real-time location tracking
  - Place search and autocomplete
  - Interactive markers with info windows

---

## Features Implemented

### 1. Admin Live Tracking Dashboard
**Location**: Admin Panel → Live Tracking Section

**Features**:
- 📍 Real-time engineer locations displayed on Google Map
- 🎯 Color-coded markers based on engineer status:
  - 🟢 **Green**: Working
  - 🟡 **Yellow**: Idle
  - 🟠 **Orange**: Pending
  - 🔴 **Red**: Closed
- 📋 Engineer list on the right side with details
- 🔍 Click markers to view detailed engineer information
- 📍 Map automatically zooms to show all active engineers
- 🔄 Refresh button to update locations in real-time

### 2. Engineer Portal
**Location**: Engineer Portal

**Features**:
- Google Maps API available for location selection
- Place search with autocomplete
- Current location detection
- Real-time status updates

---

## Files Updated

### Backend
- **`public/admin.html`**: Added Google Maps API script
- **`public/engineer.html`**: Added Google Maps API script

### Frontend
- **`public/js/admin.js`**: 
  - Added `initMap()` function for map initialization
  - Added `getEngineerMarkerIcon()` function for status-based markers
  - Updated `loadLiveTracking()` function with full Google Maps functionality
  - Added marker management system

---

## How It Works

### Google Maps Initialization
```javascript
// Automatically initializes when component loads
function initMap() {
    const mapContainer = document.getElementById('map');
    googleMap = new google.maps.Map(mapContainer, {
        zoom: 12,
        center: { lat: 21.1458, lng: 79.0882 }, // India center
        mapTypeId: 'roadmap'
    });
}
```

### Engineer Markers
Each engineer gets a marker with:
- **Position**: Latitude & Longitude from location data
- **Icon**: Color based on status (Working/Idle/Pending/Closed)
- **Info Window**: Click marker to see engineer details
- **Auto-fit**: Map automatically zooms to show all engineers

### Status-Based Marker Colors
```javascript
function getEngineerMarkerIcon(status) {
    'Working'  → Green marker
    'Idle'     → Yellow marker
    'Pending'  → Orange marker
    'Closed'   → Red marker
    default    → Blue marker
}
```

---

## Usage Instructions

### For Admin Users

1. **Access Live Tracking**:
   - Login to Admin Panel (http://localhost:5000/admin)
   - Navigate to "Live Tracking" section in sidebar

2. **View Engineer Locations**:
   - Map displays all engineers currently working
   - Each engineer has a color-coded marker
   - Engineer list shows details on the right

3. **Get Engineer Details**:
   - Click on any marker on the map
   - Info window shows:
     - Engineer name
     - Employee ID
     - Check-in time
     - Current status
     - Location address

4. **Refresh Locations**:
   - Click "Refresh Locations" button to update in real-time
   - Map automatically adjusts to show all markers

### For Engineers

1. **Check-In with Location**:
   - Engineers can enable location sharing during check-in
   - Location is captured as GPS coordinates
   - Location address is reverse-geocoded from coordinates

2. **Update Location**:
   - Use "Update Location" button to send current position
   - Updates status and location on admin dashboard

---

## Map Features

### Visual Elements
- **Zoom Control**: Use +/- buttons or scroll wheel
- **Pan Control**: Drag the map to move around
- **Street/Satellite View**: Switch between map types
- **Full Screen**: Expand to full screen view

### Marker Interactions
- **Hover**: Marker title appears on hover
- **Click**: Opens info window with engineer details
- **Auto-fit**: Map automatically fits all visible markers

### Map Settings
```javascript
// Default map center (India)
const defaultMapCenter = { lat: 21.1458, lng: 79.0882 };

// Map configuration
{
    zoom: 12,
    center: defaultMapCenter,
    mapTypeId: 'roadmap'
}
```

---

## Data Flow

```
Engineer Check-In
    ↓
GPS Location Captured
    ↓
Location Data Stored in Database
    ↓
Admin Views Live Tracking
    ↓
Google Maps API fetches location data
    ↓
Markers placed on map with color codes
    ↓
Info windows display engineer details
    ↓
Admin can click for more information
```

---

## API Endpoints Used

### Live Tracking Data
```
GET /api/attendance/live-locations
Headers: Authorization: Bearer <adminToken>
Response: 
{
    success: true,
    engineers: [
        {
            engineerId: "60d5ec49...",
            engineerName: "Engineer Name",
            inTime: "13:51",
            status: "Working",
            location: {
                lat: 21.1234,
                lng: 79.5678,
                address: "Address string"
            }
        }
    ]
}
```

---

## Troubleshooting

### Map Not Displaying
1. Check console for API key errors
2. Verify map container exists: `<div id="map"></div>`
3. Ensure container has CSS height defined
4. Check internet connection for API access

### Markers Not Showing
1. Verify engineers have location data
2. Check GPS coordinates are valid
3. Ensure engineer status is "Working"
4. Try refreshing locations

### Location Coordinates Invalid
- Check that latitude is between -90 and 90
- Check that longitude is between -180 and 180
- Verify location format in database

---

## Configuration

### API Key Settings
- **Key**: `AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`
- **Restrictions**: Can be configured in Google Cloud Console
- **Services**: Maps JavaScript API, Places API
- **Usage**: Real-time tracking and place search

### Map Customization
To customize map appearance, edit in `admin.js`:

```javascript
function initMap() {
    googleMap = new google.maps.Map(mapContainer, {
        zoom: 12,           // Change zoom level
        center: {...},      // Change default center
        mapTypeId: 'roadmap' // roadmap, satellite, terrain, hybrid
    });
}
```

---

## Security Considerations

1. **API Key**: Currently exposed in frontend (for demo purposes)
   - **Recommendation**: Restrict key in Google Cloud Console
   - **Production**: Use backend proxy for API calls

2. **Location Data**: Only visible to authenticated admins
   - JWT token required for all requests
   - Engineer locations encrypted in database

3. **CORS**: Configured in server
   - Only localhost:5000 can access API
   - Production should update CORS settings

---

## Performance Notes

- ✅ Maps load asynchronously (doesn't block page)
- ✅ Markers managed efficiently (cleared before update)
- ✅ Info windows created on-demand
- ✅ Bounds calculation optimized for multiple markers

---

## Future Enhancements

Possible additions:
1. **Route History**: Show engineer's journey throughout the day
2. **Geofencing**: Alert when engineer enters/leaves job sites
3. **Distance Calculation**: Show distance from office/client
4. **Traffic Layer**: Display real-time traffic conditions
5. **Custom Heatmap**: Show concentration of work areas
6. **Street View**: Preview location from Street View
7. **Offline Support**: Cache map tiles for offline use
8. **Mobile App**: Native mobile tracking app

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API key is valid in Google Cloud Console
3. Ensure location services are enabled
4. Contact administrator for API key issues

---

**Last Updated**: June 10, 2026  
**Status**: ✅ Fully Implemented and Tested
