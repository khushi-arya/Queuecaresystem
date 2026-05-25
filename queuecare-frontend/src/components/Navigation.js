import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Box, Toolbar, Typography, Menu, MenuItem, IconButton, Avatar, Divider, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme, } from '@mui/material';
import { AccountCircle, Settings, Logout, Menu as MenuIcon, Dashboard, Person, LocalHospital, Assessment, Notifications, } from '@mui/icons-material';
import useAuth from '@hooks/useAuth';
/**
 * Navigation Component
 *
 * Provides app-wide navigation with:
 * - Role-based menu items
 * - User profile dropdown
 * - Responsive design
 */
export const Navigation = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    /**
     * Define navigation menu items based on role
     */
    const getMenuItems = (role) => {
        const baseItems = [
            {
                label: 'Dashboard',
                path: '/dashboard',
                icon: Dashboard,
            },
        ];
        const roleSpecificItems = {
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
        if (!user)
            return '';
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    };
    /**
     * Handle profile menu open
     */
    const handleOpenUserMenu = (event) => {
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
    const handleNavigation = (path) => {
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
    return (_jsxs(_Fragment, { children: [_jsx(AppBar, { position: "sticky", elevation: 1, children: _jsxs(Toolbar, { children: [isMobile && (_jsx(IconButton, { size: "large", edge: "start", color: "inherit", "aria-label": "menu", sx: { mr: 2 }, onClick: () => setDrawerOpen(true), children: _jsx(MenuIcon, {}) })), _jsx(Typography, { variant: "h6", sx: {
                                flexGrow: 1,
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }, onClick: () => navigate('/dashboard'), children: "QueueCare" }), !isMobile && (_jsx(Box, { sx: { display: 'flex', gap: 0.5, mr: 3 }, children: menuItems.map((item) => (_jsx(Button, { color: "inherit", onClick: () => navigate(item.path), sx: {
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    borderBottom: location.pathname === item.path
                                        ? '3px solid white'
                                        : 'none',
                                    pb: 0.5,
                                }, children: item.label }, item.path))) })), _jsx(IconButton, { color: "inherit", sx: { mr: 1 }, children: _jsx(Notifications, {}) }), _jsxs(Box, { sx: { flexGrow: 0 }, children: [_jsx(IconButton, { onClick: handleOpenUserMenu, sx: { p: 0 }, children: _jsx(Avatar, { sx: { width: 36, height: 36, backgroundColor: 'secondary.main' }, children: getInitials() }) }), _jsxs(Menu, { sx: { mt: '45px' }, id: "menu-appbar", anchorEl: anchorElUser, anchorOrigin: {
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }, keepMounted: true, transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }, open: Boolean(anchorElUser), onClose: handleCloseUserMenu, children: [_jsx(MenuItem, { disabled: true, children: _jsxs(Box, { children: [_jsxs(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: [user.firstName, " ", user.lastName] }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: user.email }), _jsx(Typography, { variant: "caption", color: "primary", children: user.role })] }) }), _jsx(Divider, {}), user.role !== 'ADMIN' && (_jsxs(MenuItem, { onClick: () => handleNavigation('/profile'), children: [_jsx(ListItemIcon, { children: _jsx(AccountCircle, { fontSize: "small" }) }), _jsx(ListItemText, { children: "My Profile" })] })), _jsxs(MenuItem, { onClick: () => handleNavigation('/settings'), children: [_jsx(ListItemIcon, { children: _jsx(Settings, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Settings" })] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: handleLogout, children: [_jsx(ListItemIcon, { children: _jsx(Logout, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Logout" })] })] })] })] }) }), _jsx(Drawer, { anchor: "left", open: drawerOpen, onClose: () => setDrawerOpen(false), children: _jsxs(Box, { sx: { width: 250, pt: 2 }, children: [_jsx(Box, { sx: { px: 2, mb: 2 }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [_jsx(Avatar, { sx: { width: 40, height: 40, backgroundColor: 'primary.main', mr: 1 }, children: getInitials() }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: [user.firstName, " ", user.lastName] }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: user.role })] })] }) }), _jsx(Divider, {}), _jsx(List, { children: menuItems.map((item) => (_jsxs(ListItem, { button: true, onClick: () => handleNavigation(item.path), selected: location.pathname === item.path, children: [_jsx(ListItemIcon, { children: _jsx(item.icon, {}) }), _jsx(ListItemText, { children: item.label })] }, item.path))) }), _jsx(Divider, {}), _jsxs(List, { children: [user.role !== 'ADMIN' && (_jsxs(ListItem, { button: true, onClick: () => handleNavigation('/profile'), children: [_jsx(ListItemIcon, { children: _jsx(AccountCircle, {}) }), _jsx(ListItemText, { children: "My Profile" })] })), _jsxs(ListItem, { button: true, onClick: () => handleNavigation('/settings'), children: [_jsx(ListItemIcon, { children: _jsx(Settings, {}) }), _jsx(ListItemText, { children: "Settings" })] }), _jsxs(ListItem, { button: true, onClick: handleLogout, children: [_jsx(ListItemIcon, { children: _jsx(Logout, {}) }), _jsx(ListItemText, { children: "Logout" })] })] })] }) })] }));
};
export default Navigation;
