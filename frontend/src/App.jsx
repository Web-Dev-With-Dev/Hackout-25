import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CssBaseline, 
  IconButton,
  Chip,
  Avatar,
  Badge,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Warning as WarningIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Water as WaterIcon,
  Cloud as CloudIcon,
  NotificationsActive as NotificationsActiveIcon,
  Badge as BadgeIcon
} from '@mui/icons-material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import './App.css'


import Dashboard from './components/Dashboard'
import PredictionDashboard from './components/PredictionDashboard'
import ThreatMap from './components/ThreatMap'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import MobileAlerts from './components/MobileAlerts'


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', 
      light: '#818cf8',
      dark: '#4f46e5'
    },
    secondary: {
      main: '#06b6d4', 
      light: '#22d3ee',
      dark: '#0891b2'
    },
    background: {
      default: '#f8fafc', 
      paper: '#ffffff' 
    },
    surface: {
      main: '#f1f5f9', 
      light: '#e2e8f0', 
      dark: '#cbd5e1' 
    },
    text: {
      primary: '#0f172a', 
      secondary: '#475569' 
    },
    warning: {
      main: '#f59e0b', 
      light: '#fbbf24',
      dark: '#d97706'
    },
    error: {
      main: '#ef4444', 
      light: '#f87171',
      dark: '#dc2626'
    },
    success: {
      main: '#10b981', 
      light: '#34d399',
      dark: '#059669'
    },
    info: {
      main: '#3b82f6', 
      light: '#60a5fa',
      dark: '#2563eb'
    },
    accent: {
      gold: '#fbbf24',
      pink: '#ec4899',
      orange: '#fb923c',
      teal: '#14b8a6'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      letterSpacing: '-0.025em'
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.025em'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.875rem',
      letterSpacing: '-0.025em'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.025em'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.025em'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: '-0.025em'
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      letterSpacing: '-0.025em'
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '-0.025em'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(30px)',
          borderBottom: '2px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 8px 64px rgba(99, 102, 241, 0.2), 0 4px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #6366f1, #06b6d4, #fbbf24, #ec4899)',
            animation: 'rainbowFlow 3s ease-in-out infinite'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.2)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(99, 102, 241, 0.2)',
          borderRadius: 16,
          color: '#0f172a'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.2)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(99, 102, 241, 0.2)',
          borderRadius: 20,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#0f172a',
          position: 'relative',
          overflow: 'hidden'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#0f172a',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)'
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#0f172a'
        },
        h1: {
          color: '#0f172a',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        h2: {
          color: '#0f172a',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        h3: {
          color: '#0f172a',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        h4: {
          color: '#0f172a',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        h5: {
          color: '#0f172a',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        h6: {
          color: '#0f172a',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        body1: {
          color: '#475569'
        },
        body2: {
          color: '#64748b'
        },
        subtitle1: {
          color: '#334155'
        },
        subtitle2: {
          color: '#475569'
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          background: 'transparent'
        }
      }
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          background: 'transparent'
        }
      }
    },
    MuiBox: {
      styleOverrides: {
        root: {
          background: 'transparent'
        }
      }
    }
  }
})

