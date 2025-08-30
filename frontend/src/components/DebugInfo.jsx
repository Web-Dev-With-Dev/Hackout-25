import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = React.useState({
    componentsLoaded: [],
    errors: [],
    apiStatus: 'unknown'
  });

  React.useEffect(() => {
    const checkComponents = async () => {
      const info = {
        componentsLoaded: [],
        errors: [],
        apiStatus: 'unknown'
      };

      try {
        const Dashboard = await import('./Dashboard.jsx');
        info.componentsLoaded.push('Dashboard');
      } catch (error) {
        info.errors.push(`Dashboard: ${error.message}`);
      }

      try {
        const PredictionDashboard = await import('./PredictionDashboard.jsx');
        info.componentsLoaded.push('PredictionDashboard');
      } catch (error) {
        info.errors.push(`PredictionDashboard: ${error.message}`);
      }

      try {
        const ThreatMap = await import('./ThreatMap.jsx');
        info.componentsLoaded.push('ThreatMap');
      } catch (error) {
        info.errors.push(`ThreatMap: ${error.message}`);
      }

      try {
        const Analytics = await import('./Analytics.jsx');
        info.componentsLoaded.push('Analytics');
      } catch (error) {
        info.errors.push(`Analytics: ${error.message}`);
      }

      try {
        const Settings = await import('./Settings.jsx');
        info.componentsLoaded.push('Settings');
      } catch (error) {
        info.errors.push(`Settings: ${error.message}`);
      }

      try {
        const response = await fetch('http://localhost:5003/api/test');
        if (response.ok) {
          info.apiStatus = 'connected';
        } else {
          info.apiStatus = 'error';
        }
      } catch (error) {
        info.apiStatus = 'disconnected';
      }

      setDebugInfo(info);
    };

    checkComponents();
  }, []);

  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Debug Information
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Components Loaded:</Typography>
        <List dense>
          {debugInfo.componentsLoaded.map((component, index) => (
            <ListItem key={index}>
              <ListItemText primary={component} />
            </ListItem>
          ))}
        </List>
      </Box>

      {debugInfo.errors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="error">Errors:</Typography>
          <List dense>
            {debugInfo.errors.map((error, index) => (
              <ListItem key={index}>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Box>
        <Typography variant="subtitle1">API Status: {debugInfo.apiStatus}</Typography>
      </Box>
    </Paper>
  );
};

export default DebugInfo;

