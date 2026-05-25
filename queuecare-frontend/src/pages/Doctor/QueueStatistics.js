import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, Stack, CircularProgress, Alert, Grid, TextField, LinearProgress, } from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { Download as DownloadIcon, Refresh as RefreshIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { tokenAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
export const QueueStatistics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        waiting: 0,
        inProgress: 0,
        completed: 0,
        missed: 0,
        averageWaitTime: 0,
        completionRate: 0,
        avgConsultationTime: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    /**
     * Fetch queue statistics
     */
    const fetchStatistics = async (_date, isRefresh = false) => {
        try {
            if (!isRefresh)
                setLoading(true);
            else
                setRefreshing(true);
            setError(null);
            if (!user?.id)
                return;
            // Fetch all tokens for selected date
            const response = await tokenAPI.getQueueTokens(user.id, 0, 100);
            const allTokens = response.data.content || [];
            // Calculate statistics
            const waiting = allTokens.filter((t) => t.status === 'WAITING').length;
            const inProgress = allTokens.filter((t) => t.status === 'IN_CONSULTATION').length;
            const completed = allTokens.filter((t) => t.status === 'COMPLETED').length;
            const missed = allTokens.filter((t) => t.status === 'CANCELLED').length;
            const total = allTokens.length;
            // Calculate average wait time
            let averageWaitTime = 0;
            const completedTokens = allTokens.filter((t) => t.status === 'COMPLETED');
            if (completedTokens.length > 0) {
                const totalWaitTime = completedTokens.reduce((acc, token) => {
                    const issuedTime = new Date(token.issuedAt).getTime();
                    const calledTime = token.calledAt ? new Date(token.calledAt).getTime() : issuedTime;
                    return acc + (calledTime - issuedTime);
                }, 0);
                averageWaitTime = Math.round(totalWaitTime / completedTokens.length / (1000 * 60));
            }
            // Calculate average consultation time
            let avgConsultationTime = 0;
            if (completedTokens.length > 0) {
                const totalConsultationTime = completedTokens.reduce((acc, token) => {
                    const calledTime = token.calledAt ? new Date(token.calledAt).getTime() : 0;
                    const completedTime = token.completedAt ? new Date(token.completedAt).getTime() : 0;
                    return acc + (completedTime - calledTime);
                }, 0);
                avgConsultationTime = Math.round(totalConsultationTime / completedTokens.length / (1000 * 60));
            }
            // Calculate completion rate
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            setStats({
                total,
                waiting,
                inProgress,
                completed,
                missed,
                averageWaitTime,
                completionRate,
                avgConsultationTime,
            });
            // Prepare pie chart data
            const pieData = [
                {
                    name: 'Waiting',
                    value: waiting,
                    percentage: ((waiting / total) * 100).toFixed(1),
                },
                {
                    name: 'In Progress',
                    value: inProgress,
                    percentage: ((inProgress / total) * 100).toFixed(1),
                },
                {
                    name: 'Completed',
                    value: completed,
                    percentage: ((completed / total) * 100).toFixed(1),
                },
                {
                    name: 'Missed',
                    value: missed,
                    percentage: ((missed / total) * 100).toFixed(1),
                },
            ].filter((d) => d.value > 0);
            setChartData(pieData);
            // Prepare timeline data (simulate hourly distribution)
            const hourlyData = {};
            allTokens.forEach((token) => {
                const hour = new Date(token.issuedAt).getHours();
                if (!hourlyData[hour]) {
                    hourlyData[hour] = { patients: 0, completed: 0 };
                }
                hourlyData[hour].patients++;
                if (token.status === 'COMPLETED') {
                    hourlyData[hour].completed++;
                }
            });
            const timeline = Object.entries(hourlyData)
                .map(([hour, data]) => ({
                hour: `${hour}:00`,
                patients: data.patients,
                completed: data.completed,
            }))
                .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
            setTimelineData(timeline);
        }
        catch (err) {
            console.error('Failed to fetch statistics:', err);
            setError(err.response?.data?.message || 'Failed to load statistics');
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
        fetchStatistics(selectedDate);
    }, [user?.id, selectedDate]);
    /**
     * Handle date change
     */
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    if (loading) {
        return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4, textAlign: 'center' }, children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "body1", sx: { mt: 2 }, children: "Loading statistics..." })] }));
    }
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: "Queue Statistics" }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(TextField, { type: "date", value: selectedDate, onChange: (e) => handleDateChange(e.target.value), InputLabelProps: { shrink: true }, size: "small" }), _jsx(Button, { startIcon: _jsx(RefreshIcon, {}), onClick: () => fetchStatistics(selectedDate, true), disabled: refreshing, children: refreshing ? 'Refreshing...' : 'Refresh' })] })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 4 }, children: [_jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Total Patients" }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold', color: 'primary.main' }, children: stats.total })] }) }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Avg Wait Time" }), _jsxs(Typography, { variant: "h4", sx: { fontWeight: 'bold', color: 'info.main' }, children: [stats.averageWaitTime, "m"] })] }) }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Completion Rate" }), _jsxs(Typography, { variant: "h4", sx: { fontWeight: 'bold', color: 'success.main' }, children: [stats.completionRate, "%"] })] }) }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(Card, { children: _jsxs(CardContent, { sx: { textAlign: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Avg Consultation" }), _jsxs(Typography, { variant: "h4", sx: { fontWeight: 'bold', color: 'warning.main' }, children: [stats.avgConsultationTime, "m"] })] }) }) })] }), _jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Status Distribution" }), _jsx(CardContent, { children: _jsx(Box, { sx: { height: 300 }, children: chartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name}: ${typeof percent === 'number' ? (percent * 100).toFixed(0) : '0'}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: chartData.map((_entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) })) : (_jsx(Box, { sx: { textAlign: 'center', py: 6 }, children: _jsx(Typography, { color: "textSecondary", children: "No data available" }) })) }) })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Quick Stats" }), _jsx(CardContent, { children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", children: "Waiting" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: stats.waiting })] }), _jsx(LinearProgress, { variant: "determinate", value: stats.total > 0 ? (stats.waiting / stats.total) * 100 : 0, sx: { height: 8, borderRadius: 1 } })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", children: "In Progress" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: stats.inProgress })] }), _jsx(LinearProgress, { variant: "determinate", value: stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0, color: "info", sx: { height: 8, borderRadius: 1 } })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", children: "Completed" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: stats.completed })] }), _jsx(LinearProgress, { variant: "determinate", value: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0, color: "success", sx: { height: 8, borderRadius: 1 } })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { variant: "body2", children: "Missed" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: stats.missed })] }), _jsx(LinearProgress, { variant: "determinate", value: stats.total > 0 ? (stats.missed / stats.total) * 100 : 0, color: "error", sx: { height: 8, borderRadius: 1 } })] })] }) })] }) })] }), timelineData.length > 0 && (_jsxs(Card, { sx: { mb: 4 }, children: [_jsx(CardHeader, { title: "Hourly Distribution" }), _jsx(CardContent, { children: _jsx(Box, { sx: { height: 300 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: timelineData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "hour" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { dataKey: "patients", fill: "#3b82f6", name: "Total Patients" }), _jsx(Bar, { dataKey: "completed", fill: "#10b981", name: "Completed" })] }) }) }) })] })), _jsx(Box, { sx: { display: 'flex', gap: 1, mb: 2 }, children: _jsx(Button, { startIcon: _jsx(DownloadIcon, {}), variant: "outlined", onClick: () => {
                        const data = {
                            date: selectedDate,
                            stats,
                            exportedAt: new Date().toISOString(),
                        };
                        const json = JSON.stringify(data, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `queue-statistics-${selectedDate}.json`;
                        a.click();
                    }, children: "Export as JSON" }) }), _jsx(Alert, { severity: "info", children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Statistics Information:" }), " These metrics help you understand your queue performance. Track wait times to identify bottlenecks, monitor completion rates to ensure productivity, and adjust schedules based on hourly distribution patterns."] }) })] }));
};
export default QueueStatistics;
