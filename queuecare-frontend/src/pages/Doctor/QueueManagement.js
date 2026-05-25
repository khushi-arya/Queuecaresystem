import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, Stack, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Close as CloseIcon, Phone as PhoneIcon, Done as DoneIcon, Block as BlockIcon, Refresh as RefreshIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { useQueueSubscription } from '@hooks/useQueueSubscription';
import { tokenAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
export const QueueManagement = () => {
    const { user } = useAuth();
    const { isConnected, queueUpdates } = useQueueSubscription();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [missedDialog, setMissedDialog] = useState(false);
    const [missedNotes, setMissedNotes] = useState('');
    const [missedTokenId, setMissedTokenId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    /**
     * Fetch today's queue tokens
     */
    const fetchQueueTokens = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh)
                setLoading(true);
            else
                setRefreshing(true);
            setError(null);
            if (!user?.id)
                return;
            const response = await tokenAPI.getQueueTokens(user.id, 0, 100);
            const rawTokens = response.data.content || [];
            // Sort by position: IN_CONSULTATION first, then WAITING, then completed ones
            const sortedTokens = rawTokens.sort((a, b) => {
                const statusOrder = {
                    IN_CONSULTATION: 0,
                    WAITING: 1,
                    COMPLETED: 2,
                    CANCELLED: 3,
                };
                return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
            });
            // Map tokens with additional info
            const mappedTokens = sortedTokens.map((token, index) => {
                const timeInQueue = token.calledAt
                    ? Math.round((new Date().getTime() - new Date(token.calledAt).getTime()) / (1000 * 60))
                    : Math.round((new Date().getTime() - new Date(token.issuedAt).getTime()) / (1000 * 60));
                return {
                    ...token,
                    patientName: `Patient #${token.tokenNumber}`,
                    position: index + 1,
                    timeInQueue: Math.max(0, timeInQueue),
                };
            });
            setTokens(mappedTokens);
        }
        catch (err) {
            console.error('Failed to fetch queue tokens:', err);
            setError(err.response?.data?.message || 'Failed to load queue');
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);
    /**
     * Initialize on mount
     */
    useEffect(() => {
        fetchQueueTokens();
    }, [fetchQueueTokens]);
    /**
     * Refresh when WebSocket updates arrive
     */
    useEffect(() => {
        if (queueUpdates) {
            fetchQueueTokens(true);
        }
    }, [queueUpdates, fetchQueueTokens]);
    /**
     * Call next patient
     */
    const handleCallNext = async () => {
        try {
            setActionLoading(true);
            setError(null);
            if (!user?.id)
                return;
            await tokenAPI.callNextToken(user.id);
            // Refresh queue
            await fetchQueueTokens(true);
        }
        catch (err) {
            console.error('Failed to call next patient:', err);
            setError(err.response?.data?.message || 'Failed to call next patient');
        }
        finally {
            setActionLoading(false);
        }
    };
    /**
     * Mark token as done
     */
    const handleMarkDone = async (tokenId) => {
        try {
            setActionLoading(true);
            setError(null);
            await tokenAPI.completeToken(tokenId);
            // Refresh queue
            await fetchQueueTokens(true);
        }
        catch (err) {
            console.error('Failed to mark patient as done:', err);
            setError(err.response?.data?.message || 'Failed to update token status');
        }
        finally {
            setActionLoading(false);
        }
    };
    /**
     * Mark token as missed
     */
    const handleMarkMissed = async () => {
        try {
            setActionLoading(true);
            setError(null);
            if (!missedTokenId)
                return;
            await tokenAPI.cancelToken(missedTokenId, missedNotes || 'Patient did not show up');
            // Refresh queue
            await fetchQueueTokens(true);
            // Close dialog
            setMissedDialog(false);
            setMissedNotes('');
            setMissedTokenId(null);
        }
        catch (err) {
            console.error('Failed to mark patient as missed:', err);
            setError(err.response?.data?.message || 'Failed to update token status');
        }
        finally {
            setActionLoading(false);
        }
    };
    /**
     * Open missed dialog
     */
    const openMissedDialog = (tokenId) => {
        setMissedTokenId(tokenId);
        setMissedNotes('');
        setMissedDialog(true);
    };
    /**
     * Format date and time
     */
    const formatDateTime = (dateStr) => {
        if (!dateStr)
            return '-';
        try {
            const date = new Date(dateStr);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        catch {
            return '-';
        }
    };
    /**
     * Get status chip color
     */
    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_CONSULTATION':
                return 'primary';
            case 'WAITING':
                return 'warning';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };
    /**
     * Get status label
     */
    const getStatusLabel = (status) => {
        switch (status) {
            case 'IN_CONSULTATION':
                return 'In Progress';
            case 'WAITING':
                return 'Waiting';
            case 'COMPLETED':
                return 'Done';
            case 'CANCELLED':
                return 'Missed';
            default:
                return status;
        }
    };
    if (loading) {
        return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4, textAlign: 'center' }, children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "body1", sx: { mt: 2 }, children: "Loading queue..." })] }));
    }
    const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
    const inConsultation = tokens.find((t) => t.status === 'IN_CONSULTATION');
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "Queue Management" }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Chip, { icon: isConnected ? _jsx(CheckCircleIcon, {}) : _jsx(CloseIcon, {}), label: isConnected ? 'Real-time Connected' : 'Offline', color: isConnected ? 'success' : 'default', variant: "outlined" }), _jsxs(Typography, { variant: "caption", color: "textSecondary", children: ["Total: ", tokens.length, " patients"] })] })] }), _jsx(Button, { startIcon: _jsx(RefreshIcon, {}), onClick: () => fetchQueueTokens(true), disabled: refreshing, children: refreshing ? 'Refreshing...' : 'Refresh' })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsx(Card, { sx: { mb: 4, backgroundColor: 'primary.light' }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", justifyContent: "space-between", children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 'bold' }, children: "Ready to Call Next Patient?" }), _jsxs(Typography, { variant: "body2", color: "textSecondary", children: [waitingTokens.length, " patient(s) waiting"] })] }), _jsx(Button, { variant: "contained", size: "large", startIcon: _jsx(PhoneIcon, {}), onClick: handleCallNext, disabled: waitingTokens.length === 0 || actionLoading, sx: { minWidth: 180 }, children: actionLoading ? _jsx(CircularProgress, { size: 24 }) : 'Call Next' })] }) }) }), inConsultation && (_jsxs(Card, { sx: { mb: 4, backgroundColor: 'info.light', borderRadius: 2 }, children: [_jsx(CardHeader, { title: `Currently In Progress: ${inConsultation.patientName}`, titleTypographyProps: { variant: 'h6' } }), _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Stack, { spacing: 1, children: [_jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Called at:" }), " ", formatDateTime(inConsultation.calledAt)] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Time in consultation:" }), " ", inConsultation.timeInQueue, "m"] })] }), _jsx(Button, { variant: "contained", color: "success", startIcon: _jsx(DoneIcon, {}), onClick: () => handleMarkDone(inConsultation.id), disabled: actionLoading, children: "Mark as Done" })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { title: `All Queue Tokens (${tokens.length})`, titleTypographyProps: { variant: 'h6', sx: { fontWeight: 'bold' } } }), _jsxs(CardContent, { children: [_jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: 'primary.light' }, children: [_jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Position" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Patient" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Status" }), _jsx(TableCell, { sx: { fontWeight: 'bold', textAlign: 'center' }, children: "Time" }), _jsx(TableCell, { sx: { fontWeight: 'bold', textAlign: 'center' }, children: "Called At" }), _jsx(TableCell, { sx: { fontWeight: 'bold', textAlign: 'center' }, children: "Actions" })] }) }), _jsx(TableBody, { children: tokens.map((token) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsx(Chip, { label: `#${token.position}`, size: "small", variant: "outlined" }) }), _jsx(TableCell, { children: token.patientName }), _jsx(TableCell, { children: _jsx(Chip, { label: getStatusLabel(token.status), color: getStatusColor(token.status), size: "small" }) }), _jsx(TableCell, { align: "center", children: token.timeInQueue && token.timeInQueue > 0
                                                            ? `${token.timeInQueue}m`
                                                            : '-' }), _jsx(TableCell, { align: "center", children: formatDateTime(token.calledAt) }), _jsxs(TableCell, { align: "center", children: [token.status === 'WAITING' && (_jsx(Button, { size: "small", variant: "outlined", color: "primary", startIcon: _jsx(PhoneIcon, {}), onClick: handleCallNext, disabled: actionLoading, sx: { mr: 1 }, children: "Call" })), token.status === 'IN_CONSULTATION' && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "small", variant: "contained", color: "success", startIcon: _jsx(DoneIcon, {}), onClick: () => handleMarkDone(token.id), disabled: actionLoading, sx: { mr: 1 }, children: "Done" }), _jsx(Button, { size: "small", variant: "outlined", color: "error", startIcon: _jsx(BlockIcon, {}), onClick: () => openMissedDialog(token.id), disabled: actionLoading, children: "Missed" })] })), (token.status === 'COMPLETED' || token.status === 'CANCELLED') && (_jsx(Typography, { variant: "caption", color: "textSecondary", children: getStatusLabel(token.status) }))] })] }, token.id))) })] }) }), tokens.length === 0 && (_jsx(Box, { sx: { textAlign: 'center', py: 4 }, children: _jsx(Typography, { color: "textSecondary", children: "No queue tokens for today" }) }))] })] }), _jsxs(Dialog, { open: missedDialog, onClose: () => setMissedDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Mark Patient as Missed" }), _jsx(DialogContent, { children: _jsx(Box, { sx: { pt: 2 }, children: _jsx(TextField, { fullWidth: true, multiline: true, rows: 3, label: "Notes", placeholder: "Why did the patient miss their appointment?", value: missedNotes, onChange: (e) => setMissedNotes(e.target.value), variant: "outlined" }) }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setMissedDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleMarkMissed, variant: "contained", color: "error", disabled: actionLoading, children: actionLoading ? _jsx(CircularProgress, { size: 24 }) : 'Mark as Missed' })] })] })] }));
};
export default QueueManagement;
