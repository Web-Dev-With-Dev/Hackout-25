import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const TideChart = ({ readings, loading, stationId }) => {
  const [predictions, setPredictions] = useState([]);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('historical');
  const [predictionHours, setPredictionHours] = useState(24);
  
  useEffect(() => {
    if (viewMode === 'prediction') {
      fetchPredictions();
    }
  }, [viewMode, predictionHours]);
  
  const fetchPredictions = async () => {
    try {
      setPredictionLoading(true);
      const data = await api.getTidePredictions(predictionHours, stationId);
      setPredictions(data);
    } catch (error) {
      console.error('Error fetching tide predictions:', error);
    } finally {
      setPredictionLoading(false);
    }
  };
  
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  const handlePredictionHoursChange = (event, newHours) => {
    if (newHours !== null) {
      setPredictionHours(newHours);
    }
  };
  
  const formatData = (data) => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const timestamp = item.timestamp || item.ts || Date.now();
      const height = item.height || (item.metrics ? item.metrics.tideHeight : 0) || 0;
      
      return {
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(timestamp).toLocaleDateString(),
        height: parseFloat(height) || 0,
        timestamp: new Date(timestamp).getTime()
      };
    });
  };
  
  const formattedReadings = formatData(readings);
  const formattedPredictions = formatData(predictions);
  
  const displayData = viewMode === 'historical' ? formattedReadings : formattedPredictions;
  
  if (displayData && displayData.length > 0) {
    displayData.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }
  
  if (loading || predictionLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          No tide data available
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="historical">Historical</ToggleButton>
          <ToggleButton value="prediction">Prediction</ToggleButton>
        </ToggleButtonGroup>
        
        {viewMode === 'prediction' && (
          <ToggleButtonGroup
            value={predictionHours}
            exclusive
            onChange={handlePredictionHoursChange}
            size="small"
          >
            <ToggleButton value={12}>12h</ToggleButton>
            <ToggleButton value={24}>24h</ToggleButton>
            <ToggleButton value={48}>48h</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={displayData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }} 
          />
          <YAxis 
            label={{ value: 'Height (m)', angle: -90, position: 'insideLeft' }} 
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
            tickFormatter={(value) => `${(value || 0).toFixed(2)}`}
          />
          <Tooltip 
            labelFormatter={(label, items) => {
              if (items && items.length > 0) {
                const item = items[0].payload;
                return `${item.date} ${item.time}`;
              }
              return label;
            }}
            formatter={(value) => [`${(value || 0).toFixed(2)} m`, 'Tide Height']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="height" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            name={viewMode === 'prediction' ? 'Predicted Height' : 'Tide Height'}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TideChart;
