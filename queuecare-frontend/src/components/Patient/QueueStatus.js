import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Paper, Stack, Typography, Box, Chip, LinearProgress, Alert, AlertTitle, Button, CircularProgress, } from '@mui/material';
import ErrorAlert from '@components/ErrorAlert';
import { CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, Timer as TimerIcon, Close as CloseIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { useNotificationSubscription } from '@hooks/useNotificationSubscription';
import { tokenAPI } from '@services/api';
/**
 * QueueStatus Component
 * Displays patient's current queue position and estimated wait time
 * Shows if patient has been called in queue
 *
 * Features:
 * - Display position in queue
 * - Estimated wait time
 * - Real-time updates via WebSocket
 * - "Called in queue" notifications
 *
 * @example
 * <QueueStatus />
 */
export const QueueStatus = () => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const { isConnected } = useNotificationSubscription();
    const [queueStatus, setQueueStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasBeenCalled, setHasBeenCalled] = useState(false);
    const [error, setError] = useState(null);
    /**
     * Fetch current queue status
     */
    const fetchQueueStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!user?.id)
                return;
            // Get all tokens for the patient
            const response = await tokenAPI.getAll(0, 100, 'WAITING');
            const tokens = response.data.content || [];
            // Find patient's active token
            const patientToken = tokens.find((t) => t.patientId === user.id);
            if (!patientToken) {
                setQueueStatus(null);
                return;
            }
            // Calculate queue status
            const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
            const patientPosition = waitingTokens.findIndex((t) => t.id === patientToken.id) + 1;
            // Estimate wait time: 5 minutes per person ahead
            const estimatedWaitTime = (patientPosition > 1 ? patientPosition - 1 : 0) * 5;
            setQueueStatus({
                totalInQueue: waitingTokens.length,
                estimatedWaitTime,
                currentToken: patientToken,
            });
            // Check if patient has been called
            if (patientToken.status === 'CALLED' && !hasBeenCalled) {
                setHasBeenCalled(true);
                addNotification({
                    type: 'appointment',
                    title: 'You\'ve Been Called!',
                    message: `Token ${patientToken.tokenNumber} is now being called. Please proceed to the examination room.`,
                });
            }
        }
        catch (err) {
            console.error('Failed to fetch queue status:', err);
            setError(err.response?.data?.message || 'Failed to load queue status');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Handle WebSocket queue status updates
     */
    const handleQueueStatusUpdate = (event) => {
        console.log('Queue status update event received:', event);
        fetchQueueStatus();
    };
    /**
     * Handle token status changes from WebSocket
     */
    const handleTokenStatusChange = (event) => {
        const customEvent = event;
        console.log('Token status change received:', customEvent.detail);
        if (customEvent.detail?.patientId === user?.id) {
            // Refetch if this is for the current patient
            fetchQueueStatus();
        }
    };
    /**
     * Fetch queue status on mount and set up polling
     */
    useEffect(() => {
        fetchQueueStatus();
        // Poll for queue updates every 10 seconds
        const interval = setInterval(fetchQueueStatus, 10000);
        return () => clearInterval(interval);
    }, [user?.id]);
    /**
     * Subscribe to WebSocket events
     */
    useEffect(() => {
        window.addEventListener('queueStatusUpdate', handleQueueStatusUpdate);
        window.addEventListener('tokenStatusChange', handleTokenStatusChange);
        return () => {
            window.removeEventListener('queueStatusUpdate', handleQueueStatusUpdate);
            window.removeEventListener('tokenStatusChange', handleTokenStatusChange);
        };
    }, [user?.id]);
    /**
     * Handle leaving queue
     */
    const handleLeaveQueue = async () => {
        if (!queueStatus?.currentToken)
            return;
        try {
            await tokenAPI.updateTokenStatus(queueStatus.currentToken.id, 'SKIPPED');
            setQueueStatus(null);
            addNotification({
                type: 'system',
                title: 'Queue Exited',
                message: 'You have exited the queue.',
            });
        }
        catch (err) {
            console.error('Failed to leave queue:', err);
            setError(err.response?.data?.message || 'Failed to leave queue');
        }
    };
    // Don't render if no active queue
    if (!queueStatus?.currentToken) {
        return null;
    }
    if (loading) {
        return (_jsx(Paper, { sx: { p: 2, mb: 2, bgcolor: 'info.light' }, children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 2 }, children: _jsx(CircularProgress, { size: 24 }) }) }));
    }
    const { currentToken, totalInQueue, estimatedWaitTime } = queueStatus;
    const patientPosition = currentToken.position || 0;
    return (_jsxs(Paper, { sx: { p: 2, mb: 2, bgcolor: 'info.light', border: '2px solid', borderColor: 'info.main' }, children: [!isConnected && (_jsxs(Alert, { severity: "warning", sx: { mb: 2 }, children: [_jsx(AlertTitle, { children: "Connection Status" }), "Real-time updates are temporarily unavailable. Queue status will be updated periodically."] })), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null), sx: { mb: 2 } }), currentToken.status === 'CALLED' && (_jsxs(Alert, { severity: "success", sx: { mb: 2 }, children: [_jsx(AlertTitle, { children: "Your Turn!" }), "Token ", _jsx("strong", { children: currentToken.tokenNumber }), " is now being called. Please proceed to the examination room immediately!"] })), _jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(ScheduleIcon, { color: "primary" }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Queue Status" }), isConnected && (_jsx(Chip, { label: "Live", size: "small", color: "success", variant: "outlined" }))] }), _jsxs(Box, { sx: { textAlign: 'center', py: 1 }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", sx: { mb: 0.5 }, children: "Your Token Number" }), _jsx(Typography, { variant: "h3", sx: {
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    fontSize: '2.5rem',
                                }, children: currentToken.tokenNumber })] }), _jsxs(Box, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { mb: 1 }, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(TimerIcon, { sx: { fontSize: 20, color: 'text.secondary' } }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: "Position in Queue" })] }), _jsx(Typography, { variant: "h6", sx: {
                                            fontWeight: 700,
                                            color: patientPosition === 1 ? 'success.main' : 'warning.main',
                                        }, children: patientPosition === 1 ? 'Next!' : `#${patientPosition}` })] }), _jsx(LinearProgress, { variant: "determinate", value: totalInQueue > 0 ? ((totalInQueue - patientPosition) / totalInQueue) * 100 : 0, sx: { height: 6, borderRadius: 3 } })] }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsxs(Box, { sx: { flex: 1, textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", display: "block", children: "Total in Queue" }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: totalInQueue })] }), _jsxs(Box, { sx: { flex: 1, textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", display: "block", children: "Est. Wait Time" }), _jsxs(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: ["~", estimatedWaitTime, " min"] })] }), _jsxs(Box, { sx: { flex: 1, textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", display: "block", children: "Status" }), _jsx(Chip, { label: currentToken.status, size: "small", color: currentToken.status === 'CALLED'
                                            ? 'success'
                                            : currentToken.status === 'WAITING'
                                                ? 'info'
                                                : 'default', sx: { mt: 0.5 } })] })] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { fullWidth: true, variant: "outlined", color: "error", size: "small", startIcon: _jsx(CloseIcon, {}), onClick: handleLeaveQueue, children: "Leave Queue" }), _jsx(Button, { fullWidth: true, variant: "contained", color: "primary", size: "small", startIcon: _jsx(CheckCircleIcon, {}), onClick: fetchQueueStatus, children: "Refresh" })] })] })] }));
};
export default QueueStatus;
