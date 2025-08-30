import React from 'react';
import { List, ListItem, ListItemText, Typography, Chip, CircularProgress, Box } from '@mui/material';

const severityColors = {
  high: 'error',
  medium: 'warning',
  low: 'info'
};

const typeIcons = {
  WIND_SPEED: '🌪️',
  WAVE_HEIGHT: '🌊',
  COASTAL_FLOODING: '🌊',
  WATER_QUALITY: '🧪'
};

const AlertList = ({ alerts, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="body1" color="text.secondary">
          No alerts at this time
        </Typography>
      </Box>
    );
  }

  return (
    <List dense>
      {alerts.map((alert) => (
        <ListItem
          key={alert.id || alert._id}
          divider
          sx={{
            backgroundColor: alert.acknowledged ? 'inherit' : 'rgba(255, 0, 0, 0.05)',
          }}
        >
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <span>{typeIcons[alert.type] || '⚠️'}</span>
                <Typography variant="subtitle2">
                  {alert.message}
                </Typography>
              </Box>
            }
            secondary={
              <Box component="span">
                <Typography variant="caption" component="span" display="block">
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="caption" component="span" display="block">
                  Station: {alert.stationId}
                </Typography>
                <Box mt={1} component="span">
                  <Chip 
                    label={alert.severity.toUpperCase()} 
                    color={severityColors[alert.severity] || 'default'} 
                    size="small" 
                  />
                  {alert.acknowledged && (
                    <Chip 
                      label="ACKNOWLEDGED" 
                      color="success" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Box>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AlertList;