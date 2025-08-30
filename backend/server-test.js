import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5003;

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

app.get('/api/ai/predictions', (req, res) => {
  console.log('AI predictions route hit');
  const hours = parseInt(req.query.hours) || 24;
  const now = new Date();
  const predictions = [];
  
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
});

app.get('/api/ai/analysis', (req, res) => {
  console.log('AI analysis route hit');
  const days = parseInt(req.query.days) || 7;
  const now = new Date();
  const anomalies = [];
  
  // Generate mock tide data analysis
  for (let i = 0; i < days * 2; i++) {
    const timestamp = new Date(now.getTime() - i * 12 * 60 * 60 * 1000);
    const expectedHeight = 1.5 + 0.7 * Math.sin((i / 12.4) * 2 * Math.PI);
    const actualHeight = expectedHeight + (Math.random() * 0.4 - 0.2);
    const deviation = parseFloat((actualHeight - expectedHeight).toFixed(2));
    
    anomalies.push({
      timestamp: timestamp.toISOString(),
      expectedHeight: parseFloat(expectedHeight.toFixed(2)),
      actualHeight: parseFloat(actualHeight.toFixed(2)),
      deviation
    });
  }
  
  res.json({
    anomalies,
    riskLevel: 'low',
    totalDeviations: anomalies.length
  });
});

app.get('/api/ai/alert-patterns', (req, res) => {
  console.log('AI alert patterns route hit');
  const days = parseInt(req.query.days) || 30;
  
  // Generate mock alert pattern analysis
  res.json({
    totalAlerts: 90,
    alertsByType: {
      WIND_SPEED: 35,
      WAVE_HEIGHT: 25,
      COASTAL_FLOODING: 20,
      WATER_QUALITY: 10
    },
    alertsBySeverity: {
      low: 45,
      medium: 30,
      high: 15
    },
    acknowledgmentRate: 0.78,
    mostCommonType: 'WIND_SPEED',
    recommendations: [
      'Increase monitoring frequency for wind speed alerts',
      'Review threshold settings for coastal flooding alerts',
      'Improve response time for high severity alerts'
    ]
  });
});

// Station routes
// Import coastal locations data
import { coastalLocations } from './data/coastalLocations.js';

app.get('/api/stations', (req, res) => {
  // Create stations from coastal locations
  const stations = coastalLocations.map((location, index) => {
    // Generate a random variation of the average wind speed to simulate real-time changes
    const windVariation = Math.random() * 4 - 2; // -2 to +2 variation
    const currentWindSpeed = Math.max(1, location.avgWindSpeed + windVariation);
    
    return {
      id: `STATION${(index + 1).toString().padStart(3, '0')}`,
      name: `${location.name}`,
      location: { lat: location.lat, lng: location.lng },
      status: Math.random() > 0.1 ? 'active' : 'maintenance',
      avgWindSpeed: location.avgWindSpeed,
      currentWindSpeed: parseFloat(currentWindSpeed.toFixed(1)),
      country: location.country,
      lastUpdated: new Date().toISOString()
    };
  });
  
  res.json(stations);
});

