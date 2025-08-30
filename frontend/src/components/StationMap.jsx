import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, FormControl, InputLabel, Select, MenuItem, Typography, Slider } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import { format } from 'date-fns';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Store Google Maps API key for future use
const googleMapsApiKey = 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao';

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high':
      return '#ff0000';
    case 'med':
      return '#ff9900';
    case 'low':
      return '#ffff00';
    default:
      return '#ffff00';
  }
};

// Function to get color based on wind speed
const getWindSpeedColor = (windSpeed) => {
  if (windSpeed >= 18) return '#ff0000'; // Red for very high wind
  if (windSpeed >= 14) return '#ff6600'; // Orange for high wind
  if (windSpeed >= 10) return '#ffcc00'; // Yellow for moderate wind
  if (windSpeed >= 6) return '#66cc00';  // Light green for light wind
  return '#009900';                      // Dark green for very light wind
};

// Function to get wind intensity label based on wind speed
const getWindIntensityLabel = (windSpeed) => {
  if (windSpeed >= 18) return 'Very High';
  if (windSpeed >= 14) return 'High';
  if (windSpeed >= 10) return 'Moderate';
  if (windSpeed >= 6) return 'Light';
  return 'Very Light';
};



const StationMap = ({ stations, alerts }) => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [mapCenter, setMapCenter] = useState(null);
  const [timeFilter, setTimeFilter] = useState(24); // Default to 24 hours
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Component to change map view when location changes
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 10);
    }
  }, [center, map]);
  return null;
};
  
  if (!stations || stations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const handleLocationChange = (event) => {
    const locationId = event.target.value;
    setSelectedLocation(locationId);
    
    if (locationId) {
      const station = stations.find(s => s.id === locationId);
      if (station) {
        setMapCenter([station.location.lat, station.location.lng]);
      }
    }
  };
  
  const handleTimeFilterChange = (event, newValue) => {
    setTimeFilter(newValue);
  };

  // Calculate map center based on stations
  const calculateCenter = () => {
    if (stations.length === 0) return [34.0522, -118.2437]; // Default to Los Angeles
    
    const lats = stations.map(station => station.location.lat);
    const lngs = stations.map(station => station.location.lng);
    
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    
    return [centerLat, centerLng];
  };

  // Find active alerts for each station
  const getStationAlerts = (stationId) => {
    return alerts.filter(alert => alert.stationId === stationId && !alert.acknowledged);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select a coastal location:
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedLocation}
            onChange={handleLocationChange}
            displayEmpty
            sx={{ backgroundColor: '#fff' }}
          >
            <MenuItem value="">
              <em>All Locations</em>
            </MenuItem>
            {stations.map((station) => (
              <MenuItem key={station.id} value={station.id}>
                {station.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Time Window: {timeFilter} hours
          </Typography>
          <Slider
            value={timeFilter}
            onChange={handleTimeFilterChange}
            aria-labelledby="time-filter-slider"
            valueLabelDisplay="auto"
            step={6}
            marks
            min={6}
            max={72}
            sx={{ color: '#2e7d32' }}
          />
          <Typography variant="caption" color="text.secondary">
            Current time: {format(currentTime, 'yyyy-MM-dd HH:mm')}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ flexGrow: 1 }}>
        <MapContainer 
          center={mapCenter || calculateCenter()} 
          zoom={10} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {stations.map(station => {
            const stationAlerts = getStationAlerts(station.name);
            
            return (
              <React.Fragment key={station.id || station._id}>
                <Marker position={[station.location.lat, station.location.lng]}>
                  <Popup>
                    <div>
                      <h3>{station.name}</h3>
                      <div>Status: {station.status}</div>
                      <div>Active Alerts: {stationAlerts.length}</div>
                      <div>Wind Speed: {station.avgWindSpeed || '10'} knots</div>
                      <div style={{ 
                        marginTop: '5px', 
                        padding: '3px', 
                        backgroundColor: getWindSpeedColor(station.avgWindSpeed || 10),
                        color: '#fff',
                        borderRadius: '3px',
                        textAlign: 'center'
                      }}>
                        Wind Intensity: {getWindIntensityLabel(station.avgWindSpeed || 10)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Wind speed indicator circle */}
                <Circle
                  center={[station.location.lat, station.location.lng]}
                  radius={3000} // 3km radius
                  pathOptions={{
                    color: getWindSpeedColor(station.avgWindSpeed || 10),
                    fillColor: getWindSpeedColor(station.avgWindSpeed || 10),
                    fillOpacity: 0.2,
                    weight: 1
                  }}
                >
                  <Popup>
                    <div>
                      <h3>{station.name} - Wind Information</h3>
                      <div>Current Wind Speed: {station.avgWindSpeed || '10'} knots</div>
                      <div>Updated: {format(currentTime, 'HH:mm')}</div>
                      <div>Time Window: {timeFilter} hours</div>
                    </div>
                  </Popup>
                </Circle>
                
                {stationAlerts.map(alert => (
                  <Circle
                    key={alert.id}
                    center={[station.location.lat, station.location.lng]}
                    radius={2000} // 2km radius
                    pathOptions={{
                      color: getSeverityColor(alert.severity),
                      fillColor: getSeverityColor(alert.severity),
                      fillOpacity: 0.3
                    }}
                  >
                    <Popup>
                      <div>
                        <h3>{alert.message}</h3>
                        <div>Severity: {alert.severity}</div>
                        <div>Type: {alert.type}</div>
                        <div>Time: {new Date(alert.timestamp).toLocaleString()}</div>
                      </div>
                    </Popup>
                  </Circle>
                ))}
              </React.Fragment>
            );
          })}
          {mapCenter && <ChangeMapView center={mapCenter} />}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default StationMap;