function Navigation({ drawerOpen, toggleDrawer, menuItems }) {
  const location = useLocation()
  
  return (
    <Drawer
      variant="temporary"
      open={drawerOpen}
      onClose={toggleDrawer}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0a1929 0%, #132f4c 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        },
      }}
    >
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main',
            width: 40,
            height: 40
          }}>
            <WaterIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Coastle Elite
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              onClick={toggleDrawer}
              sx={{
                mx: 1,
                mb: 1,
                borderRadius: 2,
                backgroundColor: location.pathname === item.path ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                border: location.pathname === item.path ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.05)',
                  border: '1px solid rgba(0, 212, 255, 0.2)'
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary'
                  }
                }}
              />
              {item.badge && (
                <Badge badgeContent={item.badge} color="error" sx={{ ml: 1 }} />
              )}
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            SYSTEM STATUS
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="AI Active" 
              size="small" 
              color="success" 
              variant="outlined"
              icon={<AnalyticsIcon />}
            />
            <Chip 
              label="Real-time" 
              size="small" 
              color="primary" 
              variant="outlined"
              icon={<TimelineIcon />}
            />
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(3) 
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'High tide alert for Mumbai coast',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      type: 'error',
      message: 'Storm surge detected in Chennai',
      time: '5 min ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      message: 'New AI prediction model deployed',
      time: '10 min ago',
      read: true
    }
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/' 
    },
    { 
      text: 'AI Predictions', 
      icon: <TimelineIcon />, 
      path: '/predictions',
      badge: 'NEW'
    },
    { 
      text: 'Threat Map', 
      icon: <MapIcon />, 
      path: '/map' 
    },
    { 
      text: 'Analytics', 
      icon: <AnalyticsIcon />, 
      path: '/analytics' 
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings' 
    }
  ]

  return (
    <ThemeProvider theme={theme}>
      <Router>
                  <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh', 
            background: 'radial-gradient(ellipse at center, #f8fafc 0%, #f1f5f9 70%, #e2e8f0 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)
              `,
              pointerEvents: 'none'
            }
          }}>
            <CssBaseline />
            
            {/* Enhanced 3D App Bar */}
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>

            <Toolbar sx={{ minHeight: '80px', py: 1 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer}
                sx={{ 
                  mr: 3,
                  p: 1.5,
                  borderRadius: 3,
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                  }
                }}
              >
                <MenuIcon sx={{ fontSize: 28 }} />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1 }}>
                <Box sx={{ 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Avatar sx={{ 
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(360deg) scale(1.1)',
                      boxShadow: '0 12px 48px rgba(139, 92, 246, 0.6)'
                    }
                  }}>
                    <WaterIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" noWrap component="div" sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(45deg, #8b5cf6, #06b6d4, #fbbf24)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      Coastle Elite
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      letterSpacing: '0.1em'
                    }}>
                      ADVANCED THREAT DETECTION SYSTEM
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label="AI POWERED" 
                    size="small" 
                    sx={{ 
                      background: 'linear-gradient(45deg, #06b6d4, #14b8a6)',
                      color: 'white',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)'
                    }}
                  />
                  <Chip 
                    label="v2.0" 
                    size="small" 
                    sx={{ 
                      background: 'linear-gradient(45deg, #fbbf24, #fb923c)',
                      color: 'white',
                      fontWeight: 700,
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      boxShadow: '0 4px 16px rgba(251, 191, 36, 0.3)'
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleNotifications}
                  sx={{ 
                    position: 'relative',
                    p: 1.5,
                    borderRadius: 3,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)'
                    }
                  }}
                >
                  <Badge 
                    badgeContent={notifications.filter(n => !n.read).length} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(45deg, #ef4444, #f87171)',
                        border: '2px solid white',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }
                    }}
                  >
                    <NotificationsActiveIcon sx={{ fontSize: 28 }} />
                  </Badge>
                </IconButton>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      width: isMobile ? '90vw' : 400,
                      maxHeight: 500,
                      bgcolor: 'background.paper',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 1000,
                      mt: 1,
                      overflow: 'hidden',
                      animation: 'slideDown 0.3s ease-out'
                    }}
                  >
                    <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Notifications ({notifications.filter(n => !n.read).length} unread)
                      </Typography>
                    </Box>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <Box
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            sx={{
                              p: 2,
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              bgcolor: notification.read ? 'transparent' : 'rgba(0, 212, 255, 0.05)',
                              '&:hover': {
                                bgcolor: 'rgba(0, 212, 255, 0.1)',
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: notification.type === 'error' ? 'error.main' : 
                                          notification.type === 'warning' ? 'warning.main' : 'info.main',
                                  mt: 1,
                                  flexShrink: 0
                                }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {notification.time}
                                </Typography>
                              </Box>
                              {!notification.read && (
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    flexShrink: 0,
                                    mt: 1
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No notifications
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Toolbar>
          </AppBar>
          
          {/* Navigation Drawer */}
          <Navigation 
            drawerOpen={drawerOpen} 
            toggleDrawer={toggleDrawer} 
            menuItems={menuItems}
          />
          
          {/* Main Content with 3D Background */}
          <Box component="main" sx={{ 
            flexGrow: 1, 
            p: 3, 
            pt: 12,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 10% 90%, rgba(139, 92, 246, 0.03) 0%, transparent 40%),
                radial-gradient(circle at 90% 10%, rgba(6, 182, 212, 0.03) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.02) 0%, transparent 40%)
              `,
              pointerEvents: 'none',
              zIndex: -1
            }
          }}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/predictions" element={<PredictionDashboard />} />
                <Route path="/map" element={<ThreatMap />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                {/* Fallback route */}
                <Route path="*" element={<Typography color="error">Page not found or component error.</Typography>} />
              </Routes>
            </ErrorBoundary>
          </Box>
        </Box>
        
        {/* Mobile Alerts */}
        <MobileAlerts alerts={[
          {
            id: 1,
            type: 'high_tide',
            severity: 'high',
            message: 'High tide alert for Mumbai coast - Immediate action required',
            timestamp: new Date().toISOString()
          },
          {
            id: 2,
            type: 'storm_surge',
            severity: 'medium',
            message: 'Storm surge detected in Chennai - Monitor closely',
            timestamp: new Date(Date.now() - 300000).toISOString()
          }
        ]} />
      </Router>
    </ThemeProvider>
  )
}

export default App
