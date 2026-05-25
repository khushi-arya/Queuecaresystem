import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Container,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import NotificationCenter from '@components/NotificationCenter';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

/**
 * MainLayout Component
 * Shared layout for authenticated pages
 * Features:
 * - AppBar with logo, title, NotificationCenter, user menu
 * - Sidebar with role-based navigation (collapsible on mobile)
 * - Main content area with responsive grid
 * - Footer (optional)
 *
 * @example
 * <MainLayout>
 *   <Dashboard />
 * </MainLayout>
 */
export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        label: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
        roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
      },
      {
        label: 'Profile',
        icon: <PersonIcon />,
        path: '/profile',
        roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
      },
      {
        label: 'Appointments',
        icon: <CalendarTodayIcon />,
        path: '/appointments',
        roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
      },
    ];

    const roleSpecificItems: NavItem[] = [];

    if (user?.role === 'PATIENT') {
      roleSpecificItems.push({
        label: 'My Doctors',
        icon: <LocalHospitalIcon />,
        path: '/doctors',
        roles: ['PATIENT'],
      });
    }

    if (user?.role === 'DOCTOR') {
      roleSpecificItems.push({
        label: 'My Patients',
        icon: <PeopleIcon />,
        path: '/patients',
        roles: ['DOCTOR'],
      });
      roleSpecificItems.push({
        label: 'Consultations',
        icon: <LocalHospitalIcon />,
        path: '/consultations',
        roles: ['DOCTOR'],
      });
    }

    if (user?.role === 'ADMIN') {
      roleSpecificItems.push({
        label: 'Users',
        icon: <PeopleIcon />,
        path: '/admin/users',
        roles: ['ADMIN'],
      });
      roleSpecificItems.push({
        label: 'Analytics',
        icon: <ListAltIcon />,
        path: '/admin/analytics',
        roles: ['ADMIN'],
      });
    }

    const navItems = [...baseItems, ...roleSpecificItems];

    if (user?.role === 'ADMIN') {
      return navItems.filter(
        (item) => item.label !== 'Profile' && item.label !== 'Appointments'
      );
    }

    return navItems;
  };

  const navItems = getNavItems();

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Sidebar content
  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eee',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          QueueCare
        </Typography>
        {isMobile && (
          <IconButton size="small" onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: '8px',
                mx: 1,
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  borderLeft: '3px solid #2563eb',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Settings and Profile */}
      <List>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleNavigation('/settings/notifications')}
            sx={{
              borderRadius: '8px',
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleNavigation('/settings')}
            sx={{
              borderRadius: '8px',
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      {isTablet ? (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              borderRight: '1px solid #e5e7eb',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Paper
          sx={{
            width: DRAWER_WIDTH,
            backgroundColor: '#fff',
            borderRight: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          {sidebarContent}
        </Paper>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* AppBar */}
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: '#fff',
            color: '#111',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            borderBottom: '1px solid #e5e7eb',
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar>
            {isTablet && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleSidebarToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Left side: Title */}
            <Typography
              variant="h6"
              sx={{
                flex: 1,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              QueueCare System
            </Typography>

            {/* Right side: Notification and User Menu */}
            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Notification Center */}
              <NotificationCenter />

              {/* User Menu */}
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ ml: 1 }}
              >
                <Badge
                  badgeContent={user?.role === 'ADMIN' ? '' : ''}
                  color="primary"
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: 'primary.main',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {user?.firstName?.charAt(0) ?? ''}
                    {user?.lastName?.charAt(0) ?? ''}
                  </Avatar>
                </Badge>
              </IconButton>
            </Stack>

            {/* User Menu Popover */}
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={userMenuOpen}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'inline-block',
                      mt: 0.5,
                      px: 1,
                      py: 0.25,
                      backgroundColor: 'primary.light',
                      color: '#fff',
                      borderRadius: 1,
                      width: 'fit-content',
                    }}
                  >
                    {user?.role}
                  </Typography>
                </Stack>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleUserMenuClose(); handleNavigation('/profile'); }}>
                <PersonIcon sx={{ mr: 1 }} />
                My Profile
              </MenuItem>
              <MenuItem onClick={() => { handleUserMenuClose(); handleNavigation('/settings'); }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Container maxWidth="xl">
            {children}
          </Container>
        </Box>

        {/* Footer */}
        <Paper
          component="footer"
          sx={{
            mt: 'auto',
            py: 2,
            px: 3,
            backgroundColor: '#f3f4f6',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} QueueCare System. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Version 1.0.0 | Built with React & Material-UI
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default MainLayout;
