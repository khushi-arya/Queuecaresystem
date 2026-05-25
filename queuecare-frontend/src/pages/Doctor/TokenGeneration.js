import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, Stack, CircularProgress, Alert, Chip, Paper, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import { Refresh as RefreshIcon, Code as CodeIcon, Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { tokenAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
export const TokenGeneration = () => {
    const { user } = useAuth();
    const [tokenData, setTokenData] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    /**
     * Generate or fetch token
     */
    const fetchToken = async (isRefresh = false) => {
        try {
            if (!isRefresh)
                setLoading(true);
            else
                setRefreshing(true);
            setError(null);
            if (!user?.id)
                return;
            // Fetch current token
            await tokenAPI.getCurrentToken(user.id);
            // Create token data
            const tokenValue = `DOC${user.id.substring(0, 4).toUpperCase()}_${new Date()
                .toISOString()
                .substring(0, 10)
                .replace(/-/g, '')}_${String(tokens.length + 1).padStart(3, '0')}`;
            setTokenData({
                tokenValue,
                generationTime: new Date().toLocaleString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
                isValid: true,
            });
            // Fetch token history for today
            const tokensResponse = await tokenAPI.getQueueTokens(user.id, 0, 50);
            setTokens(tokensResponse.data.content || []);
        }
        catch (err) {
            console.error('Failed to fetch token:', err);
            setError(err.response?.data?.message || 'Failed to generate token');
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    /**
     * Initialize on mount
     */
    useEffect(() => {
        fetchToken();
    }, [user?.id]);
    /**
     * Format date and time
     */
    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };
    /**
     * Get status badge
     */
    const getStatusBadge = (status) => {
        const statusMap = {
            WAITING: { color: 'warning', label: 'Waiting' },
            CALLED: { color: 'info', label: 'Called' },
            IN_CONSULTATION: { color: 'primary', label: 'In Progress' },
            COMPLETED: { color: 'success', label: 'Completed' },
            CANCELLED: { color: 'error', label: 'Cancelled' },
        };
        const mapped = statusMap[status] || { color: 'default', label: status };
        return _jsx(Chip, { label: mapped.label, color: mapped.color, size: "small" });
    };
    if (loading) {
        return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4, textAlign: 'center' }, children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "body1", sx: { mt: 2 }, children: "Loading token information..." })] }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: "Token Generation" }), _jsx(Button, { startIcon: _jsx(RefreshIcon, {}), onClick: () => fetchToken(true), disabled: refreshing, children: refreshing ? 'Refreshing...' : 'Refresh' })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), tokenData && (_jsxs(Card, { sx: { mb: 4, backgroundColor: 'primary.light', borderRadius: 2 }, children: [_jsx(CardHeader, { avatar: _jsx(CodeIcon, { sx: { color: 'primary.main' } }), title: "Today's Token Sequence", titleTypographyProps: { variant: 'h6' } }), _jsx(CardContent, { children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { sx: {
                                            p: 3,
                                            backgroundColor: 'white',
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                        }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Token Value" }), _jsx(Typography, { variant: "h4", sx: {
                                                    fontWeight: 'bold',
                                                    color: 'primary.main',
                                                    fontFamily: 'monospace',
                                                    my: 1,
                                                    wordBreak: 'break-all',
                                                }, children: tokenData.tokenValue }), _jsx(Button, { size: "small", variant: "outlined", onClick: () => {
                                                    navigator.clipboard.writeText(tokenData.tokenValue);
                                                    alert('Token copied to clipboard!');
                                                }, children: "Copy Token" })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Generation Time" }), _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(ScheduleIcon, { fontSize: "small", color: "primary" }), _jsx(Typography, { variant: "body1", children: tokenData.generationTime })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Expires At" }), _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(ScheduleIcon, { fontSize: "small", color: "warning" }), _jsx(Typography, { variant: "body1", children: tokenData.expiresAt })] })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Status" }), _jsx(Stack, { direction: "row", spacing: 1, alignItems: "center", children: tokenData.isValid ? (_jsxs(_Fragment, { children: [_jsx(CheckCircleIcon, { sx: { color: 'success.main' } }), _jsx(Typography, { variant: "body1", sx: { color: 'success.main', fontWeight: 'bold' }, children: "Valid" })] })) : (_jsxs(_Fragment, { children: [_jsx(CloseIcon, { sx: { color: 'error.main' } }), _jsx(Typography, { variant: "body1", sx: { color: 'error.main', fontWeight: 'bold' }, children: "Expired" })] })) })] })] }) })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { title: `Token History (${tokens.length})`, titleTypographyProps: { variant: 'h6', sx: { fontWeight: 'bold' } } }), _jsx(CardContent, { children: tokens.length > 0 ? (_jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: 'primary.light' }, children: [_jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Token #" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Patient ID" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Issued At" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Called At" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Status" })] }) }), _jsx(TableBody, { children: tokens.map((token) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsx(Chip, { label: `#${token.tokenNumber}`, size: "small", variant: "outlined" }) }), _jsx(TableCell, { children: token.patientId || '-' }), _jsx(TableCell, { children: formatDateTime(token.issuedAt) }), _jsx(TableCell, { children: token.calledAt ? formatDateTime(token.calledAt) : '-' }), _jsx(TableCell, { children: getStatusBadge(token.status) })] }, token.id))) })] }) })) : (_jsx(Box, { sx: { textAlign: 'center', py: 4 }, children: _jsx(Typography, { color: "textSecondary", children: "No token history available" }) })) })] }), _jsx(Alert, { severity: "info", sx: { mt: 4 }, children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Token Generation Information:" }), " Your daily token sequence is automatically generated and is valid for 24 hours. It identifies your queue session and helps manage patient flow efficiently. You can regenerate your token if needed, but the current one will remain valid until expiration."] }) })] }));
};
export default TokenGeneration;
