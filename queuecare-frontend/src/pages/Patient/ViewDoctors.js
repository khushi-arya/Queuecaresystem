import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Container, Box, Grid, Card, CardContent, CardHeader, Typography, Button, Stack, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Avatar, Chip, Rating, Dialog, DialogTitle, DialogContent, DialogActions, Divider, } from '@mui/material';
import { School as SchoolIcon, LocationOn as LocationOnIcon, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import PaginationControls from '@components/PaginationControls';
/**
 * ViewDoctors Page
 * Browse and search for available doctors
 * Route: /patient/doctors
 *
 * Features:
 * - Display doctor cards with details
 * - Filter by specialization and status
 * - View doctor details in modal
 * - Pagination controls
 */
export const ViewDoctors = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const isFirstRender = useRef(true);
    // Filters
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('');
    const [specializations, setSpecializations] = useState([]);
    // Detail Modal
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    /**
     * Fetch doctors
     */
    const fetchDoctors = async (pageNum) => {
        try {
            setLoading(true);
            setError(null);
            const params = {
                page: pageNum - 1,
                size: pageSize,
            };
            if (specializationFilter) {
                params.specialization = specializationFilter;
            }
            if (availabilityFilter) {
                params.isAvailable = availabilityFilter === 'available';
            }
            const response = await doctorAPI.getAll(params.page, params.size, params.specialization, params.isAvailable);
            const data = response.data;
            const doctorsList = Array.isArray(data) ? data : (data?.content || []);
            const totalPgs = Array.isArray(data) ? 1 : (data?.totalPages || 1);
            const totalItms = Array.isArray(data) ? data.length : (data?.totalElements || 0);
            setDoctors(doctorsList);
            setTotalPages(totalPgs);
            setTotalItems(totalItms);
            // Extract unique specializations
            if (pageNum === 1) {
                const allResponse = await doctorAPI.getAll(0, 100);
                const allData = allResponse.data;
                const allDoctors = Array.isArray(allData) ? allData : (allData?.content || []);
                const specs = Array.from(new Set(allDoctors.map((d) => d.specialization).filter(Boolean)));
                setSpecializations(specs.sort());
            }
        }
        catch (err) {
            console.error('Failed to fetch doctors:', err);
            setError(err.response?.data?.message || 'Failed to load doctors');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Load doctors on mount
     */
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        fetchDoctors(page);
    }, [page, pageSize]);
    // Load on filter change - reset to page 1
    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        }
        else {
            fetchDoctors(1);
        }
    }, [specializationFilter, availabilityFilter]);
    /**
     * Open doctor detail modal
     */
    const handleViewDetails = (doctor) => {
        setSelectedDoctor(doctor);
        setDetailDialogOpen(true);
    };
    /**
     * Close doctor detail modal
     */
    const handleCloseDetail = () => {
        setDetailDialogOpen(false);
        setSelectedDoctor(null);
    };
    /**
     * Navigate to booking page with selected doctor
     */
    const handleBookAppointment = (doctorId) => {
        navigate('/patient/book-appointment', { state: { selectedDoctorId: String(doctorId) } });
        handleCloseDetail();
    };
    if (loading && page === 1) {
        return (_jsx(Container, { maxWidth: "lg", sx: { py: 4, display: 'flex', justifyContent: 'center' }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h3", component: "h1", sx: { fontWeight: 700, mb: 1 }, children: "Find a Doctor" }), _jsx(Typography, { variant: "body1", color: "textSecondary", children: "Search and book appointments with our experienced doctors" })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsxs(Card, { sx: { mb: 3, boxShadow: 1 }, children: [_jsx(CardHeader, { title: "Filters", titleTypographyProps: { variant: 'subtitle1', sx: { fontWeight: 600 } } }), _jsx(CardContent, { children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Specialization" }), _jsxs(Select, { value: specializationFilter, label: "Specialization", onChange: (e) => setSpecializationFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All Specializations" }), specializations.map((spec) => (_jsx(MenuItem, { value: spec, children: spec }, spec)))] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Availability" }), _jsxs(Select, { value: availabilityFilter, label: "Availability", onChange: (e) => setAvailabilityFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "available", children: "Available" }), _jsx(MenuItem, { value: "unavailable", children: "Not Available" })] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, sx: { display: 'flex', alignItems: 'flex-end' }, children: _jsx(Button, { fullWidth: true, variant: "outlined", onClick: () => {
                                            setSpecializationFilter('');
                                            setAvailabilityFilter('');
                                        }, children: "Clear Filters" }) })] }) })] }), doctors.length === 0 ? (_jsx(Box, { sx: { textAlign: 'center', py: 4 }, children: _jsx(Alert, { severity: "info", children: "No doctors found matching your criteria" }) })) : (_jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: doctors.map((doctor) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsxs(Card, { sx: {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-8px)',
                            },
                        }, children: [_jsx(CardHeader, { avatar: _jsx(Avatar, { sx: {
                                        bgcolor: doctor.status === 'ACTIVE' ? 'success.main' : 'error.main',
                                        width: 56,
                                        height: 56,
                                        fontSize: '1.5rem',
                                    }, children: (doctor.name || String(doctor.userId)).charAt(0).toUpperCase() }), title: `Dr. ${doctor.name || doctor.userId}`, subheader: doctor.specialization, action: _jsx(Chip, { label: doctor.status === 'ACTIVE' ? 'Available' : 'Not Available', color: doctor.status === 'ACTIVE' ? 'success' : 'error', size: "small" }), titleTypographyProps: { variant: 'h6', sx: { fontWeight: 600 } } }), _jsx(CardContent, { sx: { flex: 1 }, children: _jsxs(Stack, { spacing: 2, children: [doctor.experience !== undefined && doctor.experience > 0 && (_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(SchoolIcon, { sx: { fontSize: 18, color: 'text.secondary' } }), _jsxs(Typography, { variant: "body2", color: "textSecondary", children: [doctor.experience, " years experience"] })] })), doctor.averageRating && (_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Rating, { value: doctor.averageRating, readOnly: true, size: "small" }), _jsxs(Typography, { variant: "body2", color: "textSecondary", children: [doctor.averageRating.toFixed(1), "/5.0 (", doctor.totalReviews || 0, " reviews)"] })] })), doctor.hospitalAffiliation && (_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "flex-start", children: [_jsx(LocationOnIcon, { sx: { fontSize: 18, color: 'text.secondary', mt: 0.5 } }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: doctor.hospitalAffiliation })] })), doctor.bio && (_jsx(Typography, { variant: "body2", color: "textSecondary", sx: {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }, children: doctor.bio })), (doctor.shiftStartTime || doctor.shiftEndTime) && (_jsxs(Typography, { variant: "caption", color: "textSecondary", display: "block", children: [_jsx("strong", { children: "Hours:" }), " ", doctor.shiftStartTime || 'N/A', " - ", doctor.shiftEndTime || 'N/A'] }))] }) }), _jsx(Divider, {}), _jsxs(Box, { sx: { p: 2, display: 'flex', gap: 1 }, children: [_jsx(Button, { fullWidth: true, variant: "outlined", color: "primary", size: "small", onClick: () => handleViewDetails(doctor), children: "View Profile" }), _jsx(Button, { fullWidth: true, variant: "contained", color: "primary", size: "small", onClick: () => handleBookAppointment(doctor.id), children: "Book Now" })] })] }) }, doctor.id))) })), totalPages > 1 && (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', my: 4 }, children: _jsx(PaginationControls, { page: page, totalPages: totalPages, pageSize: pageSize, totalItems: totalItems, onPageChange: setPage, onPageSizeChange: setPageSize, pageSizeOptions: [12, 24, 36] }) })), _jsxs(Dialog, { open: detailDialogOpen, onClose: handleCloseDetail, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { pb: 1 }, children: _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Doctor Profile" }) }), _jsx(DialogContent, { sx: { pt: 2 }, children: selectedDoctor && (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "flex-start", children: [_jsx(Avatar, { sx: {
                                                bgcolor: selectedDoctor.status === 'ACTIVE' ? 'success.main' : 'error.main',
                                                width: 64,
                                                height: 64,
                                                fontSize: '2rem',
                                            }, children: (selectedDoctor.name || String(selectedDoctor.userId)).charAt(0).toUpperCase() }), _jsxs(Stack, { spacing: 0.5, sx: { flex: 1 }, children: [_jsxs(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: ["Dr. ", selectedDoctor.name || selectedDoctor.userId] }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: selectedDoctor.specialization }), _jsx(Chip, { label: selectedDoctor.status === 'ACTIVE' ? 'Available' : 'Not Available', color: selectedDoctor.status === 'ACTIVE' ? 'success' : 'error', size: "small", sx: { width: 'fit-content' } })] })] }), _jsx(Divider, {}), _jsxs(Stack, { spacing: 1.5, children: [selectedDoctor.experience > 0 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary' }, children: "Experience" }), _jsxs(Typography, { variant: "body2", children: [selectedDoctor.experience, " years"] })] })), selectedDoctor.averageRating && (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary' }, children: "Rating" }), _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", sx: { mt: 0.5 }, children: [_jsx(Rating, { value: selectedDoctor.averageRating, readOnly: true, size: "small" }), _jsxs(Typography, { variant: "body2", children: [selectedDoctor.averageRating.toFixed(1), "/5.0 (", selectedDoctor.totalReviews || 0, " reviews)"] })] })] })), selectedDoctor.licenseNumber && (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary' }, children: "License Number" }), _jsx(Typography, { variant: "body2", children: selectedDoctor.licenseNumber })] })), selectedDoctor.hospitalAffiliation && (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary' }, children: "Hospital Affiliation" }), _jsx(Typography, { variant: "body2", children: selectedDoctor.hospitalAffiliation })] })), (selectedDoctor.shiftStartTime || selectedDoctor.shiftEndTime) && (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary' }, children: "Working Hours" }), _jsxs(Typography, { variant: "body2", children: [selectedDoctor.shiftStartTime || 'N/A', " - ", selectedDoctor.shiftEndTime || 'N/A'] })] })), selectedDoctor.qualifications && (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary' }, children: "Qualifications" }), _jsx(Typography, { variant: "body2", children: selectedDoctor.qualifications })] })), selectedDoctor.bio && (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary' }, children: "Bio" }), _jsx(Typography, { variant: "body2", children: selectedDoctor.bio })] }))] })] })) }), _jsxs(DialogActions, { sx: { p: 2, pt: 0 }, children: [_jsx(Button, { onClick: handleCloseDetail, variant: "outlined", children: "Close" }), selectedDoctor && (_jsx(Button, { onClick: () => handleBookAppointment(selectedDoctor.id), variant: "contained", color: "primary", children: "Book Now" }))] })] })] }));
};
export default ViewDoctors;
