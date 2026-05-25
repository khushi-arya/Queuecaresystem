import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Grid, } from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { appointmentAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import PaginationControls from '@components/PaginationControls';
export const DoctorMyAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    /**
     * Fetch appointments
     */
    const fetchAppointments = async (pageNum = 1, pageSizeNum = 20, status, startDate, endDate) => {
        try {
            setLoading(true);
            setError(null);
            if (!user?.id)
                return;
            // Fetch doctor's appointments
            const response = await appointmentAPI.getByDoctor(user.id, pageNum - 1, pageSizeNum);
            const data = response.data;
            const fetchedAppointments = Array.isArray(data) ? data : (data?.content || data?.data || []);
            const totalItms = Array.isArray(data) ? data.length : (data?.totalElements || 0);
            // Apply client-side filtering (if any additional filtering is needed)
            let filtered = [...fetchedAppointments];
            if (status) {
                filtered = filtered.filter((apt) => apt.status === status);
            }
            if (startDate) {
                const start = new Date(startDate);
                filtered = filtered.filter((apt) => new Date(apt.appointmentDate) >= start);
            }
            if (endDate) {
                const end = new Date(endDate);
                filtered = filtered.filter((apt) => new Date(apt.appointmentDate) <= end);
            }
            if (searchTerm) {
                filtered = filtered.filter((apt) => apt.id.toString().toLowerCase().includes(searchTerm.toLowerCase()));
            }
            setAppointments(filtered);
            setTotalElements(totalItms);
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
     * Initialize on mount
     */
    useEffect(() => {
        fetchAppointments(page, pageSize, statusFilter, dateFrom, dateTo);
    }, [user?.id, page, pageSize, statusFilter, dateFrom, dateTo]);
    /**
     * Handle filter changes
     */
    const handleApplyFilters = () => {
        setPage(1);
        fetchAppointments(1, pageSize, statusFilter, dateFrom, dateTo);
    };
    /**
     * Handle pagination
     */
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPage(1);
    };
    /**
     * Format date and time
     */
    const formatDateTime = (dateTime) => {
        if (!dateTime)
            return 'N/A';
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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
            default:
                return 'default';
        }
    };
    if (loading && page === 1 && appointments.length === 0) {
        return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4, textAlign: 'center' }, children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "body1", sx: { mt: 2 }, children: "Loading appointments..." })] }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, sx: { fontWeight: 'bold', mb: 4 }, children: "My Appointments" }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsxs(Card, { sx: { mb: 3 }, children: [_jsx(CardHeader, { title: "Filters" }), _jsxs(CardContent, { children: [_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(TextField, { fullWidth: true, label: "Search", placeholder: "Search by ID", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                                            }, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Status" }), _jsxs(Select, { value: statusFilter, label: "Status", onChange: (e) => setStatusFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "SCHEDULED", children: "Scheduled" }), _jsx(MenuItem, { value: "COMPLETED", children: "Completed" }), _jsx(MenuItem, { value: "CANCELLED", children: "Cancelled" }), _jsx(MenuItem, { value: "NO_SHOW", children: "No Show" })] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(TextField, { fullWidth: true, type: "date", label: "From Date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), InputLabelProps: { shrink: true }, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(TextField, { fullWidth: true, type: "date", label: "To Date", value: dateTo, onChange: (e) => setDateTo(e.target.value), InputLabelProps: { shrink: true }, size: "small" }) })] }), _jsxs(Box, { sx: { mt: 2, display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "contained", onClick: handleApplyFilters, disabled: loading, children: "Apply Filters" }), _jsx(Button, { variant: "outlined", onClick: () => {
                                            setSearchTerm('');
                                            setStatusFilter('');
                                            setDateFrom('');
                                            setDateTo('');
                                            setPage(1);
                                        }, children: "Reset" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { title: `Appointments (${totalElements})`, titleTypographyProps: { variant: 'h6', sx: { fontWeight: 'bold' } } }), _jsxs(CardContent, { children: [_jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: 'primary.light' }, children: [_jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Date & Time" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Patient" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Status" }), _jsx(TableCell, { sx: { fontWeight: 'bold' }, children: "Notes" }), _jsx(TableCell, { sx: { fontWeight: 'bold', textAlign: 'center' }, children: "Actions" })] }) }), _jsx(TableBody, { children: appointments.map((apt) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: formatDateTime(apt.appointmentDate) }), _jsx(TableCell, { children: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : `Patient #${apt.patientId}` }), _jsx(TableCell, { children: _jsx(Chip, { label: apt.status, color: getStatusColor(apt.status), size: "small" }) }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", sx: { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }, children: apt.notes || '-' }) }), _jsx(TableCell, { align: "center", children: _jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(EditIcon, {}), children: "View" }) })] }, apt.id))) })] }) }), appointments.length === 0 && (_jsx(Box, { sx: { textAlign: 'center', py: 4 }, children: _jsx(Typography, { color: "textSecondary", children: "No appointments found" }) }))] })] }), totalElements > 0 && (_jsx(Box, { sx: { mt: 3 }, children: _jsx(PaginationControls, { page: page, totalPages: Math.ceil(totalElements / pageSize), pageSize: pageSize, totalItems: totalElements, onPageChange: handlePageChange, onPageSizeChange: handlePageSizeChange }) }))] }));
};
export default DoctorMyAppointments;
