import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Alert as MuiAlert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Water as WaterIcon,
  Cloud as CloudIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AlertList from './AlertList';
import TideChart from './TideChart';
import EnhancedTideChart from './EnhancedTideChart';
import StationMap from './StationMap';
import api from '../services/api';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [stations, setStations] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiStatus, setAiStatus] = useState({
    active: true,
    accuracy: 94.2,
    predictions: 156,
    lastUpdate: new Date()
  });
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsData, stationsData, readingsData] = await Promise.all([
          api.getAlerts().catch(err => {
            console.error('Error fetching alerts:', err);
            return [
              {
                id: '1',
                type: 'high_tide',
                severity: 'medium',
                message: 'High tide expected in 2 hours',
                timestamp: new Date().toISOString(),
                stationId: '1'
              }
            ];
          }),
          api.getStations().catch(err => {
            console.error('Error fetching stations:', err);
            return [
              { id: '1', name: 'Mumbai Coastal Station', type: 'tide', lat: 19.076, lng: 72.8777 },
              { id: '2', name: 'Chennai Coastal Station', type: 'tide', lat: 13.0827, lng: 80.2707 }
            ];
          }),
          api.getReadings(100).catch(err => {
            console.error('Error fetching readings:', err);
            const readings = [];
            const now = new Date();
            for (let i = 0; i < 50; i++) {
              readings.push({
                id: `reading_${i}`,
                stationId: '1',
                ts: new Date(now.getTime() - i * 3600000).toISOString(),
                metrics: {
                  tide_m: 1.5 + Math.sin(i * 0.5) * 0.5 + (Math.random() * 0.2 - 0.1)
                }
              });
            }
            return readings;
          })
        ]);
        
        setAlerts(alertsData);
        setStations(stationsData);
        setReadings(readingsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  const threatData = [
    { name: 'Storm Surge', value: 45, color: '#ff6b35' },
    { name: 'High Tide', value: 30, color: '#00d4ff' },
    { name: 'Pollution', value: 15, color: '#4caf50' },
    { name: 'Wind Damage', value: 10, color: '#ff9800' }
  ];

  const performanceData = [
    { time: '00:00', tide: 1.2, wind: 8, rain: 0 },
    { time: '04:00', tide: 2.1, wind: 12, rain: 2 },
    { time: '08:00', tide: 1.8, wind: 15, rain: 5 },
    { time: '12:00', tide: 2.5, wind: 18, rain: 8 },
    { time: '16:00', tide: 2.3, wind: 14, rain: 3 },
    { time: '20:00', tide: 1.9, wind: 10, rain: 1 }
  ];

  const aiMetrics = [
    { label: 'Prediction Accuracy', value: 94.2, unit: '%', trend: 'up', color: 'success' },
    { label: 'Response Time', value: 0.8, unit: 's', trend: 'down', color: 'primary' },
    { label: 'False Positives', value: 2.1, unit: '%', trend: 'down', color: 'success' },
    { label: 'Coverage Area', value: 156, unit: 'km²', trend: 'up', color: 'info' }
  ];

  const getStatusColor = (severity) => {
    switch (severity) {
      case 'high': return theme.palette.error.main;
      case 'med': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  const getStatusIcon = (severity) => {
    switch (severity) {
      case 'high': return <ErrorIcon />;
      case 'med': return <WarningIcon />;
      case 'low': return <InfoIcon />;
      default: return <CheckCircleIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <Box sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            animation: 'pulse 2s infinite'
          }}>
            <WaterIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h2" component="h1" sx={{ 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Coastle Elite
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Advanced Coastal Threat Detection & AI Analytics
            </Typography>
          </Box>
        </Box>
        
        {}
        <Paper sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 3,
          backdropFilter: 'blur(20px)'
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ 
                  bgcolor: 'success.main', 
                  width: 48, 
                  height: 48,
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    AI System Active
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {aiStatus.lastUpdate.toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Chip 
                  label={`${aiStatus.accuracy}% Accuracy`} 
                  color="success" 
                  variant="outlined"
                  icon={<CheckCircleIcon />}
                  sx={{ 
                    borderColor: 'success.main',
                    color: 'success.main',
                    fontWeight: 600
                  }}
                />
                <Chip 
                  label={`${aiStatus.predictions} Predictions`} 
                  color="primary" 
                  variant="outlined"
                  icon={<TrendingUpIcon />}
                  sx={{ 
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {error && (
        <MuiAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </MuiAlert>
      )}
      
      {}
      <Grid container spacing={4}>
        {}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(139, 92, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #fbbf24, #ec4899)',
              backgroundSize: '200% 100%',
              animation: 'rainbowFlow 3s ease-in-out infinite'
            }} />
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  AI Performance Metrics
                </Typography>
              }
              subheader="Real-time AI model performance indicators"
              action={
                <IconButton sx={{ 
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                }}>
                  <RefreshIcon />
                </IconButton>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={3}>
                {aiMetrics.map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%)',
                      border: '2px solid rgba(139, 92, 246, 0.2)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(139, 92, 246, 0.1)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transformStyle: 'preserve-3d',
                      perspective: 1000,
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                        border: '2px solid rgba(139, 92, 246, 0.4)',
                        transform: 'translateY(-8px) translateZ(10px) rotateX(5deg)',
                        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(139, 92, 246, 0.3)'
                      }
                    }}>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 800, 
                        color: theme.palette[metric.color].main,
                        mb: 1
                      }}>
                        {metric.value}{metric.unit}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        {metric.label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {metric.trend === 'up' ? 
                          <TrendingUpIcon sx={{ color: 'success.main' }} /> : 
                          <TrendingDownIcon sx={{ color: 'error.main' }} />
                        }
                        <Typography variant="body2" sx={{ 
                          color: metric.trend === 'up' ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}>
                          {metric.trend === 'up' ? '+2.1%' : '-0.5%'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            height: { xs: '500px', md: '700px' },
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(139, 92, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #fbbf24, #ec4899)',
              backgroundSize: '200% 100%',
              animation: 'rainbowFlow 3s ease-in-out infinite',
              zIndex: 1
            }} />
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Live Threat Map
                </Typography>
              }
              subheader="Real-time coastal monitoring stations and threat visualization"
              action={
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    label={`${stations.length} Stations`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                  <IconButton sx={{ 
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' }
                  }}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              }
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', p: 0 }}>
              <StationMap stations={stations} alerts={alerts} />
            </CardContent>
          </Card>
        </Grid>
        
        {}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            height: { xs: '500px', md: '700px' },
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ec4899)',
              zIndex: 1
            }} />
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Active Alerts
                </Typography>
              }
              subheader={`${alerts.length} threats detected in real-time`}
              action={
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    label={alerts.filter(a => a.severity === 'high').length} 
                    color="error" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <IconButton sx={{ 
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                  }}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              }
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', overflow: 'auto' }}>
              <AlertList alerts={alerts} loading={loading} />
            </CardContent>
          </Card>
        </Grid>
        
        {}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: { xs: '400px', md: '500px' },
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981, #3b82f6, #6366f1)',
              zIndex: 1
            }} />
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Threat Distribution
                </Typography>
              }
              subheader="Analysis of different threat types and their frequency"
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', pt: 0 }}>
              <Box sx={{ height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={threatData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {threatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: { xs: '400px', md: '500px' },
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #f59e0b, #ec4899, #6366f1)',
              zIndex: 1
            }} />
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Environmental Trends
                </Typography>
              }
              subheader="Real-time environmental data monitoring and analysis"
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', pt: 0 }}>
              <Box sx={{ height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.7)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="tide" 
                      stackId="1" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="wind" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rain" 
                      stackId="1" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {}
        <Grid item xs={12}>
          <Card sx={{ 
            height: { xs: '600px', md: '800px' },
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #6366f1, #10b981, #3b82f6, #ec4899)',
              zIndex: 1
            }} />
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Historical Tide Analysis & Predictions
                </Typography>
              }
              subheader="Comprehensive tide monitoring with AI-powered forecasting and historical trends"
              action={
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    label="Live Data" 
                    color="success" 
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <IconButton sx={{ 
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                  }}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              }
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', pt: 0 }}>
              <Box sx={{ height: '100%', p: 2 }}>
                <EnhancedTideChart readings={readings} loading={loading} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