// Readings routes
app.get('/api/readings', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const stationId = req.query.stationId;
  const hours = parseInt(req.query.hours) || 24;
  const readings = [];
  const now = new Date();
  
  // Get all stations first to access their average wind speeds
  const stations = coastalLocations.map((location, index) => ({
    id: `STATION${(index + 1).toString().padStart(3, '0')}`,
    avgWindSpeed: location.avgWindSpeed
  }));
  
  // Filter by station if provided
  const stationIds = stationId ? [stationId] : stations.map(s => s.id);
  
  for (let i = 0; i < limit; i++) {
    // Calculate timestamp based on hours parameter
    const timestamp = new Date(now.getTime() - (i * (hours * 60 * 60 * 1000) / limit));
    
    // For each timestamp, create readings for all stations or just the requested one
    stationIds.forEach(id => {
      const stationIndex = parseInt(id.replace('STATION', '')) - 1;
      const station = stations[stationIndex % stations.length];
      const baseWindSpeed = station ? station.avgWindSpeed : 10;
      
      // Create time-based wind pattern with some randomness
      // Wind tends to be stronger in the afternoon
      const hour = timestamp.getHours();
      const timeOfDayFactor = Math.sin((hour - 6) / 24 * Math.PI) * 0.3 + 0.7; // 0.4 to 1.0
      
      // Add some daily variation
      const dayVariation = Math.sin(timestamp.getDate() / 30 * Math.PI) * 0.2; // -0.2 to 0.2
      
      // Add some random noise
      const randomNoise = (Math.random() * 0.4 - 0.2); // -0.2 to 0.2
      
      // Calculate final wind speed
      const windSpeed = baseWindSpeed * timeOfDayFactor * (1 + dayVariation) + randomNoise * baseWindSpeed;
      
      readings.push({
        id: `reading-${id}-${i}`,
        stationId: id,
        timestamp: timestamp.toISOString(),
        metrics: {
          tideHeight: 1.5 + 0.7 * Math.sin((i / 12.4) * 2 * Math.PI) + (Math.random() * 0.2 - 0.1),
          waterTemp: 18 + (Math.random() * 4 - 2),
          windSpeed: parseFloat(windSpeed.toFixed(1)),
          windDirection: Math.floor(Math.random() * 360),
          waveHeight: 0.8 + (Math.random() * 0.6 - 0.3),
          pressure: 1013 + Math.sin(i / 24 * Math.PI) * 5 + (Math.random() * 2 - 1)
        }
      });
    });
  }
  
  res.json(readings);
});

app.get('/api/readings/station/:stationId', (req, res) => {
  const stationId = req.params.stationId;
  const hours = parseInt(req.query.hours) || 24;
  const readings = [];
  const now = new Date();
  
  // Find the station to get its average wind speed
  const stationIndex = parseInt(stationId.replace('STATION', '')) - 1;
  const station = coastalLocations[stationIndex % coastalLocations.length];
  const baseWindSpeed = station ? station.avgWindSpeed : 10;
  
  // Generate more frequent readings for detailed charts
  const intervals = hours * 4; // 15-minute intervals
  
  for (let i = 0; i < intervals; i++) {
    const timestamp = new Date(now.getTime() - i * (60 * 60 * 1000) / 4);
    
    // Create time-based wind pattern with some randomness
    // Wind tends to be stronger in the afternoon
    const hour = timestamp.getHours();
    const timeOfDayFactor = Math.sin((hour - 6) / 24 * Math.PI) * 0.3 + 0.7; // 0.4 to 1.0
    
    // Add some daily variation
    const dayVariation = Math.sin(timestamp.getDate() / 30 * Math.PI) * 0.2; // -0.2 to 0.2
    
    // Add some random noise
    const randomNoise = (Math.random() * 0.4 - 0.2); // -0.2 to 0.2
    
    // Calculate final wind speed
    const windSpeed = baseWindSpeed * timeOfDayFactor * (1 + dayVariation) + randomNoise * baseWindSpeed;
    
    readings.push({
      id: `reading-${stationId}-${i}`,
      stationId: stationId,
      timestamp: timestamp.toISOString(),
      metrics: {
        tideHeight: 1.5 + 0.7 * Math.sin((i / 12.4) * 2 * Math.PI) + (Math.random() * 0.2 - 0.1),
        waterTemp: 18 + (Math.random() * 4 - 2),
        windSpeed: parseFloat(windSpeed.toFixed(1)),
        windDirection: Math.floor(Math.random() * 360),
        waveHeight: 0.8 + (Math.random() * 0.6 - 0.3),
        pressure: 1013 + Math.sin(i / 24 * Math.PI) * 5 + (Math.random() * 2 - 1)
      }
    });
  }
  
  res.json(readings);
});

// Alerts routes
app.get('/api/alerts', (req, res) => {
  const alerts = [];
  const now = new Date();
  const alertTypes = ['WIND_SPEED', 'WAVE_HEIGHT', 'COASTAL_FLOODING', 'WATER_QUALITY'];
  const severities = ['low', 'medium', 'high'];
  
  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);
    alerts.push({
      id: `alert-${i}`,
      stationId: `STATION00${(i % 4) + 1}`,
      timestamp: timestamp.toISOString(),
      type: alertTypes[i % alertTypes.length],
      severity: severities[i % severities.length],
      message: `Alert for ${alertTypes[i % alertTypes.length]} exceeding threshold`,
      acknowledged: i % 3 === 0 ? false : true
    });
  }
  
  res.json(alerts);
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});