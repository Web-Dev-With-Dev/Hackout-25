import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodeCron from 'node-cron';
import alertRoutes from './routes/alertRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import stationRoutes from './routes/stationRoutes.js';

// Import AI routes - using dynamic import
let aiRoutes;
try {
  const aiRoutesModule = await import('./routes/aiRoutes.js');
  aiRoutes = aiRoutesModule.default;
  console.log('AI routes loaded successfully');
} catch (error) {
  console.error('Error loading AI routes:', error);
  aiRoutes = express.Router();
}

import Station from './models/Station.js';
import Reading from './models/Reading.js';
import { fetchTideData } from './services/worldTideService.js';
import { analyzeReadingsAndCreateAlerts } from './services/alertService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coastle-alert';
const WORLDTIDE_API_KEY = process.env.WORLDTIDE_API_KEY || '3e8ddef3-8962-441d-ba84-f2b00bfcf2ff';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test routes - define these before other routes
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Basic stations route
app.get('/api/stations', (req, res) => {
  console.log('Stations route hit');
  res.json([
    { id: '1', name: 'Mumbai Coastal Station', type: 'tide', lat: 19.076, lng: 72.8777 },
    { id: '2', name: 'Chennai Coastal Station', type: 'tide', lat: 13.0827, lng: 80.2707 },
    { id: '3', name: 'Kolkata Coastal Station', type: 'tide', lat: 22.5726, lng: 88.3639 }
  ]);
});

// Basic alerts route
app.get('/api/alerts', (req, res) => {
  console.log('Alerts route hit');
  res.json([
    {
      id: '1',
      type: 'high_tide',
      severity: 'medium',
      message: 'High tide expected in 2 hours',
      timestamp: new Date().toISOString(),
      stationId: '1'
    },
    {
      id: '2',
      type: 'storm_surge',
      severity: 'high',
      message: 'Storm surge warning issued',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      stationId: '2'
    }
  ]);
});

// Basic readings route
app.get('/api/readings', (req, res) => {
  console.log('Readings route hit');
  const limit = parseInt(req.query.limit) || 50;
  const readings = [];
  const now = new Date();
  
  for (let i = 0; i < limit; i++) {
    readings.push({
      id: `reading_${i}`,
      stationId: '1',
      ts: new Date(now.getTime() - i * 3600000).toISOString(),
      metrics: {
        tide_m: 1.5 + Math.sin(i * 0.5) * 0.5 + (Math.random() * 0.2 - 0.1)
      }
    });
  }
  
  res.json(readings);
});

// Direct AI routes - define these before mounting the router
app.get('/api/ai/predictions', (req, res) => {
  console.log('Direct AI predictions route hit');
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

// Routes - mount these after direct routes
app.use('/api/alerts', alertRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/stations', stationRoutes);
// Mount AI routes last to avoid conflicts
app.use('/api/ai', aiRoutes);

// Direct AI analysis route
app.get('/api/ai/analysis', (req, res) => {
  console.log('Direct AI analysis route hit');
  const days = parseInt(req.query.days) || 7;
  res.json({
    avgHighTide: 2.1,
    avgLowTide: 0.8,
    tideRange: 1.3,
    nextHighTide: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    nextLowTide: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  });
});

// Direct AI alert patterns route
app.get('/api/ai/alert-patterns', (req, res) => {
  console.log('Direct AI alert patterns route hit');
  const days = parseInt(req.query.days) || 30;
  res.json({
    totalAlerts: 15,
    mostCommonType: 'High Tide',
    peakAlertTime: '14:30',
    alertFrequency: 'Every 6 hours',
    tideCorrelation: 0.87
  });
});

// No duplicate routes needed as they are defined above

// Import services are at the top of the file

// Schedule data collection from WorldTide API every hour
nodeCron.schedule('0 * * * *', async () => {
  try {
    console.log('Fetching tide data from WorldTide API...');
    
    // Get all tide stations
    const tideStations = await Station.find({ type: 'tide' });
    
    for (const station of tideStations) {
      const tideData = await fetchTideData(station.lat, station.lng);
      
      if (tideData && tideData.heights && tideData.heights.length > 0) {
        // Get the latest tide height
        const latestHeight = tideData.heights[0];
        
        // Create a new reading
        const reading = await Reading.create({
          stationId: station._id,
          ts: new Date(latestHeight.dt),
          metrics: {
            tide_m: latestHeight.height
          }
        });
        
        // Analyze the reading for potential alerts
        await analyzeReadingsAndCreateAlerts(station, reading);
      }
    }
  } catch (error) {
    console.error('Error in scheduled tide data collection:', error);
  }
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Create a default station if none exists
async function createDefaultStation() {
  const stationCount = await Station.countDocuments();
  if (stationCount === 0) {
    await Station.create({
      name: 'Mumbai Coastal Station',
      type: 'tide',
      lat: 19.076,
      lng: 72.8777,
      meta: { region: 'West Coast', country: 'India' }
    });
    console.log('Default station created');
  }
}

createDefaultStation();