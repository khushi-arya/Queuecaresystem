import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
  Menu as MenuIcon,
  Dashboard,
  Person,
  LocalHospital,
  Assessment,
  Notifications,
} from '@mui/icons-material';
import useAuth from '@hooks/useAuth';
import type { UserRole } from '../types/api';

/**
 * Navigation Component
 *
 * Provides app-wide navigation with:
 * - Role-based menu items
 * - User profile dropdown
 * - Responsive design
 */
export const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /**
   * Define navigation menu items based on role
   */
  const getMenuItems = (role: UserRole) => {
    const baseItems = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: Dashboard,
      },
    ];

    const roleSpecificItems: { [key in UserRole]: any[] } = {
      PATIENT: [
        {
          label: 'My Appointments',
          path: '/appointments',
          icon: LocalHospital,
        },
        {
          label: 'Find Doctors',
          path: '/doctors',
          icon: Person,
        },
        {
          label: 'Medical Records',
          path: '/medical-records',
          icon: Assessment,
        },
      ],
      DOCTOR: [
        {
          label: 'Appointments',
          path: '/doctor/appointments',
          icon: LocalHospital,
        },
        {
          label: 'Queue Management',
          path: '/doctor/queue',
          icon: Dashboard,
        },
        {
          label: 'Patients',
          path: '/doctor/patients',
          icon: Person,
        },
        {
          label: 'Reports',
          path: '/doctor/reports',
          icon: Assessment,
        },
      ],
      ADMIN: [
        {
          label: 'Users',
          path: '/admin/users',
          icon: Person,
        },
        {
          label: 'Analytics',
          path: '/admin/analytics',
          icon: Assessment,
        },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[role] || [])];
  };

  /**
   * Get user initials for avatar
   */
  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  /**
   * Handle profile menu open
   */
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  /**
   * Handle profile menu close
   */
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    handleCloseUserMenu();
  };

  /**
   * Navigate to path
   */
  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
    handleCloseUserMenu();
  };

  /**
   * If not authenticated, don't show navigation
   */
  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = getMenuItems(user.role);

  return (
    <>
      {/* App Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* App Logo/Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/dashboard')}
          >
            QueueCare
          </Typography>

          {/* Desktop Navigation Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, mr: 3 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    borderBottom:
                      location.pathname === item.path
                        ? '3px solid white'
                        : 'none',
                    pb: 0.5,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Notifications Icon */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Notifications />
          </IconButton>

          {/* User Profile Menu */}
          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar sx={{ width: 36, height: 36, backgroundColor: 'secondary.main' }}>
                {getInitials()}
              </Avatar>
            </IconButton>

            {/* Profile Dropdown Menu */}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* User Info */}
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user.email}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {user.role}
                  </Typography>
                </Box>
              </MenuItem>

              <Divider />

              {/* Profile Option (hidden for ADMIN) */}
              {user.role !== 'ADMIN' && (
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Profile</ListItemText>
                </MenuItem>
              )}

              {/* Settings Option */}
              <MenuItem onClick={() => handleNavigation('/settings')}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>

              <Divider />

              {/* Logout Option */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          {/* User Info in Drawer */}
          <Box sx={{ px: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ width: 40, height: 40, backgroundColor: 'primary.main', mr: 1 }}>
                {getInitials()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user.role}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Navigation Items */}
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* Profile and Settings */}
          <List>
            {user.role !== 'ADMIN' && (
              <ListItem
                button
                onClick={() => handleNavigation('/profile')}
              >
                <ListItemIcon>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText>My Profile</ListItemText>
              </ListItem>
            )}

            <ListItem
              button
              onClick={() => handleNavigation('/settings')}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </ListItem>

            <ListItem
              button
              onClick={handleLogout}
            >
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;
