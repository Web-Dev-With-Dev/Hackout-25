import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Basic test routes
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mock data for frontend
app.get('/api/alerts', (req, res) => {
  res.json([
    { id: '1', type: 'HIGH_TIDE', severity: 'high', timestamp: new Date().toISOString(), location: 'North Beach', message: 'High tide warning' },
    { id: '2', type: 'STORM_SURGE', severity: 'medium', timestamp: new Date().toISOString(), location: 'South Harbor', message: 'Potential storm surge' }
  ]);
});

// Import coastal locations data
import coastalLocations from './data/coastalLocations.js';

app.get('/api/stations', (req, res) => {
  // Create stations from coastal locations
  const stations = coastalLocations.slice(0, 10).map((location, index) => ({
    id: (index + 1).toString(),
    name: `${location.name} Station`,
    type: index % 2 === 0 ? 'tide' : 'weather',
    lat: location.lat,
    lng: location.lng,
    status: 'active',
    meta: {
      region: location.country,
      isCoastal: true
    }
  }));
  
  res.json(stations);
});

app.get('/api/readings', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const readings = [];
  const now = new Date();
  
  for (let i = 0; i < limit; i++) {
    readings.push({
      id: `${i}`,
      stationId: i % 2 === 0 ? '1' : '2',
      timestamp: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
      tideHeight: 1.5 + Math.sin(i / 6) * 0.7,
      temperature: 22 + Math.sin(i / 12) * 3,
      windSpeed: 10 + Math.sin(i / 8) * 5,
      rainfall: Math.max(0, Math.sin(i / 24) * 5)
    });
  }
  
  res.json(readings);
});

// Import WorldTide API service and coastal locations
import { fetchTideData, fetchTideExtremes, analyzeTideData } from './services/worldTideService.js';
import coastalLocations from './data/coastalLocations.js';

app.get('/api/ai/predictions', async (req, res) => {
  console.log('AI predictions route hit');
  const hours = parseInt(req.query.hours) || 24;
  const stationId = req.query.stationId;
  const now = new Date();
  let predictions = [];
  
  try {
    // If stationId is provided, get the station data
    let lat = 51.5074; // Default to London
    let lng = -0.1278;
    
    if (stationId) {
      // Find the station in our coastal locations
      const station = coastalLocations.find(loc => 
        `${loc.name} Station` === stationId || 
        loc.name === stationId
      );
      
      if (station) {
        lat = station.lat;
        lng = station.lng;
      }
    }
    
    // Try to fetch real data from WorldTide API
    const days = Math.ceil(hours / 24);
    const tideData = await fetchTideData(lat, lng, days);
    
    if (tideData && tideData.heights) {
      // Convert WorldTide API data to our format
      predictions = tideData.heights.map(point => ({
        timestamp: new Date(point.dt).toISOString(),
        height: parseFloat(point.height.toFixed(2)),
        type: point.height > tideData.heights[0].height ? 'high' : 'low'
      }));
      
      // Filter to only include the requested number of hours
      predictions = predictions.filter((_, index) => index < hours);
    } else {
      // Fallback to mock data if API fails
      for (let i = 0; i < hours; i++) {
        const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
        const baseHeight = 1.5;
        const amplitude = 0.7;
        const period = 12.4;
        const height = baseHeight + amplitude * Math.sin((i / period) * 2 * Math.PI) + (Math.random() * 0.2 - 0.1);
        
        predictions.push({
          timestamp: timestamp.toISOString(),
          height: parseFloat(height.toFixed(2)),
          type: height > baseHeight ? 'high' : 'low'
        });
      }
    }
    
    res.json(predictions);
  } catch (error) {
    console.error('Error fetching tide predictions:', error);
    
    // Fallback to mock data if there's an error
    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      const baseHeight = 1.5;
      const amplitude = 0.7;
      const period = 12.4;
      const height = baseHeight + amplitude * Math.sin((i / period) * 2 * Math.PI) + (Math.random() * 0.2 - 0.1);
      
      predictions.push({
        timestamp: timestamp.toISOString(),
        height: parseFloat(height.toFixed(2)),
        type: height > baseHeight ? 'high' : 'low'
      });
    }
    
    res.json(predictions);
  }
});

