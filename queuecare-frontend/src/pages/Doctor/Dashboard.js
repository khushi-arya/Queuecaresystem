import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Container, Box, Grid, Card, CardContent, CardHeader, Typography, Button, Stack, CircularProgress, Chip, } from '@mui/material';
import { People as PeopleIcon, Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon, PersonAdd as PersonAddIcon, TrendingUp as TrendingUpIcon, AccessTime as AccessTimeIcon, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useQueueSubscription } from '@hooks/useQueueSubscription';
import { tokenAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
export const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isConnected, queueUpdates } = useQueueSubscription();
    const [queueStats, setQueueStats] = useState({
        waiting: 0,
        inProgress: 0,
        completed: 0,
        missed: 0,
        averageWaitTime: 0,
        completionRate: 0,
    });
    const [currentPatient, setCurrentPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [callingNext, setCallingNext] = useState(false);
    /**
     * Fetch queue statistics for today
     */
    const fetchQueueStats = useCallback(async () => {
        try {
            setError(null);
            if (!user?.id)
                return;
            // Fetch today's queue tokens
            const response = await tokenAPI.getQueueTokens(user.id, 0, 100);
            const tokens = response.data.content || [];
            // Calculate statistics
            const waiting = tokens.filter((t) => t.status === 'WAITING').length;
            const inProgress = tokens.filter((t) => t.status === 'IN_CONSULTATION').length;
            const completed = tokens.filter((t) => t.status === 'COMPLETED').length;
            const missed = tokens.filter((t) => t.status === 'CANCELLED').length;
            // Calculate average wait time
            const completedTokens = tokens.filter((t) => t.status === 'COMPLETED');
            let averageWaitTime = 0;
            if (completedTokens.length > 0) {
                const totalWaitTime = completedTokens.reduce((acc, token) => {
                    const issuedTime = new Date(token.issuedAt).getTime();
                    const calledTime = token.calledAt ? new Date(token.calledAt).getTime() : issuedTime;
                    return acc + (calledTime - issuedTime);
                }, 0);
                averageWaitTime = Math.round(totalWaitTime / completedTokens.length / (1000 * 60)); // Convert to minutes
            }
            // Calculate completion rate
            const total = tokens.length;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            setQueueStats({
                waiting,
                inProgress,
                completed,
                missed,
                averageWaitTime,
                completionRate,
            });
            // Find current patient (IN_CONSULTATION status)
            const currentToken = tokens.find((t) => t.status === 'IN_CONSULTATION');
            if (currentToken) {
                const timeInQueue = currentToken.calledAt
                    ? Math.round((new Date().getTime() - new Date(currentToken.calledAt).getTime()) / (1000 * 60))
                    : 0;
                setCurrentPatient({
                    tokenId: currentToken.id,
                    patientName: `Patient #${currentToken.tokenNumber}`, // Will be replaced with actual name from API
                    position: 1,
                    timeInQueue,
                    calledAt: currentToken.calledAt || new Date().toISOString(),
                });
            }
            else {
                setCurrentPatient(null);
            }
        }
        catch (err) {
            console.error('Failed to fetch queue stats:', err);
            setError(err.response?.data?.message || 'Failed to load queue statistics');
        }
        finally {
            setLoading(false);
        }
    }, [user?.id]);
    /**
     * Initialize on mount
     */
    useEffect(() => {
        fetchQueueStats();
    }, [fetchQueueStats]);
    /**
     * Refresh stats when queue updates arrive via WebSocket
     */
    useEffect(() => {
        if (queueUpdates) {
            fetchQueueStats();
        }
    }, [queueUpdates, fetchQueueStats]);
    /**
     * Handle call next patient
     */
    const handleCallNextPatient = async () => {
        try {
            setCallingNext(true);
            setError(null);
            if (!user?.id)
                return;
            await tokenAPI.callNextToken(user.id);
            // Refresh stats
            await fetchQueueStats();
        }
        catch (err) {
            console.error('Failed to call next patient:', err);
            setError(err.response?.data?.message || 'Failed to call next patient');
        }
        finally {
            setCallingNext(false);
        }
    };
    /**
     * Format time in queue
     */
    const formatTimeInQueue = (minutes) => {
        if (minutes < 60)
            return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };
    if (loading) {
        return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4, textAlign: 'center' }, children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "body1", sx: { mt: 2 }, children: "Loading queue statistics..." })] }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "Doctor Dashboard" }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Chip, { icon: isConnected ? _jsx(CheckCircleIcon, {}) : _jsx(CloseIcon, {}), label: isConnected ? 'Real-time Connected' : 'Offline', color: isConnected ? 'success' : 'default', variant: "outlined" }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                }) })] })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), currentPatient ? (_jsxs(Card, { sx: { mb: 4, backgroundColor: 'primary.light', borderRadius: 2 }, children: [_jsx(CardHeader, { avatar: _jsx(PersonAddIcon, { sx: { color: 'primary.main' } }), title: "Currently in Progress", titleTypographyProps: { variant: 'h6' } }), _jsx(CardContent, { children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Patient Name" }), _jsx(Typography, { variant: "h5", sx: { fontWeight: 'bold' }, children: currentPatient.patientName })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Time in Queue" }), _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(AccessTimeIcon, { fontSize: "small", color: "primary" }), _jsx(Typography, { variant: "h6", children: formatTimeInQueue(currentPatient.timeInQueue) })] })] }), _jsx(Button, { variant: "contained", size: "large", fullWidth: true, sx: { py: 2, fontSize: '1.1rem', fontWeight: 'bold' }, onClick: () => navigate('/doctor/queue-management'), children: "View Queue Management" })] }) })] })) : (_jsx(Card, { sx: { mb: 4, backgroundColor: 'success.light', borderRadius: 2 }, children: _jsx(CardContent, { children: _jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 'bold', color: 'success.dark' }, children: "No Patients Currently in Progress" }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: queueStats.waiting > 0
                                    ? `You have ${queueStats.waiting} waiting patient(s)`
                                    : 'No patients waiting' }), _jsx(Button, { variant: "contained", size: "large", fullWidth: true, sx: { py: 2, fontSize: '1.1rem', fontWeight: 'bold' }, onClick: handleCallNextPatient, disabled: queueStats.waiting === 0 || callingNext, children: callingNext ? _jsx(CircularProgress, { size: 24 }) : 'Call Next Patient' })] }) }) })), _jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold', mt: 4 }, children: "Today's Queue Summary" }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 4 }, children: [_jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(PeopleIcon, { sx: { fontSize: 32, color: 'warning.main', mb: 1 } }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: queueStats.waiting }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "Waiting" })] }) }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(ScheduleIcon, { sx: { fontSize: 32, color: 'info.main', mb: 1 } }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: queueStats.inProgress }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "In Progress" })] }) }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(CheckCircleIcon, { sx: { fontSize: 32, color: 'success.main', mb: 1 } }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: queueStats.completed }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "Completed" })] }) }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(CloseIcon, { sx: { fontSize: 32, color: 'error.main', mb: 1 } }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: queueStats.missed }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "Missed" })] }) }) })] }), _jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "Performance Metrics" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Box, { sx: {
                                                backgroundColor: 'info.light',
                                                borderRadius: '50%',
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }, children: _jsx(AccessTimeIcon, { sx: { color: 'info.main', fontSize: 28 } }) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "Average Wait Time" }), _jsxs(Typography, { variant: "h5", sx: { fontWeight: 'bold' }, children: [queueStats.averageWaitTime, " min"] })] })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Box, { sx: {
                                                backgroundColor: 'success.light',
                                                borderRadius: '50%',
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }, children: _jsx(TrendingUpIcon, { sx: { color: 'success.main', fontSize: 28 } }) }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", children: "Completion Rate" }), _jsxs(Typography, { variant: "h5", sx: { fontWeight: 'bold' }, children: [queueStats.completionRate, "%"] })] })] }) }) }) })] }), _jsxs(Box, { sx: { mt: 6, mb: 4 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "Quick Links" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Button, { variant: "outlined", fullWidth: true, onClick: () => navigate('/doctor/queue-management'), sx: { py: 2 }, children: "Queue Management" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Button, { variant: "outlined", fullWidth: true, onClick: () => navigate('/doctor/appointments'), sx: { py: 2 }, children: "My Appointments" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Button, { variant: "outlined", fullWidth: true, onClick: () => navigate('/doctor/statistics'), sx: { py: 2 }, children: "Statistics" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Button, { variant: "outlined", fullWidth: true, onClick: () => navigate('/doctor/profile'), sx: { py: 2 }, children: "My Profile" }) })] })] })] }));
};
export default DoctorDashboard;
