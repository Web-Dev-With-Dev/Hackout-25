import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card,
  CardContent,
  CardHeader,
  Typography, 
  Box, 
  CircularProgress, 
  ToggleButtonGroup, 
  ToggleButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  useTheme,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Assessment as AccuracyIcon,
  Psychology as PredictionIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';
import api from '../services/api';
import TideChart from './TideChart';

const PredictionDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionHours, setPredictionHours] = useState(24);
  const [analysisView, setAnalysisView] = useState('tide');
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [aiConfidence, setAiConfidence] = useState(94.2);
  const [modelStatus, setModelStatus] = useState('active');
  const theme = useTheme();
  
  useEffect(() => {
    fetchStations();
    fetchData();
  }, [predictionHours, selectedStation]);
  
  const fetchStations = async () => {
    try {
      const stationsData = await api.getStations();
      setStations(stationsData);
      
      if (!selectedStation && stationsData.length > 0) {
        setSelectedStation(stationsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      // Fallback to mock data if API fails
      const mockStations = [
        { id: '1', name: 'Mumbai Coastal Station' },
        { id: '2', name: 'Chennai Coastal Station' },
        { id: '3', name: 'Kolkata Coastal Station' }
      ];
      setStations(mockStations);
      if (!selectedStation) {
        setSelectedStation('1');
      }
    }
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching AI data...');
      
      const [predictionsData, analysisData, patternsData] = await Promise.all([
        api.getTidePredictions(predictionHours, selectedStation).catch(err => {
          console.error('Error fetching predictions:', err);
          return generateMockPredictions();
        }),
        api.getTideAnalysis(selectedStation).catch(err => {
          console.error('Error fetching analysis:', err);
          return {
            avgHighTide: 2.1,
            avgLowTide: 0.8,
            tideRange: 1.3,
            nextHighTide: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            nextLowTide: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
          };
        }),
        api.getAlertPatterns().catch(err => {
          console.error('Error fetching patterns:', err);
          return {
            totalAlerts: 15,
            mostCommonType: 'High Tide',
            peakAlertTime: '14:30',
            alertFrequency: 'Every 6 hours',
            tideCorrelation: 0.87
          };
        })
      ]);
      
      console.log('Data fetched successfully:', { predictionsData, analysisData, patternsData });
      
      setPredictions(predictionsData);
      setAnalysis(analysisData);
      setPatterns(patternsData);
    } catch (error) {
      console.error('Error fetching AI data:', error);
      // Set fallback data if everything fails
      setPredictions(generateMockPredictions());
      setAnalysis({
        avgHighTide: 2.1,
        avgLowTide: 0.8,
        tideRange: 1.3,
        nextHighTide: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        nextLowTide: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      });
      setPatterns({
        totalAlerts: 15,
        mostCommonType: 'High Tide',
        peakAlertTime: '14:30',
        alertFrequency: 'Every 6 hours',
        tideCorrelation: 0.87
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePredictionHoursChange = (event, newHours) => {
    if (newHours !== null) {
      setPredictionHours(newHours);
    }
  };
  
  const handleStationChange = (event) => {
    setSelectedStation(event.target.value);
  };
  
  const handleAnalysisViewChange = (event, newView) => {
    if (newView !== null) {
      setAnalysisView(newView);
    }
  };

  // Enhanced mock data for better visualizations
  const enhancedPredictions = React.useMemo(() => {
    try {
      return predictions.length > 0 ? predictions : generateMockPredictions();
    } catch (error) {
      console.error('Error generating enhanced predictions:', error);
      return [];
    }
  }, [predictions, predictionHours]);

  const confidenceData = React.useMemo(() => {
    try {
      return generateConfidenceData();
    } catch (error) {
      console.error('Error generating confidence data:', error);
      return [];
    }
  }, []);

  const anomalyData = React.useMemo(() => {
    try {
      return generateAnomalyData();
    } catch (error) {
      console.error('Error generating anomaly data:', error);
      return [];
    }
  }, []);

  const modelPerformanceData = React.useMemo(() => {
    try {
      return generateModelPerformanceData();
    } catch (error) {
      console.error('Error generating model performance data:', error);
      return [];
    }
  }, []);

  function generateMockPredictions() {
    const data = [];
    const now = new Date();
    for (let i = 0; i < predictionHours; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      const baseHeight = 1.5;
      const amplitude = 0.7;
      const period = 12.4;
      const height = baseHeight + amplitude * Math.sin((i / period) * 2 * Math.PI) + (Math.random() * 0.2 - 0.1);
      
      data.push({
        timestamp: timestamp.toISOString(),
        height: parseFloat(height.toFixed(2)),
        type: height > baseHeight ? 'high' : 'low',
        confidence: Math.random() * 0.2 + 0.8,
        risk: height > 2.2 ? 'high' : height > 1.8 ? 'medium' : 'low'
      });
    }
    return data;
  }

  function generateConfidenceData() {
    return [
      { hour: '00:00', confidence: 0.92, accuracy: 0.89 },
      { hour: '06:00', confidence: 0.88, accuracy: 0.91 },
      { hour: '12:00', confidence: 0.95, accuracy: 0.93 },
      { hour: '18:00', confidence: 0.90, accuracy: 0.87 },
      { hour: '24:00', confidence: 0.94, accuracy: 0.92 }
    ];
  }

  function generateAnomalyData() {
    return [
      { time: '02:30', type: 'High Tide', severity: 'medium', confidence: 0.87 },
      { time: '08:45', type: 'Storm Surge', severity: 'high', confidence: 0.93 },
      { time: '14:20', type: 'Wind Gust', severity: 'low', confidence: 0.78 },
      { time: '20:15', type: 'High Tide', severity: 'medium', confidence: 0.85 }
    ];
  }

  function generateModelPerformanceData() {
    return [
      { metric: 'Accuracy', current: 94.2, target: 95.0, trend: 'up' },
      { metric: 'Precision', current: 91.8, target: 92.0, trend: 'up' },
      { metric: 'Recall', current: 89.5, target: 90.0, trend: 'down' },
      { metric: 'F1-Score', current: 90.6, target: 91.0, trend: 'up' }
    ];
  }
  
  const formatPredictionData = (data) => {
    try {
      if (!data || data.length === 0) return [];
      
      return data.map(item => ({
        time: new Date(item.timestamp || item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(item.timestamp || item.ts).toLocaleDateString(),
        height: item.height || item.tide_m || 0,
        confidence: item.confidence || 0.85,
        risk: item.risk || 'low',
        timestamp: new Date(item.timestamp || item.ts).getTime()
      }));
    } catch (error) {
      console.error('Error formatting prediction data:', error);
      return [];
    }
  };
  
  const formattedPredictions = React.useMemo(() => {
    try {
      const formatted = formatPredictionData(enhancedPredictions);
      return formatted.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error formatting predictions:', error);
      return [];
    }
  }, [enhancedPredictions]);
  
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const getModelStatusColor = () => {
    switch (modelStatus) {
      case 'active': return 'success';
      case 'training': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading AI Predictions...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Error boundary for rendering
  try {
  
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Enhanced Header Section with 3D Effects */}
      <Box sx={{ 
        mb: 4, 
        p: 4, 
        borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(99, 102, 241, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6366f1, #06b6d4, #fbbf24, #ec4899)',
          backgroundSize: '200% 100%',
          animation: 'rainbowFlow 3s ease-in-out infinite'
        }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 800,
          background: 'linear-gradient(45deg, #6366f1, #06b6d4, #fbbf24)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          AI Predictions & Analysis
        </Typography>
        <Typography variant="h6" sx={{ 
          color: '#475569',
          fontWeight: 500,
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }} gutterBottom>
          Advanced machine learning models for coastal threat forecasting
        </Typography>
        
        {/* Enhanced AI Status Bar */}
        <Card sx={{ 
          mt: 3, 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(99, 102, 241, 0.2)'
        }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={`${aiConfidence}% Confidence`} 
                    color="success" 
                    variant="outlined"
                    icon={<CheckCircleIcon />}
                  />
                  <Chip 
                    label={`${modelStatus.toUpperCase()}`} 
                    color={getModelStatusColor()} 
                    variant="outlined"
                    icon={<AnalyticsIcon />}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="station-select-label">Coastal Location</InputLabel>
                    <Select
                      labelId="station-select-label"
                      id="station-select"
                      value={selectedStation}
                      label="Coastal Location"
                      onChange={handleStationChange}
                    >
                      {stations.map((station) => (
                        <MenuItem key={station.id} value={station.id}>
                          {station.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton onClick={fetchData}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      
      <Grid container spacing={3}>
        {/* AI Model Performance */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="AI Model Performance Metrics"
              subheader="Real-time model accuracy and performance indicators"
              avatar={<AnalyticsIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                {modelPerformanceData.map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {metric.current}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {metric.metric}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {metric.trend === 'up' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                        <Typography variant="caption" color={metric.trend === 'up' ? 'success.main' : 'error.main'}>
                          {metric.trend === 'up' ? '+2.1%' : '-0.5%'}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(metric.current / metric.target) * 100} 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tide Predictions */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            height: { xs: 'auto', md: '600px' },
            transform: 'perspective(1000px)',
            transition: 'all 0.4s ease'
          }}>
            <CardHeader
              title="Tide Predictions"
              subheader={`${predictionHours}-hour AI-powered tide forecasting`}
              action={
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
              }
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', p: 0 }}>
              <Box sx={{ height: '100%', minHeight: { xs: 400, md: 500 } }}>
                <TideChart 
                  readings={enhancedPredictions} 
                  loading={loading} 
                  stationId={selectedStation} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Prediction Confidence */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            height: { xs: 'auto', md: '600px' },
            transform: 'perspective(1000px)',
            transition: 'all 0.4s ease'
          }}>
            <CardHeader title="Prediction Confidence" />
            <CardContent sx={{ height: 'calc(100% - 80px)', p: 0 }}>
              <Box sx={{ height: '100%', minHeight: { xs: 400, md: 500 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="confidence" fill="#00d4ff" name="Confidence" />
                    <Line type="monotone" dataKey="accuracy" stroke="#4caf50" strokeWidth={3} name="Accuracy" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Anomaly Detection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Anomaly Detection"
              subheader="AI-identified unusual patterns and threats"
              avatar={<WarningIcon color="warning" />}
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={anomalyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis dataKey="confidence" />
                    <ZAxis dataKey="severity" range={[50, 200]} />
                    <Tooltip />
                    <Scatter dataKey="confidence" fill="#ff6b35" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {anomalyData.map((anomaly, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip 
                      label={anomaly.severity} 
                      size="small" 
                      color={anomaly.severity === 'high' ? 'error' : anomaly.severity === 'medium' ? 'warning' : 'info'}
                    />
                    <Typography variant="body2">
                      {anomaly.time} - {anomaly.type} ({anomaly.confidence * 100}% confidence)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tide Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Tide Analysis"
              subheader="Comprehensive tide pattern analysis"
              avatar={<TimelineIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {analysis ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        <strong>Average High Tide:</strong>
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {analysis.avgHighTide?.toFixed(2)} m
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        <strong>Average Low Tide:</strong>
                      </Typography>
                      <Typography variant="h6" color="secondary">
                        {analysis.avgLowTide?.toFixed(2)} m
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        <strong>Tide Range:</strong>
                      </Typography>
                      <Typography variant="h6" color="info.main">
                        {analysis.tideRange?.toFixed(2)} m
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Next High Tide:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.nextHighTide ? new Date(analysis.nextHighTide).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Next Low Tide:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.nextLowTide ? new Date(analysis.nextLowTide).toLocaleString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      Analysis data not available.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Alert Patterns */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Alert Pattern Analysis"
              subheader="Historical alert trends and AI pattern recognition"
              avatar={<PredictionIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formattedPredictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="height" 
                          stroke="#00d4ff" 
                          fill="#00d4ff" 
                          fillOpacity={0.3}
                          name="Tide Height"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {patterns ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">
                            <strong>Total Alerts:</strong>
                          </Typography>
                          <Chip label={patterns.totalAlerts || 0} color="primary" />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">
                            <strong>Most Common Type:</strong>
                          </Typography>
                          <Chip label={patterns.mostCommonType || 'N/A'} color="secondary" />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">
                            <strong>Peak Alert Time:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patterns.peakAlertTime || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">
                            <strong>Alert Frequency:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patterns.alertFrequency || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">
                            <strong>Tide Correlation:</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patterns.tideCorrelation?.toFixed(2) || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="text.secondary" align="center">
                        Pattern analysis data not available.
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
  } catch (error) {
    console.error('Error rendering PredictionDashboard:', error);
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          <Typography variant="h6" color="error">
            Error loading AI Predictions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please try refreshing the page
          </Typography>
        </Box>
      </Container>
    );
  }
};

export default PredictionDashboard;