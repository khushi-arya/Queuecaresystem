import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Divider,
  Button,
  Stack,
} from '@mui/material';
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
export const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { notifications, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId: string) => {
    markRead(notificationId);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  // Get recent notifications (max 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      {/* Bell Icon Button */}
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{ position: 'relative' }}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Notification Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            borderRadius: 1.5,
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 8px 32px rgba(0, 0, 0, 0.12)'
                : '0 8px 32px rgba(0, 0, 0, 0.45)',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>

        <Divider />

        {/* Notifications List */}
        {recentNotifications.length > 0 ? (
          <>
            <List
              sx={{
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
              }}
            >
              {recentNotifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  disablePadding
                  sx={{
                    backgroundColor: notification.isRead ? 'inherit' : '#f0f7ff',
                    '&:hover': {
                      backgroundColor: notification.isRead ? '#fafafa' : '#e8f4ff',
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification.id)}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                            })}
                          </Typography>
                        </Stack>
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: {
                          fontWeight: notification.isRead ? 400 : 600,
                          color: notification.isRead ? 'text.primary' : 'primary.main',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="text"
                fullWidth
                startIcon={<MarkEmailReadIcon sx={{ fontSize: '1rem' }} />}
                onClick={markAllRead}
                sx={{ fontSize: '0.8rem' }}
              >
                Mark all read
              </Button>
              <Button
                size="small"
                variant="text"
                color="error"
                fullWidth
                startIcon={<ClearAllIcon sx={{ fontSize: '1rem' }} />}
                onClick={clearAll}
                sx={{ fontSize: '0.8rem' }}
              >
                Clear all
              </Button>
            </Box>

            {/* View All Link */}
            <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid #eee' }}>
              <Button
                component="a"
                href="/settings/notifications"
                size="small"
                sx={{ textTransform: 'none', fontSize: '0.9rem' }}
              >
                View all notifications
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              No notifications yet
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;
