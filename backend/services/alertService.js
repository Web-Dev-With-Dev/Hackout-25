import Alert from '../models/Alert.js';
import { notifySubscribers } from './notificationService.js';
import { getOptimizedThresholds } from './aiModelService.js';

// Default thresholds (will be overridden by AI model if available)
let alertThresholds = {
  HIGH_TIDE: 2.5,
  STORM_SURGE: 3.0,
  COASTAL_FLOODING: 3.5,
  WIND_SPEED: 15,
  RAINFALL: 10,
  TURBIDITY: 25
};

// Initialize thresholds from AI model
async function initializeThresholds() {
  try {
    const optimizedThresholds = await getOptimizedThresholds();
    if (optimizedThresholds) {
      console.log('Using AI optimized alert thresholds:', optimizedThresholds);
      alertThresholds = {
        ...alertThresholds,
        ...optimizedThresholds
      };
    }
  } catch (error) {
    console.error('Error initializing AI thresholds, using defaults:', error);
  }
}

// Initialize thresholds when service starts
initializeThresholds();

/**
 * Analyze readings and create alerts if thresholds are exceeded
 * @param {Object} station - The station object
 * @param {Object} reading - The reading object with metrics
 * @returns {Promise<Object|null>} - Created alert or null if no alert was created
 */
async function analyzeReadingsAndCreateAlerts(station, reading) {
  try {
    const { metrics } = reading;
    let createdAlert = null;
    
    // Check for storm surge (high tide)
    if (metrics.tide_m && metrics.tide_m > alertThresholds.HIGH_TIDE) {
      createdAlert = await Alert.create({
        area: station.name,
        center: { lat: station.lat, lng: station.lng },
        kind: 'surge',
        severity: metrics.tide_m > alertThresholds.STORM_SURGE ? 'high' : 
                 metrics.tide_m > (alertThresholds.HIGH_TIDE + alertThresholds.STORM_SURGE) / 2 ? 'med' : 'low',
        summary: `High tide level detected at ${station.name}`,
        details: {
          tide_level: metrics.tide_m,
          threshold: alertThresholds.HIGH_TIDE,
          timestamp: reading.ts
        }
      });
      
      // Notify subscribers
      await notifySubscribers(createdAlert);
      console.log(`Created surge alert for ${station.name}: Tide level ${metrics.tide_m}m`);
      return createdAlert;
    }
    
    // Check for storm conditions (high wind and rain)
    if (metrics.wind_mps && metrics.rain_mm && 
        metrics.wind_mps > alertThresholds.WIND_SPEED && metrics.rain_mm > alertThresholds.RAINFALL) {
      createdAlert = await Alert.create({
        area: station.name,
        center: { lat: station.lat, lng: station.lng },
        kind: 'storm',
        severity: 
          (metrics.wind_mps > alertThresholds.WIND_SPEED * 1.7 && metrics.rain_mm > alertThresholds.RAINFALL * 2.5) ? 'high' : 
          (metrics.wind_mps > alertThresholds.WIND_SPEED * 1.3 && metrics.rain_mm > alertThresholds.RAINFALL * 1.5) ? 'med' : 'low',
        summary: `Storm conditions detected at ${station.name}`,
        details: {
          wind_speed: metrics.wind_mps,
          rainfall: metrics.rain_mm,
          wind_threshold: alertThresholds.WIND_SPEED,
          rain_threshold: alertThresholds.RAINFALL,
          timestamp: reading.ts
        }
      });
      
      // Notify subscribers
      await notifySubscribers(createdAlert);
      console.log(`Created storm alert for ${station.name}: Wind ${metrics.wind_mps}m/s, Rain ${metrics.rain_mm}mm`);
      return createdAlert;
    }
    
    // Check for pollution (high turbidity)
    if (metrics.turbidity_NTU && metrics.turbidity_NTU > alertThresholds.TURBIDITY) {
      createdAlert = await Alert.create({
        area: station.name,
        center: { lat: station.lat, lng: station.lng },
        kind: 'pollution',
        severity: metrics.turbidity_NTU > alertThresholds.TURBIDITY * 2 ? 'high' : 
                 metrics.turbidity_NTU > alertThresholds.TURBIDITY * 1.4 ? 'med' : 'low',
        summary: `High water turbidity detected at ${station.name}`,
        details: {
          turbidity: metrics.turbidity_NTU,
          threshold: alertThresholds.TURBIDITY,
          timestamp: reading.ts
        }
      });
      
      // Notify subscribers
      await notifySubscribers(createdAlert);
      console.log(`Created pollution alert for ${station.name}: Turbidity ${metrics.turbidity_NTU} NTU`);
      return createdAlert;
    }
    
    return null; // No alert created
  } catch (error) {
    console.error('Error analyzing readings and creating alerts:', error);
    return null;
  }
}

/**
 * Get active alerts for a specific area
 * @param {String} area - The area name
 * @returns {Promise<Array>} - List of alerts for the area
 */
async function getActiveAlertsByArea(area) {
  try {
    return await Alert.find({ 
      area,
      acknowledged: false,
      ts: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).sort({ ts: -1 });
  } catch (error) {
    console.error(`Error getting active alerts for area ${area}:`, error);
    return [];
  }
}

/**
 * Get all active alerts
 * @returns {Promise<Array>} - List of all active alerts
 */
async function getAllActiveAlerts() {
  try {
    return await Alert.find({ 
      acknowledged: false,
      ts: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).sort({ ts: -1 });
  } catch (error) {
    console.error('Error getting all active alerts:', error);
    return [];
  }
}

/**
 * Update alert thresholds with new values from AI model
 * @returns {Promise<Object>} - The updated thresholds
 */
async function updateAlertThresholds() {
  await initializeThresholds();
  return alertThresholds;
}

/**
 * Get current alert thresholds
 * @returns {Object} - The current thresholds
 */
function getCurrentThresholds() {
  return { ...alertThresholds };
}

export {
  analyzeReadingsAndCreateAlerts,
  getActiveAlertsByArea,
  getAllActiveAlerts,
  updateAlertThresholds,
  getCurrentThresholds
};