app.get('/api/ai/analysis', async (req, res) => {
  console.log('AI analysis route hit');
  const days = parseInt(req.query.days) || 7;
  const stationId = req.query.stationId;
  
  try {
    // If stationId is provided, get the station data
    let lat = 51.5074; // Default to London
    let lng = -0.1278;
    
    if (stationId) {
      // Find the station in our coastal locations
      const station = coastalLocations.find(loc => 
        `${loc.name} Station` === stationId || 
        loc.name === stationId
      );
      
      if (station) {
        lat = station.lat;
        lng = station.lng;
      }
    }
    
    // Try to fetch real data from WorldTide API
    const tideData = await fetchTideData(lat, lng, days);
    const tideExtremes = await fetchTideExtremes(lat, lng, days);
    
    if (tideData && tideExtremes) {
      // Analyze the tide data
      const analysis = analyzeTideData(tideData);
      
      // Enhance with extremes data
      const highTides = tideExtremes.extremes.filter(e => e.type === 'High');
      const lowTides = tideExtremes.extremes.filter(e => e.type === 'Low');
      
      const avgHighTide = highTides.reduce((sum, tide) => sum + tide.height, 0) / highTides.length;
      const avgLowTide = lowTides.reduce((sum, tide) => sum + tide.height, 0) / lowTides.length;
      
      res.json({
        anomalies: analysis.hasAnomaly ? [
          { 
            date: new Date(analysis.details?.timestamp).toISOString(), 
            type: analysis.type, 
            severity: analysis.severity 
          }
        ] : [],
        patterns: {
          tidal_range: { 
            avg: parseFloat((avgHighTide - avgLowTide).toFixed(2)), 
            min: parseFloat((Math.min(...lowTides.map(t => t.height))).toFixed(2)), 
            max: parseFloat((Math.max(...highTides.map(t => t.height))).toFixed(2)) 
          },
          cycle_duration: { avg: 12.4, min: 12.1, max: 12.7 }
        },
        nextHighTide: highTides.length > 0 ? highTides[0].dt : null,
        nextLowTide: lowTides.length > 0 ? lowTides[0].dt : null
      });
    } else {
      // Fallback to mock data
      res.json({
        anomalies: [
          { date: new Date().toISOString(), type: 'high_tide', severity: 'medium' },
          { date: new Date(Date.now() + 86400000).toISOString(), type: 'storm_surge', severity: 'high' }
        ],
        patterns: {
          tidal_range: { avg: 1.4, min: 0.8, max: 2.1 },
          cycle_duration: { avg: 12.4, min: 12.1, max: 12.7 }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching tide analysis:', error);
    
    // Fallback to mock data if there's an error
    res.json({
      anomalies: [
        { date: new Date().toISOString(), type: 'high_tide', severity: 'medium' },
        { date: new Date(Date.now() + 86400000).toISOString(), type: 'storm_surge', severity: 'high' }
      ],
      patterns: {
        tidal_range: { avg: 1.4, min: 0.8, max: 2.1 },
        cycle_duration: { avg: 12.4, min: 12.1, max: 12.7 }
      }
    });
  }
});

app.get('/api/ai/alert-patterns', (req, res) => {
  console.log('AI alert patterns route hit');
  const days = parseInt(req.query.days) || 30;
  res.json({
    patterns: [
      { type: 'HIGH_TIDE', frequency: 'bi-daily', time_of_day: 'morning', avg_severity: 'medium' },
      { type: 'STORM_SURGE', frequency: 'weekly', time_of_day: 'evening', avg_severity: 'high' }
    ],
    hotspots: [
      { location: 'North Beach', alert_count: 12, primary_type: 'HIGH_TIDE' },
      { location: 'South Harbor', alert_count: 8, primary_type: 'STORM_SURGE' }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});