import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Badge, IconButton, Popover, List, ListItem, ListItemButton, ListItemText, Box, Typography, Divider, Button, Stack, } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useNotifications } from '@hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
/**
 * NotificationCenter Component
 * Bell icon with dropdown showing recent notifications
 * Located in AppBar, displays unread badge
 *
 * @example
 * <NotificationCenter />
 */
export const NotificationCenter = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleNotificationClick = (notificationId) => {
        markRead(notificationId);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'notification-popover' : undefined;
    // Get recent notifications (max 5)
    const recentNotifications = notifications.slice(0, 5);
    return (_jsxs(_Fragment, { children: [_jsx(IconButton, { color: "inherit", onClick: handleOpen, sx: { position: 'relative' }, "aria-label": "notifications", children: _jsx(Badge, { badgeContent: unreadCount, color: "error", children: _jsx(NotificationsIcon, {}) }) }), _jsxs(Popover, { id: id, open: open, anchorEl: anchorEl, onClose: handleClose, anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                }, transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                }, PaperProps: {
                    sx: {
                        width: 320,
                        maxHeight: 400,
                        borderRadius: 1.5,
                        boxShadow: (theme) => theme.palette.mode === 'light'
                            ? '0 8px 32px rgba(0, 0, 0, 0.12)'
                            : '0 8px 32px rgba(0, 0, 0, 0.45)',
                    },
                }, children: [_jsx(Box, { sx: { p: 2, backgroundColor: '#f5f5f5' }, children: _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Notifications" }) }), _jsx(Divider, {}), recentNotifications.length > 0 ? (_jsxs(_Fragment, { children: [_jsx(List, { sx: {
                                    maxHeight: 300,
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#888',
                                        borderRadius: '3px',
                                    },
                                }, children: recentNotifications.map((notification) => (_jsx(ListItem, { disablePadding: true, sx: {
                                        backgroundColor: notification.isRead ? 'inherit' : '#f0f7ff',
                                        '&:hover': {
                                            backgroundColor: notification.isRead ? '#fafafa' : '#e8f4ff',
                                        },
                                    }, children: _jsx(ListItemButton, { onClick: () => handleNotificationClick(notification.id), sx: { py: 1.5 }, children: _jsx(ListItemText, { primary: notification.title, secondary: _jsxs(Stack, { spacing: 0.5, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: notification.message }), _jsx(Typography, { variant: "caption", color: "text.disabled", sx: { fontSize: '0.7rem' }, children: formatDistanceToNow(notification.timestamp, {
                                                            addSuffix: true,
                                                        }) })] }), primaryTypographyProps: {
                                                variant: 'body2',
                                                sx: {
                                                    fontWeight: notification.isRead ? 400 : 600,
                                                    color: notification.isRead ? 'text.primary' : 'primary.main',
                                                },
                                            } }) }) }, notification.id))) }), _jsx(Divider, {}), _jsxs(Box, { sx: { p: 1, display: 'flex', gap: 1 }, children: [_jsx(Button, { size: "small", variant: "text", fullWidth: true, startIcon: _jsx(MarkEmailReadIcon, { sx: { fontSize: '1rem' } }), onClick: markAllRead, sx: { fontSize: '0.8rem' }, children: "Mark all read" }), _jsx(Button, { size: "small", variant: "text", color: "error", fullWidth: true, startIcon: _jsx(ClearAllIcon, { sx: { fontSize: '1rem' } }), onClick: clearAll, sx: { fontSize: '0.8rem' }, children: "Clear all" })] }), _jsx(Box, { sx: { p: 1, textAlign: 'center', borderTop: '1px solid #eee' }, children: _jsx(Button, { component: "a", href: "/settings/notifications", size: "small", sx: { textTransform: 'none', fontSize: '0.9rem' }, children: "View all notifications" }) })] })) : (_jsx(Box, { sx: { p: 3, textAlign: 'center' }, children: _jsx(Typography, { color: "text.secondary", variant: "body2", children: "No notifications yet" }) }))] })] }));
};
export default NotificationCenter;
