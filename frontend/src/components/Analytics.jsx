import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import api from '../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedMetric]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock analytics data - in real app, this would come from API
      const mockData = generateMockAnalyticsData();
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalyticsData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString(),
        alerts: Math.floor(Math.random() * 20) + 5,
        predictions: Math.floor(Math.random() * 50) + 20,
        accuracy: Math.random() * 10 + 90,
        responseTime: Math.random() * 2 + 0.5,
        tideLevel: Math.random() * 3 + 1,
        windSpeed: Math.random() * 25 + 5,
        rainfall: Math.random() * 50
      });
    }

    return {
      timeSeries: data,
      summary: {
        totalAlerts: data.reduce((sum, d) => sum + d.alerts, 0),
        avgAccuracy: data.reduce((sum, d) => sum + d.accuracy, 0) / data.length,
        avgResponseTime: data.reduce((sum, d) => sum + d.responseTime, 0) / data.length,
        totalPredictions: data.reduce((sum, d) => sum + d.predictions, 0)
      },
      threatDistribution: [
        { name: 'Storm Surge', value: 45, color: '#ff6b35' },
        { name: 'High Tide', value: 30, color: '#00d4ff' },
        { name: 'Pollution', value: 15, color: '#4caf50' },
        { name: 'Wind Damage', value: 10, color: '#ff9800' }
      ],
      aiPerformance: [
        { metric: 'Prediction Accuracy', value: 94.2, target: 95, color: '#4caf50' },
        { metric: 'Response Time', value: 0.8, target: 1.0, color: '#2196f3' },
        { metric: 'False Positives', value: 2.1, target: 3.0, color: '#ff9800' },
        { metric: 'Coverage Area', value: 156, target: 150, color: '#9c27b0' }
      ],
      radarData: [
        { subject: 'Accuracy', A: 94, B: 90 },
        { subject: 'Speed', A: 85, B: 80 },
        { subject: 'Coverage', A: 92, B: 85 },
        { subject: 'Reliability', A: 88, B: 82 },
        { subject: 'Efficiency', A: 90, B: 85 }
      ]
    };
  };

  const getPerformanceColor = (value, target) => {
    const ratio = value / target;
    if (ratio >= 1) return theme.palette.success.main;
    if (ratio >= 0.8) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const COLORS = ['#00d4ff', '#ff6b35', '#4caf50', '#ff9800', '#9c27b0'];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          AI Analytics & Insights
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Advanced threat analysis and AI performance metrics
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="subtitle2">Time Range:</Typography>
            </Grid>
            <Grid item>
              <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={(e, newValue) => newValue && setTimeRange(newValue)}
                size="small"
              >
                <ToggleButton value="7d">7 Days</ToggleButton>
                <ToggleButton value="30d">30 Days</ToggleButton>
                <ToggleButton value="90d">90 Days</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs />
            <Grid item>
              <IconButton onClick={fetchAnalyticsData}>
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {analyticsData.summary.totalAlerts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Alerts
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +12.5%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {analyticsData.summary.avgAccuracy.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI Accuracy
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +2.1%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    {analyticsData.summary.avgResponseTime.toFixed(1)}s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <TrendingDownIcon color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      -15.2%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {analyticsData.summary.totalPredictions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI Predictions
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +8.7%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Time Series Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Threat Trends Over Time"
              subheader="Alert frequency and AI performance metrics"
            />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="alerts" 
                      stroke="#ff6b35" 
                      strokeWidth={3}
                      name="Alerts"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#4caf50" 
                      strokeWidth={3}
                      name="AI Accuracy (%)"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="predictions" 
                      stroke="#00d4ff" 
                      strokeWidth={3}
                      name="Predictions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Threat Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader title="Threat Distribution" />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.threatDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.threatDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="AI Performance Metrics" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.aiPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      fill={(entry) => getPerformanceColor(entry.value, entry.target)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Radar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="AI System Performance Radar" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analyticsData.radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Current" 
                      dataKey="A" 
                      stroke="#00d4ff" 
                      fill="#00d4ff" 
                      fillOpacity={0.3} 
                    />
                    <Radar 
                      name="Previous" 
                      dataKey="B" 
                      stroke="#ff6b35" 
                      fill="#ff6b35" 
                      fillOpacity={0.3} 
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Environmental Data */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Environmental Monitoring Data" />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="tideLevel" 
                      stackId="1" 
                      stroke="#00d4ff" 
                      fill="#00d4ff" 
                      fillOpacity={0.6}
                      name="Tide Level (m)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="windSpeed" 
                      stackId="1" 
                      stroke="#ff6b35" 
                      fill="#ff6b35" 
                      fillOpacity={0.6}
                      name="Wind Speed (m/s)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rainfall" 
                      stackId="1" 
                      stroke="#4caf50" 
                      fill="#4caf50" 
                      fillOpacity={0.6}
                      name="Rainfall (mm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
