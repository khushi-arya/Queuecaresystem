import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Container, Box, Grid, Card, CardContent, Typography, Stack, CircularProgress, Button, } from '@mui/material';
import { People as PeopleIcon, PersonAdd as PersonAddIcon, Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon, TrendingUp as TrendingUpIcon, AccessTime as AccessTimeIcon, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPatients: 0,
        totalDoctors: 0,
        totalAdmins: 0,
        totalAppointmentsThisWeek: 0,
        totalAppointmentsThisMonth: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        averageQueueWaitTime: 0,
        completionRatio: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    /**
     * Calculate dates for filtering
     */
    const getDateRanges = useCallback(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return {
            weekStart: startOfWeek.toISOString(),
            monthStart: startOfMonth.toISOString(),
            now: now.toISOString(),
        };
    }, []);
    /**
     * Fetch dashboard statistics
     */
    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const dateRanges = getDateRanges();
            // Fetch admin dashboard stats
            await adminAPI.getDashboardStats();
            // Fetch user stats
            const userStatsResponse = await adminAPI.getUserStats();
            const userStats = userStatsResponse.data;
            // Fetch appointment stats for this week and month
            const appointmentStatsResponse = await adminAPI.getAppointmentStats(dateRanges.weekStart, dateRanges.now);
            const appointmentStats = appointmentStatsResponse.data;
            // Calculate statistics
            const totalUsers = userStats.totalUsers || 0;
            const totalPatients = userStats.patientCount || 0;
            const totalDoctors = userStats.doctorCount || 0;
            const totalAdmins = userStats.adminCount || 0;
            const completedAppointments = appointmentStats.completed || 0;
            const cancelledAppointments = appointmentStats.cancelled || 0;
            const totalAppointmentsThisWeek = appointmentStats.total || 0;
            // Fetch month data
            const monthStatsResponse = await adminAPI.getAppointmentStats(dateRanges.monthStart, dateRanges.now);
            const monthStats = monthStatsResponse.data;
            const totalAppointmentsThisMonth = monthStats.total || 0;
            // Calculate average wait time (assuming it's provided in response)
            const averageQueueWaitTime = appointmentStats.averageWaitTime || 0;
            // Calculate completion ratio
            const total = totalAppointmentsThisWeek || 1;
            const completionRatio = Math.round((completedAppointments / total) * 100);
            setStats({
                totalUsers,
                totalPatients,
                totalDoctors,
                totalAdmins,
                totalAppointmentsThisWeek,
                totalAppointmentsThisMonth,
                completedAppointments,
                cancelledAppointments,
                averageQueueWaitTime,
                completionRatio,
            });
        }
        catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard statistics');
        }
        finally {
            setLoading(false);
        }
    }, [getDateRanges]);
    /**
     * Initialize on mount
     */
    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);
    /**
     * Stat card component
     */
    const StatCard = ({ title, value, icon, color, unit }) => (_jsx(Card, { sx: {
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            border: `1px solid ${color}30`,
            position: 'relative',
            overflow: 'hidden',
        }, children: _jsx(CardContent, { children: _jsxs(Stack, { spacing: 1, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsx(Typography, { color: "textSecondary", sx: { fontSize: '0.875rem', fontWeight: 500 }, children: title }), _jsx(Box, { sx: { color, opacity: 0.5 }, children: icon })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'baseline', gap: 1 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 600, color }, children: typeof value === 'number' ? value.toLocaleString() : value }), unit && (_jsx(Typography, { variant: "body2", color: "textSecondary", children: unit }))] })] }) }) }));
    if (loading) {
        return (_jsx(Container, { maxWidth: "lg", sx: { py: 4 }, children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }, children: _jsx(CircularProgress, {}) }) }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 1 }, children: "Admin Dashboard" }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "System overview and key metrics" })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null), sx: { mb: 3 } }), _jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 2 }, children: "User Statistics" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Total Users", value: stats.totalUsers, icon: _jsx(PeopleIcon, { sx: { fontSize: '2rem' } }), color: "#1976d2" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Patients", value: stats.totalPatients, icon: _jsx(PersonAddIcon, { sx: { fontSize: '2rem' } }), color: "#2e7d32" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Doctors", value: stats.totalDoctors, icon: _jsx(PeopleIcon, { sx: { fontSize: '2rem' } }), color: "#f57c00" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Admins", value: stats.totalAdmins, icon: _jsx(PersonAddIcon, { sx: { fontSize: '2rem' } }), color: "#c2185b" }) })] })] }), _jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 2 }, children: "Appointment Statistics" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "This Week", value: stats.totalAppointmentsThisWeek, icon: _jsx(ScheduleIcon, { sx: { fontSize: '2rem' } }), color: "#1976d2" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "This Month", value: stats.totalAppointmentsThisMonth, icon: _jsx(ScheduleIcon, { sx: { fontSize: '2rem' } }), color: "#0288d1" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Completed", value: stats.completedAppointments, icon: _jsx(CheckCircleIcon, { sx: { fontSize: '2rem' } }), color: "#2e7d32" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Cancelled", value: stats.cancelledAppointments, icon: _jsx(CloseIcon, { sx: { fontSize: '2rem' } }), color: "#d32f2f" }) })] })] }), _jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 2 }, children: "Performance Metrics" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Avg Queue Wait Time", value: stats.averageQueueWaitTime, icon: _jsx(AccessTimeIcon, { sx: { fontSize: '2rem' } }), color: "#f57c00", unit: "min" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Completion Ratio", value: stats.completionRatio, icon: _jsx(TrendingUpIcon, { sx: { fontSize: '2rem' } }), color: "#2e7d32", unit: "%" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 6, children: _jsx(Card, { sx: {
                                        background: 'linear-gradient(135deg, #1976d220 0%, #1976d210 100%)',
                                        border: '1px solid #1976d230',
                                    }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle2", color: "textSecondary", sx: { mb: 2 }, children: "Quick Actions" }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(Button, { variant: "outlined", size: "small", onClick: () => navigate('/admin/users'), children: "Manage Users" }), _jsx(Button, { variant: "outlined", size: "small", onClick: () => navigate('/admin/doctors'), children: "Manage Doctors" }), _jsx(Button, { variant: "outlined", size: "small", onClick: () => navigate('/admin/users'), children: "View Appointments" })] })] }) }) })] })] }), _jsx(Box, { sx: { display: 'flex', justifyContent: 'center' }, children: _jsx(Button, { variant: "contained", size: "small", onClick: fetchDashboardStats, sx: { mt: 2 }, children: "Refresh Statistics" }) })] }));
};
export default AdminDashboard;
