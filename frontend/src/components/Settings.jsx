import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card,
  CardContent,
  CardHeader,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  useTheme
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Tune as TuneIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      highPriorityOnly: true
    },
    ai: {
      autoOptimize: true,
      predictionHorizon: 24,
      confidenceThreshold: 0.85,
      modelUpdateFrequency: 7
    },
    system: {
      autoRefresh: true,
      refreshInterval: 30,
      dataRetention: 90,
      maxStations: 50
    },
    alerts: {
      surgeThreshold: 2.5,
      stormThreshold: 15,
      pollutionThreshold: 25,
      autoAcknowledge: false
    }
  });

  const [saved, setSaved] = useState(false);
  const theme = useTheme();

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // In real app, this would save to backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    // Reset to default settings
    setSettings({
      notifications: {
        email: true,
        push: true,
        sms: false,
        highPriorityOnly: true
      },
      ai: {
        autoOptimize: true,
        predictionHorizon: 24,
        confidenceThreshold: 0.85,
        modelUpdateFrequency: 7
      },
      system: {
        autoRefresh: true,
        refreshInterval: 30,
        dataRetention: 90,
        maxStations: 50
      },
      alerts: {
        surgeThreshold: 2.5,
        stormThreshold: 15,
        pollutionThreshold: 25,
        autoAcknowledge: false
      }
    });
    setSaved(false);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          System Settings
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Configure AI models, alerts, and system preferences
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* AI Model Configuration */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title="AI Model Configuration"
              subheader="Machine learning model settings and optimization"
              avatar={<TuneIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.ai.autoOptimize}
                      onChange={(e) => handleSettingChange('ai', 'autoOptimize', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Auto-optimize AI models"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Automatically retrain and optimize models based on new data
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Prediction Horizon (hours)
                </Typography>
                <Slider
                  value={settings.ai.predictionHorizon}
                  onChange={(e, value) => handleSettingChange('ai', 'predictionHorizon', value)}
                  min={6}
                  max={72}
                  step={6}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ ml: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  How far ahead to predict threats
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Confidence Threshold
                </Typography>
                <Slider
                  value={settings.ai.confidenceThreshold}
                  onChange={(e, value) => handleSettingChange('ai', 'confidenceThreshold', value)}
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  valueLabelDisplay="auto"
                  sx={{ ml: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Minimum confidence level for AI predictions
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Model Update Frequency (days)
                </Typography>
                <TextField
                  type="number"
                  value={settings.ai.modelUpdateFrequency}
                  onChange={(e) => handleSettingChange('ai', 'modelUpdateFrequency', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 30 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alert Thresholds */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title="Alert Thresholds"
              subheader="Configure threat detection sensitivity"
              avatar={<WarningIcon color="error" />}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Storm Surge Threshold (meters)
                </Typography>
                <TextField
                  type="number"
                  value={settings.alerts.surgeThreshold}
                  onChange={(e) => handleSettingChange('alerts', 'surgeThreshold', parseFloat(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Wind Speed Threshold (m/s)
                </Typography>
                <TextField
                  type="number"
                  value={settings.alerts.stormThreshold}
                  onChange={(e) => handleSettingChange('alerts', 'stormThreshold', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 50 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pollution Threshold (NTU)
                </Typography>
                <TextField
                  type="number"
                  value={settings.alerts.pollutionThreshold}
                  onChange={(e) => handleSettingChange('alerts', 'pollutionThreshold', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.alerts.autoAcknowledge}
                      onChange={(e) => handleSettingChange('alerts', 'autoAcknowledge', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Auto-acknowledge resolved alerts"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title="Notifications"
              subheader="Configure alert notification preferences"
              avatar={<NotificationsIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Email notifications"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Push notifications"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="SMS notifications"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.highPriorityOnly}
                      onChange={(e) => handleSettingChange('notifications', 'highPriorityOnly', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="High priority alerts only"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Preferences */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title="System Preferences"
              subheader="General system configuration"
              avatar={<SettingsIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.system.autoRefresh}
                      onChange={(e) => handleSettingChange('system', 'autoRefresh', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Auto-refresh data"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Refresh Interval (seconds)
                </Typography>
                <Slider
                  value={settings.system.refreshInterval}
                  onChange={(e, value) => handleSettingChange('system', 'refreshInterval', value)}
                  min={10}
                  max={300}
                  step={10}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ ml: 1 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Data Retention (days)
                </Typography>
                <TextField
                  type="number"
                  value={settings.system.dataRetention}
                  onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 30, max: 365 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Maximum Stations
                </Typography>
                <TextField
                  type="number"
                  value={settings.system.maxStations}
                  onChange={(e) => handleSettingChange('system', 'maxStations', parseInt(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 10, max: 200 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="System Status"
              subheader="Current system health and performance"
              avatar={<CheckCircleIcon color="success" />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip 
                      label="AI Models" 
                      color="success" 
                      variant="outlined"
                      icon={<CheckCircleIcon />}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      All models operational
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip 
                      label="Database" 
                      color="success" 
                      variant="outlined"
                      icon={<StorageIcon />}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Connected and healthy
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip 
                      label="API Services" 
                      color="success" 
                      variant="outlined"
                      icon={<SpeedIcon />}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      All services running
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Chip 
                      label="Security" 
                      color="success" 
                      variant="outlined"
                      icon={<SecurityIcon />}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      All systems secure
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0099cc 0%, #006699 100%)'
                    }
                  }}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
