import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Water as WaterIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const EnhancedTideChart = ({ readings = [], loading = false }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('line');
  const [selectedStation, setSelectedStation] = useState('1');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const generateHistoricalData = (days) => {
    const data = [];
    const now = new Date();
    const baseTide = 1.5;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const hour = date.getHours();
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      
      const lunarPhase = Math.sin((dayOfYear / 29.5) * 2 * Math.PI) * 0.3;
      const tideLevel = baseTide + 
        Math.sin((hour - 6) * Math.PI / 12) * 1.2 + 
        Math.sin((hour - 18) * Math.PI / 12) * 1.2 +
        lunarPhase +
        (Math.random() - 0.5) * 0.2;
      
      const seasonalFactor = 1 + 
        Math.sin((date.getMonth() + 1) * Math.PI / 6) * 0.2 +
        Math.sin((dayOfYear / 365) * 2 * Math.PI) * 0.15;
      
      const stormProbability = Math.random();
      const weatherImpact = stormProbability > 0.95 ? (Math.random() - 0.5) * 1.0 : 
                           stormProbability > 0.9 ? (Math.random() - 0.5) * 0.5 : 0;
      
      const finalTideLevel = Math.max(0, tideLevel * seasonalFactor + weatherImpact);
      
      const windSpeed = Math.random() * 30 + 5;
      const waveHeight = Math.max(0.5, 
        finalTideLevel * 0.3 + 
        windSpeed * 0.1 + 
        Math.random() * 1.5
      );
      const currentSpeed = Math.max(0.5, 
        Math.sin((hour - 3) * Math.PI / 12) * 2 + 
        Math.random() * 1.5
      );
      
      data.push({
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timestamp: date.getTime(),
        tide: parseFloat(finalTideLevel.toFixed(2)),
        wind: parseFloat(windSpeed.toFixed(1)),
        rain: Math.random() > 0.7 ? parseFloat((Math.random() * 15).toFixed(1)) : 0,
        pressure: parseFloat((1013 + (Math.random() - 0.5) * 25).toFixed(1)),
        temperature: parseFloat((20 + Math.sin((hour - 12) * Math.PI / 12) * 10 + (Math.random() - 0.5) * 4).toFixed(1)),
        humidity: parseFloat((60 + Math.sin((hour - 6) * Math.PI / 12) * 25 + (Math.random() - 0.5) * 15).toFixed(1)),
        waveHeight: parseFloat(waveHeight.toFixed(2)),
        currentSpeed: parseFloat(currentSpeed.toFixed(2)),
        lunarPhase: parseFloat(lunarPhase.toFixed(3)),
        stormWarning: weatherImpact > 0.5
      });
    }
    
    return data;
  };

  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const days = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    setHistoricalData(generateHistoricalData(days));
  }, [timeRange]);

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const stats = historicalData.length > 0 ? {
    avgTide: (historicalData.reduce((sum, d) => sum + (d.tide || 0), 0) / historicalData.length).toFixed(2),
    maxTide: Math.max(...historicalData.map(d => d.tide || 0)).toFixed(2),
    minTide: Math.min(...historicalData.map(d => d.tide || 0)).toFixed(2),
    tideRange: (Math.max(...historicalData.map(d => d.tide || 0)) - Math.min(...historicalData.map(d => d.tide || 0))).toFixed(2),
    avgWaveHeight: (historicalData.reduce((sum, d) => sum + (d.waveHeight || 0), 0) / historicalData.length).toFixed(2),
    avgCurrentSpeed: (historicalData.reduce((sum, d) => sum + (d.currentSpeed || 0), 0) / historicalData.length).toFixed(2),
    stormWarnings: historicalData.filter(d => d.stormWarning).length,
    lunarInfluence: (historicalData.reduce((sum, d) => sum + Math.abs(d.lunarPhase || 0), 0) / historicalData.length).toFixed(3)
  } : {
    avgTide: '0.00',
    maxTide: '0.00',
    minTide: '0.00',
    tideRange: '0.00',
    avgWaveHeight: '0.00',
    avgCurrentSpeed: '0.00',
    stormWarnings: 0,
    lunarInfluence: '0.000'
  };

  const getChartData = () => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }
    
    if (timeRange === '1d') {
      return historicalData.filter((_, index) => index % 4 === 0); 
    }
    if (timeRange === '7d') {
      const dailyData = {};
      historicalData.forEach(d => {
        if (!d || !d.date) return; 
        
        const date = d.date;
        if (!dailyData[date]) {
          dailyData[date] = { date, tides: [], waves: [], currents: [] };
        }
        dailyData[date].tides.push(d.tide || 0);
        dailyData[date].waves.push(d.waveHeight || 0);
        dailyData[date].currents.push(d.currentSpeed || 0);
      });
      
      return Object.values(dailyData).map(d => ({
        date: d.date,
        tide: parseFloat((d.tides.reduce((a, b) => a + b, 0) / d.tides.length).toFixed(2)),
        waveHeight: parseFloat((d.waves.reduce((a, b) => a + b, 0) / d.waves.length).toFixed(2)),
        currentSpeed: parseFloat((d.currents.reduce((a, b) => a + b, 0) / d.currents.length).toFixed(2))
      }));
    }
    return historicalData.filter((_, index) => index % 7 === 0).map(d => ({
      date: d.date || 'Unknown',
      tide: d.tide || 0,
      waveHeight: d.waveHeight || 0,
      currentSpeed: d.currentSpeed || 0
    }));
  };

  const renderChart = () => {
    const data = getChartData();
    
    if (!data || data.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No data available for selected time range
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a different time range or wait for data to load
          </Typography>
        </Box>
      );
    }
    
    if (chartType === 'line') {
      return (
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey={timeRange === '1d' ? 'time' : 'date'} 
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
            label={{ value: 'Tide Level (m)', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
            label={{ value: 'Wave Height (m)', angle: 90, position: 'insideRight', fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="tide" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="waveHeight" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
          />
          <Scatter 
            yAxisId="right"
            dataKey="currentSpeed" 
            fill="#f59e0b" 
            r={4}
          />
        </ComposedChart>
      );
    }
    
    if (chartType === 'area') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey={timeRange === '1d' ? 'time' : 'date'} 
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
            label={{ value: 'Tide Level (m)', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <Tooltip 
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
            dataKey="waveHeight" 
            stackId="1" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.4}
          />
        </AreaChart>
      );
    }
    
    if (chartType === 'bar') {
      return (
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey={timeRange === '1d' ? 'time' : 'date'} 
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
            label={{ value: 'Tide Level (m)', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#f8fafc'
            }}
          />
          <Legend />
          <Bar dataKey="tide" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="waveHeight" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }
  };

  if (loading || !historicalData || historicalData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={60} />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Loading historical data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      {}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Time Range Selection
            </Typography>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="1d">24 Hours</ToggleButton>
              <ToggleButton value="7d">7 Days</ToggleButton>
              <ToggleButton value="30d">30 Days</ToggleButton>
              <ToggleButton value="90d">90 Days</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Chart Type
            </Typography>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="line">Line</ToggleButton>
              <ToggleButton value="area">Area</ToggleButton>
              <ToggleButton value="bar">Bar</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Box>

      {}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(99, 102, 241, 0.2)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px) translateZ(5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(99, 102, 241, 0.3)'
              }
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                backgroundSize: '200% 100%',
                animation: 'rainbowFlow 3s ease-in-out infinite'
              }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                {stats.avgTide}m
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569' }}>
                Avg Tide
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(239, 68, 68, 0.2)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px) translateZ(5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(239, 68, 68, 0.3)'
              }
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #ef4444, #f87171)',
                backgroundSize: '200% 100%',
                animation: 'rainbowFlow 3s ease-in-out infinite'
              }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444' }}>
                {stats.maxTide}m
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569' }}>
                Max Tide
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.minTide}m
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Min Tide
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                {stats.tideRange}m
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tide Range
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.avgWaveHeight}m
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Wave
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {stats.avgCurrentSpeed}m/s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Current
              </Typography>
            </Paper>
          </Grid>
          
          {}
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                {stats.stormWarnings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Storm Warnings
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                {stats.lunarInfluence}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lunar Influence
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {}
      <Box sx={{ height: 'calc(100% - 200px)', minHeight: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>

      {}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
          Historical Trend Analysis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Trend Direction
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                Rising
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tide levels increasing over time
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <AnalyticsIcon color="info" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Seasonal Pattern
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                Normal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Following expected seasonal cycles
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <ScheduleIcon color="warning" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Next High Tide
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Predicted high tide time
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          <WaterIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
          Tide Level • Wave Height • Current Speed • Historical Trends
        </Typography>
      </Box>
    </Box>
  );
};

export default EnhancedTideChart;

