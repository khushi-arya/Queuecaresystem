import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { useNotifications } from '@hooks/useNotifications';
import SuccessToast from '@components/SuccessToast';
import ErrorAlert from '@components/ErrorAlert';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { NotificationPreferences as INotificationPreferences } from '@context/NotificationContext';

/**
 * NotificationPreferences Page
 * Allows users to manage notification preferences
 * Route: /settings/notifications
 *
 * @example
 * <Route path="/settings/notifications" element={<NotificationPreferences />} />
 */
export const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<INotificationPreferences>(
    preferences
  );
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationTypes = [
    {
      key: 'appointment' as const,
      label: 'Appointment Notifications',
      description: 'Get notified about appointment confirmations, reminders, and cancellations',
    },
    {
      key: 'prescription' as const,
      label: 'Prescription Notifications',
      description: 'Receive notifications for new prescriptions and prescription updates',
    },
    {
      key: 'message' as const,
      label: 'Message Notifications',
      description: 'Get alerted when you receive new messages from doctors or staff',
    },
    {
      key: 'system' as const,
      label: 'System Notifications',
      description: 'Important system updates and maintenance notifications',
    },
    {
      key: 'payment' as const,
      label: 'Payment Notifications',
      description: 'Notifications about payments, invoices, and billing updates',
    },
    {
      key: 'profile_update' as const,
      label: 'Profile Update Notifications',
      description: 'Notifications when your profile information is modified',
    },
  ];

  const handleToggle = (key: keyof INotificationPreferences) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    try {
      updatePreferences(localPreferences);
      setSuccessOpen(true);
      setError(null);
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setError(null);
  };

  const allEnabled = Object.values(localPreferences).every((v) => v);
  const noneEnabled = Object.values(localPreferences).every((v) => !v);

  const handleEnableAll = () => {
    setLocalPreferences({
      appointment: true,
      prescription: true,
      message: true,
      system: true,
      payment: true,
      profile_update: true,
    });
  };

  const handleDisableAll = () => {
    setLocalPreferences({
      appointment: false,
      prescription: false,
      message: false,
      system: false,
      payment: false,
      profile_update: false,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Notification Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage which notifications you want to receive
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          message={error}
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        />
      )}

      {/* Main Preferences Card */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent>
          {/* Quick Actions */}
          <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleEnableAll}
                disabled={allEnabled}
              >
                Enable All
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleDisableAll}
                disabled={noneEnabled}
              >
                Disable All
              </Button>
            </Stack>
          </Box>

          {/* Notification Preferences */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Notification Types
          </Typography>

          <FormGroup>
            {notificationTypes.map((notif) => (
              <Box key={notif.key} sx={{ mb: 2.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localPreferences[notif.key]}
                      onChange={() => handleToggle(notif.key)}
                      size="medium"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {notif.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notif.description}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    mb: 1,
                    ml: 0,
                    mr: 0,
                  }}
                />
              </Box>
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Preferences
        </Button>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          disabled={JSON.stringify(localPreferences) === JSON.stringify(preferences)}
        >
          Reset
        </Button>
      </Stack>

      {/* Info Box */}
      <Paper
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: '#f0f7ff',
          border: '1px solid #e0eeff',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          💡 Note
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your notification preferences are saved locally on this device. You can manage
          preferences separately on different devices.
        </Typography>
      </Paper>

      {/* Success Toast */}
      <SuccessToast
        message="Notification preferences saved successfully!"
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        severity="success"
      />
    </Container>
  );
};

export default NotificationPreferences;
