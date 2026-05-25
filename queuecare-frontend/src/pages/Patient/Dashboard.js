import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Container, Box, Grid, Card, CardContent, CardHeader, CardActions, Typography, Button, Stack, CircularProgress, Alert, Chip, Paper, Avatar, } from '@mui/material';
import { CalendarToday as CalendarTodayIcon, AccessTime as AccessTimeIcon, Person as PersonIcon, EventAvailable as EventAvailableIcon, Add as AddIcon, ViewList as ViewListIcon, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { appointmentAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
export const PatientDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalThisMonth: 0,
        nextAppointmentDate: null,
    });
    /**
     * Fetch upcoming appointments
     */
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!user?.id)
                    return;
                // Fetch upcoming appointments (only SCHEDULED status)
                const response = await appointmentAPI.getByPatient(user.id, 0, 5);
                const data = response.data;
                const allAppointments = Array.isArray(data) ? data : (data?.content || data?.data || []);
                const upcomingAppointments = allAppointments.filter((apt) => apt.status === 'SCHEDULED');
                setAppointments(upcomingAppointments);
                // Calculate stats
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const thisMonthAppointments = allAppointments.filter((apt) => {
                    const aptDate = new Date(apt.appointmentDate);
                    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
                });
                setStats({
                    totalThisMonth: thisMonthAppointments.length,
                    nextAppointmentDate: upcomingAppointments.length > 0
                        ? new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString()
                        : null,
                });
            }
            catch (err) {
                console.error('Failed to fetch appointments:', err);
                setError(err.response?.data?.message || 'Failed to load appointments');
            }
            finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [user?.id]);
    /**
     * Format date and time
     */
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };
    };
    /**
     * Get status color
     */
    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'info';
            case 'COMPLETED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            case 'NO_SHOW':
                return 'warning';
            default:
                return 'default';
        }
    };
    if (loading) {
        return (_jsx(Container, { maxWidth: "lg", sx: { py: 4, display: 'flex', justifyContent: 'center' }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsxs(Typography, { variant: "h3", component: "h1", sx: { fontWeight: 700, mb: 1 }, children: ["Welcome, ", user?.firstName, "!"] }), _jsx(Typography, { variant: "body1", color: "textSecondary", children: "Manage your appointments and book new ones" })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Paper, { sx: {
                                p: 3,
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                borderRadius: 2,
                            }, children: [_jsx(CalendarTodayIcon, { sx: { fontSize: 40, mb: 1 } }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 0.5 }, children: stats.totalThisMonth }), _jsx(Typography, { variant: "body2", children: "Appointments This Month" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Paper, { sx: {
                                p: 3,
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: '#fff',
                                borderRadius: 2,
                            }, children: [_jsx(EventAvailableIcon, { sx: { fontSize: 40, mb: 1 } }), _jsx(Typography, { variant: "body2", sx: { mb: 1 }, children: "Next Appointment" }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: stats.nextAppointmentDate || 'No upcoming' })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Paper, { sx: {
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: '#fff',
                                borderRadius: 2,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                },
                            }, onClick: () => navigate('/patient/book-appointment'), children: [_jsx(AddIcon, { sx: { fontSize: 40, mb: 1 } }), _jsx(Typography, { variant: "body2", sx: { mb: 1 }, children: "Ready to Book?" }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Book Now" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Paper, { sx: {
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                color: '#fff',
                                borderRadius: 2,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                },
                            }, onClick: () => navigate('/patient/appointments'), children: [_jsx(ViewListIcon, { sx: { fontSize: 40, mb: 1 } }), _jsx(Typography, { variant: "body2", sx: { mb: 1 }, children: "View Details" }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "All Appointments" })] }) })] }), _jsxs(Card, { sx: { boxShadow: 2 }, children: [_jsx(CardHeader, { avatar: _jsx(Avatar, { sx: { bgcolor: 'primary.main' }, children: _jsx(CalendarTodayIcon, {}) }), title: "Upcoming Appointments", subheader: `Next ${Math.min(5, appointments.length)} appointments`, titleTypographyProps: { variant: 'h6', sx: { fontWeight: 600 } } }), _jsx(CardContent, { children: appointments.length === 0 ? (_jsxs(Alert, { severity: "info", children: ["No upcoming appointments. ", _jsx("strong", { children: "Book an appointment now!" })] })) : (_jsx(Stack, { spacing: 2, children: appointments.map((appointment, index) => {
                                const { date, time } = formatDateTime(appointment.appointmentDate);
                                return (_jsx(Paper, { sx: {
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: 'primary.main',
                                        },
                                    }, children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Avatar, { sx: { bgcolor: 'primary.light', color: 'primary.dark' }, children: index + 1 }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", sx: { mb: 0.5 }, children: [_jsxs(Stack, { direction: "row", spacing: 0.5, alignItems: "center", children: [_jsx(PersonIcon, { sx: { fontSize: 18, color: 'text.secondary' } }), _jsxs(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: ["Dr. ", appointment.doctor?.name || appointment.doctorId] })] }), _jsx(Chip, { label: appointment.status, size: "small", color: getStatusColor(appointment.status), variant: "outlined" })] }), _jsxs(Stack, { direction: "row", spacing: 3, sx: { mt: 0.5 }, children: [_jsxs(Stack, { direction: "row", spacing: 0.5, alignItems: "center", children: [_jsx(CalendarTodayIcon, { sx: { fontSize: 16, color: 'text.secondary' } }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: date })] }), _jsxs(Stack, { direction: "row", spacing: 0.5, alignItems: "center", children: [_jsx(AccessTimeIcon, { sx: { fontSize: 16, color: 'text.secondary' } }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: time })] })] }), appointment.notes && (_jsxs(Typography, { variant: "caption", color: "textSecondary", sx: { mt: 0.5, display: 'block' }, children: ["Notes: ", appointment.notes] }))] })] }) }, appointment.id));
                            }) })) }), _jsxs(CardActions, { children: [_jsx(Button, { fullWidth: true, variant: "contained", color: "primary", startIcon: _jsx(AddIcon, {}), onClick: () => navigate('/patient/book-appointment'), children: "Book New Appointment" }), _jsx(Button, { fullWidth: true, variant: "outlined", color: "primary", startIcon: _jsx(ViewListIcon, {}), onClick: () => navigate('/patient/appointments'), children: "View All" })] })] })] }));
};
export default PatientDashboard;
