import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

const api = {
  // Alerts
  getAlerts: async () => {
    const response = await axios.get(`${API_URL}/alerts`);
    return response.data;
  },
  
  // Stations
  getStations: async () => {
    const response = await axios.get(`${API_URL}/stations`);
    return response.data;
  },
  
  // Readings
  getReadings: async (limit = 50) => {
    const response = await axios.get(`${API_URL}/readings?limit=${limit}`);
    return response.data;
  },
  
  getStationReadings: async (stationId) => {
    const response = await axios.get(`${API_URL}/readings/station/${stationId}`);
    return response.data;
  },
  
  // AI Model Endpoints
  getTidePredictions: async (hours = 24, stationId = null) => {
    const params = new URLSearchParams({ hours });
    if (stationId) params.append('stationId', stationId);
    
    const response = await axios.get(`${API_URL}/ai/predictions?${params}`);
    return response.data;
  },
  
  getTideAnalysis: async (stationId = null, days = 7) => {
    const params = new URLSearchParams({ days });
    if (stationId) params.append('stationId', stationId);
    
    const response = await axios.get(`${API_URL}/ai/analysis?${params}`);
    return response.data;
  },
  
  getAlertPatterns: async (days = 30) => {
    const response = await axios.get(`${API_URL}/ai/alert-patterns?days=${days}`);
    return response.data;
  }
};

export default api;