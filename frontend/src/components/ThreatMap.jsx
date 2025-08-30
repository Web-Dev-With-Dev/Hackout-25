import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch
} from '@mui/material';
import { coastalLocations } from '../../../backend/data/coastalLocations';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
  Waves as WavesIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip as MapTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const createCustomIcon = (type, severity) => {
  const colors = {
    high: '#f44336',
    med: '#ff9800',
    low: '#2196f3'
  };
  
  const icons = {
    surge: '🌊',
    storm: '⛈️',
    pollution: '☣️'
  };
  
  return L.divIcon({
    html: `<div style="
      background: ${colors[severity] || '#2196f3'};
      border: 2px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${icons[type] || '📍'}</div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const ThreatMap = () => {
  const [stations, setStations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([19.076, 72.8777]); 
  const [zoom, setZoom] = useState(10);
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [seacoastLocations, setSeacoastLocations] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [showWeatherLayer, setShowWeatherLayer] = useState(false);
  const [showNaturalActivities, setShowNaturalActivities] = useState(false);
  const [nearestCoastalLocation, setNearestCoastalLocation] = useState(null);
  const [filters, setFilters] = useState({
    surge: true,
    storm: true,
    pollution: true,
    seacoast: true,
    weather: false,
    naturalActivities: false
  });
  const [weatherLayerType, setWeatherLayerType] = useState('temp_new'); 
  const [autoCenterEnabled, setAutoCenterEnabled] = useState(true);
  const [locationWatchId, setLocationWatchId] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestCoastalLocation = (latitude, longitude) => {
    let nearest = null;
    let minDistance = Infinity;

    coastalLocations.forEach(location => {
      const distance = calculateDistance(latitude, longitude, location.lat, location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    });

    return { location: nearest, distance: minDistance };
  };
  const onMapCreated = (map) => {
    setMapInstance(map);
    map.invalidateSize();
  };

  const fetchWeatherData = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=bd5e378503939ddaee76f12ad7a97608`
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchTideData = async (lat, lng) => {
    try {
      const response = await fetch(`/api/tides?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tide data:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stationsData, alertsData, coastalLocationsData] = await Promise.all([
          api.getStations().catch(err => {
            console.error('Error fetching stations:', err);
            return [
              { id: '1', name: 'Mumbai Coastal Station', type: 'tide', lat: 19.076, lng: 72.8777 },
              { id: '2', name: 'Chennai Coastal Station', type: 'tide', lat: 13.0827, lng: 80.2707 }
            ];
          }),
          api.getAlerts().catch(err => {
            console.error('Error fetching alerts:', err);
            return [
              {
                id: '1',
                kind: 'surge',
                severity: 'high',
                message: 'High tide expected in 2 hours',
                timestamp: new Date().toISOString(),
                stationId: '1',
                center: { lat: 19.076, lng: 72.8777 },
                area: 'Mumbai Coastal Area',
                summary: 'High tide alert for Mumbai coast',
                ts: new Date().toISOString()
              },
              {
                id: '2',
                kind: 'storm',
                severity: 'med',
                message: 'Storm surge detected in Chennai',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                stationId: '2',
                center: { lat: 13.0827, lng: 80.2707 },
                area: 'Chennai Coastal Area',
                summary: 'Storm surge warning issued',
                ts: new Date(Date.now() - 3600000).toISOString()
              }
            ];
          }),
          fetch('/api/coastal-locations')
            .then(response => response.ok ? response.json() : null)
            .catch(err => {
              console.error('Error fetching coastal locations:', err);
              return fetch('/backend/data/coastalLocations.js')
                .then(response => response.ok ? response.json() : [])
                .catch(() => [])
            })
        ]);
        setStations(stationsData);
        setAlerts(alertsData);
        setSeacoastLocations(coastalLocationsData || [
          { id: '1', name: 'Juhu Beach', country: 'India', lat: 19.0883, lng: 72.8264, avgWindSpeed: 15 },
          { id: '2', name: 'Marine Drive', country: 'India', lat: 18.9442, lng: 72.8234, avgWindSpeed: 18 },
          { id: '3', name: 'Versova Beach', country: 'India', lat: 19.1351, lng: 72.8146, avgWindSpeed: 12 }
        ]);
        
        fetchWeatherData(mapCenter[0], mapCenter[1]);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getThreatRadius = (severity) => {
    switch (severity) {
      case 'high': return 5000;
      case 'med': return 3000;
      case 'low': return 1500;
      default: return 1000;
    }
  };

  const getThreatColor = (severity) => {
    switch (severity) {
      case 'high': return '#f44336';
      case 'med': return '#ff9800';
      case 'low': return '#2196f3';
      default: return '#4caf50';
    }
  };

  const filteredAlerts = alerts.filter(alert => alert.kind && filters[alert.kind]);

  const threatStats = {
    total: alerts.length,
    high: alerts.filter(a => a.severity === 'high').length,
    med: alerts.filter(a => a.severity === 'med').length,
    low: alerts.filter(a => a.severity === 'low').length
  };

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.setZoom(mapInstance.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.setZoom(mapInstance.getZoom() - 1);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (mapInstance) {
            mapInstance.setView([latitude, longitude], 13);
          }
          const nearest = findNearestCoastalLocation(latitude, longitude);
          setNearestCoastalLocation(nearest);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };
  
  const toggleLocationTracking = () => {
    if (!trackingEnabled) {
      setTrackingEnabled(true);
      handleLocateMe();
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (autoCenterEnabled && mapInstance) {
            mapInstance.setView([latitude, longitude], mapInstance.getZoom());
          }
          const nearest = findNearestCoastalLocation(latitude, longitude);
          setNearestCoastalLocation(nearest);
          
          if (filters.weather) {
            fetchWeatherData(latitude, longitude);
          }
        },
        (error) => {
          console.error('Error tracking location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      setLocationWatchId(watchId);
    } else {
      setTrackingEnabled(false);
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        setLocationWatchId(null);
      }
    }
  };
  
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        setLocationWatchId(null);
      }
    };
  }, [locationWatchId]);
  const WeatherLayerOptions = () => (
    <Box sx={{ pl: 3, mt: 0.5, mb: 1 }}>
      <FormGroup row>
        <FormControlLabel
          control={
            <Radio
              checked={weatherLayerType === 'temp_new'}
              onChange={() => setWeatherLayerType('temp_new')}
              size="small"
              color="primary"
            />
          }
          label="Temperature"
        />
        <FormControlLabel
          control={
            <Radio
              checked={weatherLayerType === 'precipitation_new'}
              onChange={() => setWeatherLayerType('precipitation_new')}
              size="small"
              color="primary"
            />
          }
          label="Precipitation"
        />
        <FormControlLabel
          control={
            <Radio
              checked={weatherLayerType === 'clouds_new'}
              onChange={() => setWeatherLayerType('clouds_new')}
              size="small"
              color="primary"
            />
          }
          label="Clouds"
        />
      </FormGroup>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Loading threat map data...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we fetch the latest threat information
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, height: '80vh' }}>
      <Box sx={{ 
        height: '100%',
        mb: 4, 
        p: 4, 
        borderRadius: 4,
        background: '#ffffff',
        color: '#000000',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(99, 102, 241, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {nearestCoastalLocation && (
          <Box sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 2,
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="subtitle2">
              Nearest Coastal Location: {nearestCoastalLocation.location.name}
            </Typography>
            <Typography variant="caption">
              Distance: {nearestCoastalLocation.distance.toFixed(2)} km
            </Typography>
          </Box>
        )}
        
        {}
        <style>
          {`
            @keyframes rainbowFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>
        
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6366f1, #06b6d4, #fbbf24, #ec4899)',
          backgroundSize: '200% 100%',
          animation: 'rainbowFlow 3s ease-in-out infinite'
        }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 800,
          color: '#000000'
        }}>
          Threat Map
        </Typography>
        <Typography variant="h6" sx={{ 
          color: '#000000',
          fontWeight: 500
        }} gutterBottom>
          Real-time coastal threat monitoring and visualization
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{
            background: '#ffffff',
            color: '#000000',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(99, 102, 241, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #6366f1, #06b6d4, #fbbf24, ' +
                '#ec4899)',
              backgroundSize: '200% 100%',
              animation: 'rainbowFlow 3s ease-in-out infinite'
            }} />
            <CardHeader
              title="Map Controls"
              action={
                <IconButton onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1000);
                }}>
                  <RefreshIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Threat Filters
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.surge}
                        onChange={() => setFilters(prev => ({ ...prev, surge: !prev.surge }))}
                        color="primary"
                        size="small"
                      />
                    }
                    label="Surge Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.storm}
                        onChange={() => setFilters(prev => ({ ...prev, storm: !prev.storm }))}
                        color="primary"
                        size="small"
                      />
                    }
                    label="Storm Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.pollution}
                        onChange={() => setFilters(prev => ({ ...prev, pollution: !prev.pollution }))}
                        color="primary"
                        size="small"
                      />
                    }
                    label="Pollution Alerts"
                  />
                </FormGroup>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Map Layers
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.seacoast}
                        onChange={() => setFilters(prev => ({ ...prev, seacoast: !prev.seacoast }))}
                        color="info"
                        size="small"
                      />
                    }
                    label="Seacoast Locations"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.weather}
                        onChange={() => {
                          setFilters(prev => ({ ...prev, weather: !prev.weather }));
                          setShowWeatherLayer(!showWeatherLayer);
                          if (!filters.weather && mapCenter) {
                            fetchWeatherData(mapCenter[0], mapCenter[1]);
                          }
                        }}
                        color="info"
                        size="small"
                      />
                    }
                    label="Weather Data"
                  />
                  
                  {filters.weather && <WeatherLayerOptions />}
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.naturalActivities}
                        onChange={() => {
                          setFilters(prev => ({ ...prev, naturalActivities: !prev.naturalActivities }));
                          setShowNaturalActivities(!showNaturalActivities);
                        }}
                        color="info"
                        size="small"
                      />
                    }
                    label="Natural Activities"
                  />
                </FormGroup>
                
                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={trackingEnabled}
                        onChange={toggleLocationTracking}
                        color="success"
                        size="small"
                      />
                    }
                    label="Live Location Tracking"
                  />
                  
                  {trackingEnabled && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoCenterEnabled}
                          onChange={() => setAutoCenterEnabled(!autoCenterEnabled)}
                          color="success"
                          size="small"
                        />
                      }
                      label="Auto-Center Map"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Threat Statistics
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`High Priority: ${threatStats.high}`}
                      secondary="Immediate action required"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Medium Priority: ${threatStats.med}`}
                      secondary="Monitor closely"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Low Priority: ${threatStats.low}`}
                      secondary="Informational"
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <Card sx={{ 
            height: { xs: '70vh', md: '85vh' },
            background: '#ffffff',
            color: '#000000',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(99, 102, 241, 0.2)',
            transform: 'perspective(1000px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'perspective(1000px) rotateX(5deg) rotateY(3deg) translateZ(20px)',
              boxShadow: '0 32px 80px rgba(0, 0, 0, 0.2), 0 16px 48px rgba(99, 102, 241, 0.4)'
            }
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #6366f1, #06b6d4, #fbbf24, #ec4899)',
              backgroundSize: '200% 100%',
              animation: 'rainbowFlow 3s ease-in-out infinite',
              zIndex: 1
            }} />
            <CardHeader
              title="Live Threat Map"
              subheader={`${filteredAlerts.length} active threats • ${stations.length} monitoring stations`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Zoom In">
                    <IconButton onClick={() => setZoom(prev => Math.min(prev + 1, 18))}>
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom Out">
                    <IconButton onClick={() => setZoom(prev => Math.max(prev - 1, 5))}>
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="My Location">
                    <IconButton onClick={handleLocateMe}>
                      <MyLocationIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', p: 0 }}>
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ 
                  height: '100%', 
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
                zoomControl={false}
                whenCreated={onMapCreated}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {}
                {showWeatherLayer && (
                  <TileLayer
                    url={`https://tile.openweathermap.org/map/${weatherLayerType}/{z}/{x}/{y}.png?appid=bd5e378503939ddaee76f12ad7a97608`}
                    attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                    opacity={0.7}
                  />
                )}

                {}
                {userLocation && (
                  <>
                    {}
                    <Circle
                      center={userLocation}
                      radius={50} 
                      pathOptions={{
                        color: '#4285F4',
                        fillColor: '#4285F4',
                        fillOpacity: 0.1,
                        weight: 1
                      }}
                    />
                    
                    {}
                    <Marker 
                      position={userLocation}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `
                          <style>
                            @keyframes pulse {
                              0% { transform: scale(0.8); opacity: 0.8; }
                              50% { transform: scale(1.2); opacity: 0.5; }
                              100% { transform: scale(0.8); opacity: 0.8; }
                            }
                            .pulse-ring {
                              animation: pulse 2s infinite;
                            }
                          </style>
                          <div style="position: relative;">
                            <div class="pulse-ring" style="
                              position: absolute;
                              top: -12px;
                              left: -12px;
                              background-color: rgba(66, 133, 244, 0.3);
                              border-radius: 50%;
                              width: 24px;
                              height: 24px;
                            "></div>
                            <div style="
                              position: absolute;
                              top: -8px;
                              left: -8px;
                              background-color: #4285F4;
                              border: 2px solid white;
                              border-radius: 50%;
                              width: 16px;
                              height: 16px;
                              box-shadow: 0 0 0 2px #4285F4, 0 0 10px rgba(0, 0, 0, 0.35);
                            "></div>
                          </div>
                        `,
                        iconSize: [0, 0], 
                        iconAnchor: [0, 0]
                      })}
                    >
                      <Popup>
                        <Box sx={{ p: 1, minWidth: '200px' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Your Location
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Coordinates: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                          </Typography>
                          {weatherData && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Current Weather
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Condition: {weatherData.weather?.[0]?.description || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Temperature: {weatherData.main?.temp ? `${weatherData.main.temp}°C` : 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Humidity: {weatherData.main?.humidity ? `${weatherData.main.humidity}%` : 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Wind: {weatherData.wind?.speed ? `${weatherData.wind.speed} m/s` : 'N/A'}
                              </Typography>
                            </Box>
                          )}
                          {trackingEnabled && (
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                Live tracking {autoCenterEnabled ? 'with auto-center' : 'without auto-center'}
                              </Typography>
                              <Chip 
                                label="Active" 
                                size="small" 
                                color="success" 
                                sx={{ height: 20, fontSize: '0.7rem' }} 
                              />
                            </Box>
                          )}
                        </Box>
                      </Popup>
                    </Marker>
                  </>
                )}
                
                {}
                {stations.filter(station => station.lat && station.lng).map((station) => (
                  <Marker
                    key={station._id || station.id}
                    position={[station.lat, station.lng]}
                    icon={L.divIcon({
                      html: `<div style="
                        background: #00d4ff;
                        border: 2px solid white;
                        border-radius: 50%;
                        width: 16px;
                        height: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      ">📡</div>`,
                      className: 'station-marker',
                      iconSize: [16, 16],
                      iconAnchor: [8, 8]
                    })}
                  >
                    <Popup>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {station.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {station.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Coordinates: {station.lat ? station.lat.toFixed(4) : 'N/A'}, {station.lng ? station.lng.toFixed(4) : 'N/A'}
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                ))}
                
                {}
                {filters.seacoast && seacoastLocations
                  .filter(location => location.lat && location.lng)
                  .map(location => {
                    const locationSeed = parseInt(location.id) || location.name.charCodeAt(0);
                    const tideLevel = ['Very Low', 'Low', 'Medium', 'High', 'Very High'][locationSeed % 5];
                    const currentSpeed = (1 + (locationSeed % 7) * 0.7).toFixed(1);
                    const waveHeight = (0.5 + (locationSeed % 5) * 0.5).toFixed(1);
                    
                    return (
                      <Marker 
                        key={location.id} 
                        position={[location.lat, location.lng]}
                        icon={L.divIcon({
                          className: 'custom-div-icon',
                          html: `<div style="
                            background-color: #03A9F4;
                            border: 2px solid white;
                            border-radius: 50%;
                            width: 14px;
                            height: 14px;
                            box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.3), 0 0 10px rgba(0, 0, 0, 0.2);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                          ">🏖️</div>`,
                          iconSize: [20, 20],
                          iconAnchor: [10, 10]
                        })}
                      >
                        <Popup>
                           <Box sx={{ p: 1, minWidth: '220px' }}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0288d1' }}>
                               {location.name}
                             </Typography>
                             <Divider sx={{ my: 0.5 }} />
                             <Typography variant="body2" color="text.secondary">
                               Country: {location.country}
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               Avg. Wind Speed: {location.avgWindSpeed} km/h
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                             </Typography>
                             {showNaturalActivities && (
                               <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(3, 169, 244, 0.08)', borderRadius: 1, border: '1px solid rgba(3, 169, 244, 0.2)' }}>
                                 <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0288d1', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                   <WavesIcon fontSize="small" /> Natural Activities
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   Tide Level: <Chip size="small" label={tideLevel} color={tideLevel.includes('High') ? 'primary' : 'default'} sx={{ height: 20, fontSize: '0.7rem' }} />
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   Current Speed: {currentSpeed} knots
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   Wave Height: {waveHeight} meters
                                 </Typography>
                               </Box>
                             )}
                         </Box>
                       </Popup>
                      </Marker>
                    );
                  })}
                
                {}
                {filteredAlerts.filter(alert => alert.center && alert.center.lat && alert.center.lng).map((alert) => (
                  <React.Fragment key={alert._id || alert.id}>
                    <Circle
                      center={[alert.center.lat, alert.center.lng]}
                      radius={getThreatRadius(alert.severity)}
                      pathOptions={{
                        color: getThreatColor(alert.severity),
                        fillColor: getThreatColor(alert.severity),
                        fillOpacity: 0.2,
                        weight: 2
                      }}
                    >
                      <MapTooltip permanent>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {alert.kind?.toUpperCase() || 'UNKNOWN'} THREAT
                          </Typography>
                          <Typography variant="body2">
                            Severity: {alert.severity || 'unknown'}
                          </Typography>
                          <Typography variant="body2">
                            Area: {alert.area || 'Unknown area'}
                          </Typography>
                        </Box>
                      </MapTooltip>
                    </Circle>

                    <Marker
                      key={`marker-${alert._id || alert.id}`}
                      position={[alert.center.lat, alert.center.lng]}
                      icon={createCustomIcon(alert.kind || 'unknown', alert.severity || 'low')}
                    >
                      <Popup>
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {alert.kind?.toUpperCase() || 'UNKNOWN'} ALERT
                          </Typography>
                          <Chip 
                            label={(alert.severity || 'low').toUpperCase()} 
                            color={alert.severity === 'high' ? 'error' : alert.severity === 'med' ? 'warning' : 'info'}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" gutterBottom>
                            <strong>Area:</strong> {alert.area || 'Unknown area'}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Summary:</strong> {alert.summary || alert.message || 'No summary available'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Time:</strong> {new Date(alert.ts || alert.timestamp || Date.now()).toLocaleString()}
                          </Typography>
                        </Box>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}
              </MapContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};


export default ThreatMap;
