import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Container, Divider, Avatar, Menu, MenuItem, Badge, useMediaQuery, useTheme, Paper, Stack, } from '@mui/material';
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
export const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);
    const userMenuOpen = Boolean(anchorEl);
    // Navigation items based on user role
    const getNavItems = () => {
        const baseItems = [
            {
                label: 'Dashboard',
                icon: _jsx(DashboardIcon, {}),
                path: '/dashboard',
                roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
            },
            {
                label: 'Profile',
                icon: _jsx(PersonIcon, {}),
                path: '/profile',
                roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
            },
            {
                label: 'Appointments',
                icon: _jsx(CalendarTodayIcon, {}),
                path: '/appointments',
                roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
            },
        ];
        const roleSpecificItems = [];
        if (user?.role === 'PATIENT') {
            roleSpecificItems.push({
                label: 'My Doctors',
                icon: _jsx(LocalHospitalIcon, {}),
                path: '/doctors',
                roles: ['PATIENT'],
            });
        }
        if (user?.role === 'DOCTOR') {
            roleSpecificItems.push({
                label: 'My Patients',
                icon: _jsx(PeopleIcon, {}),
                path: '/patients',
                roles: ['DOCTOR'],
            });
            roleSpecificItems.push({
                label: 'Consultations',
                icon: _jsx(LocalHospitalIcon, {}),
                path: '/consultations',
                roles: ['DOCTOR'],
            });
        }
        if (user?.role === 'ADMIN') {
            roleSpecificItems.push({
                label: 'Users',
                icon: _jsx(PeopleIcon, {}),
                path: '/admin/users',
                roles: ['ADMIN'],
            });
            roleSpecificItems.push({
                label: 'Analytics',
                icon: _jsx(ListAltIcon, {}),
                path: '/admin/analytics',
                roles: ['ADMIN'],
            });
        }
        const navItems = [...baseItems, ...roleSpecificItems];
        if (user?.role === 'ADMIN') {
            return navItems.filter((item) => item.label !== 'Profile' && item.label !== 'Appointments');
        }
        return navItems;
    };
    const navItems = getNavItems();
    // Handle sidebar toggle
    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };
    // Handle user menu
    const handleUserMenuOpen = (event) => {
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
    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setSidebarOpen(false);
        }
    };
    // Sidebar content
    const sidebarContent = (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', height: '100%' }, children: [_jsxs(Box, { sx: {
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #eee',
                }, children: [_jsx(Typography, { variant: "h6", sx: {
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }, children: "QueueCare" }), isMobile && (_jsx(IconButton, { size: "small", onClick: () => setSidebarOpen(false), children: _jsx(CloseIcon, {}) }))] }), _jsx(List, { sx: { flex: 1, overflow: 'auto', pt: 1 }, children: navItems.map((item) => (_jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: _jsxs(ListItemButton, { onClick: () => handleNavigation(item.path), sx: {
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
                        }, children: [_jsx(ListItemIcon, { sx: { minWidth: 40 }, children: item.icon }), _jsx(ListItemText, { primary: item.label })] }) }, item.path))) }), _jsx(Divider, {}), _jsxs(List, { children: [_jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: _jsxs(ListItemButton, { onClick: () => handleNavigation('/settings/notifications'), sx: {
                                borderRadius: '8px',
                                mx: 1,
                                '&:hover': {
                                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                                },
                            }, children: [_jsx(ListItemIcon, { sx: { minWidth: 40 }, children: _jsx(NotificationsIcon, {}) }), _jsx(ListItemText, { primary: "Notifications" })] }) }), _jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: _jsxs(ListItemButton, { onClick: () => handleNavigation('/settings'), sx: {
                                borderRadius: '8px',
                                mx: 1,
                                '&:hover': {
                                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                                },
                            }, children: [_jsx(ListItemIcon, { sx: { minWidth: 40 }, children: _jsx(SettingsIcon, {}) }), _jsx(ListItemText, { primary: "Settings" })] }) })] })] }));
    return (_jsxs(Box, { sx: { display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }, children: [isTablet ? (_jsx(Drawer, { anchor: "left", open: sidebarOpen, onClose: () => setSidebarOpen(false), sx: {
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        backgroundColor: '#fff',
                        borderRight: '1px solid #e5e7eb',
                    },
                }, children: sidebarContent })) : (_jsx(Paper, { sx: {
                    width: DRAWER_WIDTH,
                    backgroundColor: '#fff',
                    borderRight: '1px solid #e5e7eb',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                }, children: sidebarContent })), _jsxs(Box, { sx: { flex: 1, display: 'flex', flexDirection: 'column' }, children: [_jsx(AppBar, { position: "sticky", sx: {
                            backgroundColor: '#fff',
                            color: '#111',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            borderBottom: '1px solid #e5e7eb',
                            zIndex: (theme) => theme.zIndex.drawer - 1,
                        }, children: _jsxs(Toolbar, { children: [isTablet && (_jsx(IconButton, { edge: "start", color: "inherit", onClick: handleSidebarToggle, sx: { mr: 2 }, children: _jsx(MenuIcon, {}) })), _jsx(Typography, { variant: "h6", sx: {
                                        flex: 1,
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }, children: "QueueCare System" }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(NotificationCenter, {}), _jsx(IconButton, { onClick: handleUserMenuOpen, sx: { ml: 1 }, children: _jsx(Badge, { badgeContent: user?.role === 'ADMIN' ? '' : '', color: "primary", children: _jsxs(Avatar, { sx: {
                                                        width: 36,
                                                        height: 36,
                                                        backgroundColor: 'primary.main',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600,
                                                    }, children: [user?.firstName?.charAt(0) ?? '', user?.lastName?.charAt(0) ?? ''] }) }) })] }), _jsxs(Menu, { id: "user-menu", anchorEl: anchorEl, open: userMenuOpen, onClose: handleUserMenuClose, anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }, transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }, children: [_jsx(MenuItem, { disabled: true, children: _jsxs(Stack, { spacing: 0.5, children: [_jsxs(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: [user?.firstName, " ", user?.lastName] }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: user?.email }), _jsx(Typography, { variant: "caption", sx: {
                                                            display: 'inline-block',
                                                            mt: 0.5,
                                                            px: 1,
                                                            py: 0.25,
                                                            backgroundColor: 'primary.light',
                                                            color: '#fff',
                                                            borderRadius: 1,
                                                            width: 'fit-content',
                                                        }, children: user?.role })] }) }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => { handleUserMenuClose(); handleNavigation('/profile'); }, children: [_jsx(PersonIcon, { sx: { mr: 1 } }), "My Profile"] }), _jsxs(MenuItem, { onClick: () => { handleUserMenuClose(); handleNavigation('/settings'); }, children: [_jsx(SettingsIcon, { sx: { mr: 1 } }), "Settings"] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: handleLogout, sx: { color: 'error.main' }, children: [_jsx(LogoutIcon, { sx: { mr: 1 } }), "Logout"] })] })] }) }), _jsx(Box, { sx: { flex: 1, overflow: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }, children: _jsx(Container, { maxWidth: "xl", children: children }) }), _jsxs(Paper, { component: "footer", sx: {
                            mt: 'auto',
                            py: 2,
                            px: 3,
                            backgroundColor: '#f3f4f6',
                            borderTop: '1px solid #e5e7eb',
                            textAlign: 'center',
                        }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["\u00A9 ", new Date().getFullYear(), " QueueCare System. All rights reserved."] }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 0.5, display: 'block' }, children: "Version 1.0.0 | Built with React & Material-UI" })] })] })] }));
};
export default MainLayout;
