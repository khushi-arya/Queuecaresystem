import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, Grid, Stack, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Menu, ListItemIcon, ListItemText, MenuItem as ContextMenuItem, } from '@mui/material';
import { MoreVert as MoreVertIcon, Close as CloseIcon, Visibility as VisibilityIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { appointmentAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import ConfirmDialog from '@components/ConfirmDialog';
import PaginationControls from '@components/PaginationControls';
/**
 * MyAppointments Page
 * Displays patient's appointment history with filtering and management options
 * Route: /patient/appointments
 *
 * Features:
 * - List all patient appointments
 * - Filter by date range and status
 * - Cancel appointments (SCHEDULED only)
 * - Pagination controls
 */
export const PatientMyAppointments = () => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // Context menu
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    // Confirm dialog
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogLoading, setConfirmDialogLoading] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const statusOptions = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'];
    /**
     * Fetch appointments
     */
    const fetchAppointments = async (pageNum) => {
        try {
            setLoading(true);
            setError(null);
            if (!user?.id)
                return;
            const params = {
                page: pageNum - 1,
                size: pageSize,
                sort: 'appointmentDate,desc',
            };
            if (statusFilter) {
                params.status = statusFilter;
            }
            if (startDate) {
                params.startDate = startDate;
            }
            if (endDate) {
                params.endDate = endDate;
            }
            const response = await appointmentAPI.getByPatient(user.id, pageNum - 1, pageSize);
            // Handle both Page object and direct Array response
            const data = response.data;
            const fetchedAppointments = Array.isArray(data) ? data : (data?.content || data?.data || []);
            const totalPgs = Array.isArray(data) ? 1 : (data?.totalPages || 1);
            const totalItms = Array.isArray(data) ? data.length : (data?.totalElements || 0);
            // Apply client-side filtering
            let filtered = [...fetchedAppointments];
            if (statusFilter) {
                filtered = filtered.filter(apt => apt.status === statusFilter);
            }
            if (startDate) {
                const start = new Date(startDate);
                filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                filtered = filtered.filter(apt => new Date(apt.appointmentDate) <= end);
            }
            setAppointments(filtered);
            setTotalPages(totalPgs);
            setTotalItems(totalItms);
        }
        catch (err) {
            console.error('Failed to fetch appointments:', err);
            setError(err.response?.data?.message || 'Failed to load appointments');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Load appointments when filters change - reset to page 1
     */
    useEffect(() => {
        setPage(1);
        fetchAppointments(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, statusFilter, startDate, endDate]);
    /**
     * Load appointments when page or pageSize changes (skip initial mount handled above)
     */
    const isFirstRender = React.useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        fetchAppointments(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);
    /**
     * Handle cancel appointment
     */
    const handleCancelAppointment = async () => {
        if (!appointmentToCancel)
            return;
        try {
            setConfirmDialogLoading(true);
            await appointmentAPI.cancel(appointmentToCancel, 'Cancelled by patient');
            // Add notification
            addNotification({
                type: 'appointment',
                title: 'Appointment Cancelled',
                message: 'Your appointment has been successfully cancelled.',
            });
            // Refresh list
            setConfirmDialogOpen(false);
            setAppointmentToCancel(null);
            fetchAppointments(page);
        }
        catch (err) {
            console.error('Failed to cancel appointment:', err);
            setError(err.response?.data?.message || 'Failed to cancel appointment');
        }
        finally {
            setConfirmDialogLoading(false);
        }
    };
    /**
     * Open context menu
     */
    const handleOpenContextMenu = (event, appointmentId) => {
        setAnchorEl(event.currentTarget);
        setSelectedAppointmentId(appointmentId);
    };
    /**
     * Close context menu
     */
    const handleCloseContextMenu = () => {
        setAnchorEl(null);
        setSelectedAppointmentId(null);
    };
    /**
     * Open confirm dialog for cancellation
     */
    const handleConfirmCancel = (appointmentId) => {
        setAppointmentToCancel(appointmentId);
        setConfirmDialogOpen(true);
        handleCloseContextMenu();
    };
    /**
     * Format date and time
     */
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
            case 'RESCHEDULED':
                return 'secondary';
            default:
                return 'default';
        }
    };
    if (loading) {
        return (_jsx(Container, { maxWidth: "lg", sx: { py: 4, display: 'flex', justifyContent: 'center' }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h3", component: "h1", sx: { fontWeight: 700, mb: 1 }, children: "My Appointments" }), _jsx(Typography, { variant: "body1", color: "textSecondary", children: "View and manage all your appointments" })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsxs(Card, { sx: { mb: 3, boxShadow: 1 }, children: [_jsx(CardHeader, { title: "Filters", titleTypographyProps: { variant: 'subtitle1', sx: { fontWeight: 600 } } }), _jsx(CardContent, { children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Status" }), _jsxs(Select, { value: statusFilter, label: "Status", onChange: (e) => setStatusFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All Statuses" }), statusOptions.map((status) => (_jsx(MenuItem, { value: status, children: status }, status)))] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(TextField, { fullWidth: true, label: "Start Date", type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), InputLabelProps: { shrink: true } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(TextField, { fullWidth: true, label: "End Date", type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), InputLabelProps: { shrink: true } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, sx: { display: 'flex', alignItems: 'flex-end' }, children: _jsx(Button, { fullWidth: true, variant: "outlined", onClick: () => {
                                            setStatusFilter('');
                                            setStartDate('');
                                            setEndDate('');
                                        }, children: "Clear Filters" }) })] }) })] }), _jsx(Card, { sx: { boxShadow: 2 }, children: _jsx(CardContent, { sx: { p: 0 }, children: appointments.length === 0 ? (_jsx(Box, { sx: { p: 3, textAlign: 'center' }, children: _jsx(Alert, { severity: "info", children: "No appointments found" }) })) : (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { sx: { bgcolor: 'primary.light' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: '#fff', fontWeight: 600 }, children: "Date & Time" }), _jsx(TableCell, { sx: { color: '#fff', fontWeight: 600 }, children: "Doctor" }), _jsx(TableCell, { sx: { color: '#fff', fontWeight: 600 }, children: "Status" }), _jsx(TableCell, { sx: { color: '#fff', fontWeight: 600 }, children: "Actions" })] }) }), _jsx(TableBody, { children: appointments.map((appointment) => (_jsxs(TableRow, { sx: {
                                            '&:hover': { bgcolor: 'action.hover' },
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                        }, children: [_jsx(TableCell, { children: _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Avatar, { sx: { bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }, children: new Date(appointment.appointmentDate).getDate() }), _jsx(Typography, { variant: "body2", children: formatDateTime(appointment.appointmentDate) })] }) }), _jsx(TableCell, { children: _jsxs(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: ["Dr. ", appointment.doctor?.name || appointment.doctorId] }) }), _jsx(TableCell, { children: _jsx(Chip, { label: appointment.status, size: "small", color: getStatusColor(appointment.status), variant: "outlined" }) }), _jsx(TableCell, { children: _jsx(IconButton, { size: "small", onClick: (e) => handleOpenContextMenu(e, appointment.id), children: _jsx(MoreVertIcon, { fontSize: "small" }) }) })] }, appointment.id))) })] }) })) }) }), _jsx(Box, { sx: { mt: 3, display: 'flex', justifyContent: 'center' }, children: _jsx(PaginationControls, { page: page, totalPages: totalPages, pageSize: pageSize, totalItems: totalItems, onPageChange: setPage, onPageSizeChange: setPageSize }) }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleCloseContextMenu, children: [_jsxs(ContextMenuItem, { children: [_jsx(ListItemIcon, { children: _jsx(VisibilityIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "View Details" })] }), selectedAppointmentId &&
                        appointments.find((apt) => apt.id === selectedAppointmentId)?.status === 'SCHEDULED' && (_jsxs(ContextMenuItem, { onClick: () => {
                            if (selectedAppointmentId) {
                                handleConfirmCancel(selectedAppointmentId);
                            }
                        }, children: [_jsx(ListItemIcon, { children: _jsx(CloseIcon, { fontSize: "small", color: "error" }) }), _jsx(ListItemText, { children: _jsx(Typography, { color: "error", children: "Cancel Appointment" }) })] }))] }), _jsx(ConfirmDialog, { open: confirmDialogOpen, title: "Cancel Appointment", message: "Are you sure you want to cancel this appointment? This action cannot be undone.", type: "warning", confirmText: "Yes, Cancel", cancelText: "No, Keep It", confirmLoading: confirmDialogLoading, onConfirm: handleCancelAppointment, onCancel: () => {
                    setConfirmDialogOpen(false);
                    setAppointmentToCancel(null);
                } })] }));
};
export default PatientMyAppointments;
