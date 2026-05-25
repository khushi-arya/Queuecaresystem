import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Container, Paper, Box, Typography, FormGroup, FormControlLabel, Checkbox, Button, Stack, Card, CardContent, } from '@mui/material';
import { useNotifications } from '@hooks/useNotifications';
import SuccessToast from '@components/SuccessToast';
import ErrorAlert from '@components/ErrorAlert';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
/**
 * NotificationPreferences Page
 * Allows users to manage notification preferences
 * Route: /settings/notifications
 *
 * @example
 * <Route path="/settings/notifications" element={<NotificationPreferences />} />
 */
export const NotificationPreferences = () => {
    const { preferences, updatePreferences } = useNotifications();
    const [localPreferences, setLocalPreferences] = useState(preferences);
    const [successOpen, setSuccessOpen] = useState(false);
    const [error, setError] = useState(null);
    const notificationTypes = [
        {
            key: 'appointment',
            label: 'Appointment Notifications',
            description: 'Get notified about appointment confirmations, reminders, and cancellations',
        },
        {
            key: 'prescription',
            label: 'Prescription Notifications',
            description: 'Receive notifications for new prescriptions and prescription updates',
        },
        {
            key: 'message',
            label: 'Message Notifications',
            description: 'Get alerted when you receive new messages from doctors or staff',
        },
        {
            key: 'system',
            label: 'System Notifications',
            description: 'Important system updates and maintenance notifications',
        },
        {
            key: 'payment',
            label: 'Payment Notifications',
            description: 'Notifications about payments, invoices, and billing updates',
        },
        {
            key: 'profile_update',
            label: 'Profile Update Notifications',
            description: 'Notifications when your profile information is modified',
        },
    ];
    const handleToggle = (key) => {
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
        }
        catch (err) {
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
    return (_jsxs(Container, { maxWidth: "sm", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Notification Preferences" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Manage which notifications you want to receive" })] }), error && (_jsx(ErrorAlert, { message: error, severity: "error", onClose: () => setError(null), sx: { mb: 2 } })), _jsx(Card, { sx: { mb: 3, boxShadow: 1 }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { mb: 3, pb: 2, borderBottom: '1px solid #eee' }, children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 1.5, fontWeight: 600 }, children: "Quick Actions" }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { size: "small", variant: "outlined", onClick: handleEnableAll, disabled: allEnabled, children: "Enable All" }), _jsx(Button, { size: "small", variant: "outlined", onClick: handleDisableAll, disabled: noneEnabled, children: "Disable All" })] })] }), _jsx(Typography, { variant: "subtitle2", sx: { mb: 2, fontWeight: 600 }, children: "Notification Types" }), _jsx(FormGroup, { children: notificationTypes.map((notif) => (_jsx(Box, { sx: { mb: 2.5 }, children: _jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: localPreferences[notif.key], onChange: () => handleToggle(notif.key), size: "medium" }), label: _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: notif.label }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: notif.description })] }), sx: {
                                        alignItems: 'flex-start',
                                        mb: 1,
                                        ml: 0,
                                        mr: 0,
                                    } }) }, notif.key))) })] }) }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(Button, { variant: "contained", color: "primary", fullWidth: true, startIcon: _jsx(SaveIcon, {}), onClick: handleSave, children: "Save Preferences" }), _jsx(Button, { variant: "outlined", fullWidth: true, startIcon: _jsx(RestartAltIcon, {}), onClick: handleReset, disabled: JSON.stringify(localPreferences) === JSON.stringify(preferences), children: "Reset" })] }), _jsxs(Paper, { sx: {
                    mt: 3,
                    p: 2,
                    backgroundColor: '#f0f7ff',
                    border: '1px solid #e0eeff',
                }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "\uD83D\uDCA1 Note" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "Your notification preferences are saved locally on this device. You can manage preferences separately on different devices." })] }), _jsx(SuccessToast, { message: "Notification preferences saved successfully!", open: successOpen, onClose: () => setSuccessOpen(false), severity: "success" })] }));
};
export default NotificationPreferences;
