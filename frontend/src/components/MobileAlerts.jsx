import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Chip,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const MobileAlerts = ({ alerts = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (alerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [alerts.length]);

  if (!isMobile || alerts.length === 0) return null;

  const currentAlert = alerts[currentAlertIndex];
  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.95) 0%, rgba(30, 58, 95, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
            },
            '50%': {
              boxShadow: '0 -8px 32px rgba(255, 0, 0, 0.2)',
            },
            '100%': {
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: expanded ? 2 : 0 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              animation: 'glow 2s ease-in-out infinite alternate'
            }}>
              {getAlertIcon(currentAlert.severity)}
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {currentAlert.type?.toUpperCase() || 'ALERT'}
              </Typography>
            </Box>
            
            <Chip 
              label={currentAlert.severity?.toUpperCase() || 'MEDIUM'} 
              color={getAlertColor(currentAlert.severity)}
              size="small"
              variant="outlined"
            />
            
            <Box sx={{ flex: 1 }} />
            
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'text.secondary' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            
            <IconButton
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Slide direction="down" in={expanded} mountOnEnter unmountOnExit>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {currentAlert.message || 'Coastal threat detected'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(currentAlert.timestamp || Date.now()).toLocaleTimeString()}
              </Typography>
              
              {alerts.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                  {alerts.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: index === currentAlertIndex ? 'primary.main' : 'text.secondary',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Slide>
        </Box>
      </Paper>
    </Slide>
  );
};

export default MobileAlerts;
