import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WORLDTIDE_API_KEY = process.env.WORLDTIDE_API_KEY || '3e8ddef3-8962-441d-ba84-f2b00bfcf2ff';

/**
 * Fetches tide data from WorldTide API for a specific location
 * @param {Number} lat - Latitude of the location
 * @param {Number} lng - Longitude of the location
 * @param {Number} days - Number of days to fetch data for (default: 1)
 * @returns {Promise<Object>} - Tide data response
 */
async function fetchTideData(lat, lng, days = 1) {
  try {
    const response = await axios.get(
      `https://www.worldtideapi.com/api/v2/heights?lat=${lat}&lon=${lng}&key=${WORLDTIDE_API_KEY}&datum=LAT&step=900&days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tide data:', error.message);
    return null;
  }
}

/**
 * Fetches tide extremes (high and low tides) from WorldTide API
 * @param {Number} lat - Latitude of the location
 * @param {Number} lng - Longitude of the location
 * @param {Number} days - Number of days to fetch data for (default: 7)
 * @returns {Promise<Object>} - Tide extremes data response
 */
async function fetchTideExtremes(lat, lng, days = 7) {
  try {
    const response = await axios.get(
      `https://www.worldtideapi.com/api/v2/extremes?lat=${lat}&lon=${lng}&key=${WORLDTIDE_API_KEY}&datum=LAT&days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tide extremes:', error.message);
    return null;
  }
}

/**
 * Analyzes tide data to detect anomalies
 * @param {Object} tideData - Tide data from WorldTide API
 * @param {Object} historicalAverage - Historical average tide data for comparison
 * @returns {Object} - Analysis results with potential anomalies
 */
function analyzeTideData(tideData, historicalAverage = null) {
  if (!tideData || !tideData.heights || tideData.heights.length === 0) {
    return { hasAnomaly: false, message: 'No tide data available for analysis' };
  }

  // Get the latest tide height
  const latestHeight = tideData.heights[0];
  
  // Simple threshold-based anomaly detection
  // In a real system, this would compare against historical averages
  const threshold = 2.5; // Example threshold in meters
  
  if (latestHeight.height > threshold) {
    return {
      hasAnomaly: true,
      type: 'high_tide',
      severity: latestHeight.height > 3.5 ? 'high' : latestHeight.height > 3.0 ? 'med' : 'low',
      message: `High tide level detected: ${latestHeight.height.toFixed(2)}m`,
      details: {
        threshold,
        actual: latestHeight.height,
        timestamp: latestHeight.dt
      }
    };
  }
  
  return { hasAnomaly: false, message: 'No anomalies detected' };
}

export {
  fetchTideData,
  fetchTideExtremes,
  analyzeTideData
};