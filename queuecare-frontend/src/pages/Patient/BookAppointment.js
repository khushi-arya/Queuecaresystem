import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardActions, CardHeader, Stepper, Step, StepLabel, Typography, Button, Grid, Stack, CircularProgress, Alert, Paper, FormControl, InputLabel, Select, MenuItem, Avatar, Chip, TextField, } from '@mui/material';
import { CheckCircle as CheckCircleIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { doctorAPI, appointmentAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import SuccessToast from '@components/SuccessToast';
/**
 * BookAppointment Page
 * Multi-step wizard for booking appointments
 * Route: /patient/book-appointment
 *
 * Steps:
 * 1. Select Doctor - choose from available doctors, filter by specialization
 * 2. Select Date & Time - pick appointment date and time based on doctor's availability
 * 3. Review & Confirm - review appointment details and confirm booking
 */
export const BookAppointment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [tokenNumber, setTokenNumber] = useState('');
    const [bookingState, setBookingState] = useState({
        doctorId: '',
        appointmentDate: '',
        notes: '',
    });
    const steps = ['Select Doctor', 'Select Date & Time', 'Review & Confirm'];
    /**
     * Fetch doctors on component mount
     */
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setDoctorsLoading(true);
                const response = await doctorAPI.getAll(0, 20);
                const data = response.data;
                const doctorsList = Array.isArray(data) ? data : (data?.content || data?.data || []);
                setDoctors(doctorsList);
                // Extract unique specializations
                const specs = Array.from(new Set(doctorsList.map((d) => d.specialization))).filter(Boolean);
                setSpecializations(specs.sort());
            }
            catch (err) {
                console.error('Failed to fetch doctors:', err);
                setError(err.response?.data?.message || 'Failed to load doctors');
            }
            finally {
                setDoctorsLoading(false);
            }
        };
        fetchDoctors();
    }, []);
    /**
     * Fetch available slots when doctor and date are selected
     */
    useEffect(() => {
        const fetchSlots = async () => {
            if (!bookingState.doctorId || !bookingState.appointmentDate.split('T')[0]) {
                return;
            }
            try {
                setSlotsLoading(true);
                const date = `${bookingState.appointmentDate.split('T')[0]}T00:00:00`;
                console.log(`Fetching slots for doctor ${bookingState.doctorId} on ${date}`);
                const response = await appointmentAPI.getAvailableSlots(bookingState.doctorId, date);
                setAvailableSlots(response.data.slots || []);
            }
            catch (err) {
                console.error('Failed to fetch available slots:', err);
                setAvailableSlots([]);
            }
            finally {
                setSlotsLoading(false);
            }
        };
        fetchSlots();
    }, [bookingState.doctorId, bookingState.appointmentDate]);
    /**
     * Get filtered doctors based on specialization
     */
    const filteredDoctors = Array.isArray(doctors)
        ? (specializationFilter
            ? doctors.filter((d) => d.specialization === specializationFilter)
            : doctors)
        : [];
    /**
     * Handle doctor selection
     */
    const handleSelectDoctor = (doctorId) => {
        setBookingState({ ...bookingState, doctorId, appointmentDate: '' });
        setActiveStep(1);
    };
    /**
     * Handle booking confirmation
     */
    const handleConfirmBooking = async () => {
        if (!user?.id)
            return;
        try {
            setLoading(true);
            setError(null);
            const appointmentData = {
                patientId: user.id,
                doctorId: bookingState.doctorId,
                appointmentDate: bookingState.appointmentDate,
                notes: bookingState.notes,
            };
            const response = await appointmentAPI.create(appointmentData);
            const appointment = response.data;
            // Extract token number from response
            setTokenNumber(appointment.tokenNumber || 'N/A');
            setSuccessMessage(`Appointment booked successfully! Your token number is: ${appointment.tokenNumber || 'N/A'}`);
            // Add notification
            addNotification({
                type: 'appointment',
                title: 'Appointment Confirmed',
                message: `Your appointment has been confirmed. Token: ${appointment.tokenNumber || 'N/A'}`,
                actionUrl: '/patient/appointments',
                actionLabel: 'View Appointment',
            });
            setSuccessOpen(true);
            // Reset form and redirect after 3 seconds
            setTimeout(() => {
                navigate('/patient/appointments');
            }, 3000);
        }
        catch (err) {
            console.error('Failed to confirm booking:', err);
            setError(err.response?.data?.message || 'Failed to book appointment');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Get selected doctor details
     */
    const selectedDoctor = doctors.find((d) => String(d.id) === String(bookingState.doctorId));
    /**
     * Get minimum date (today)
     */
    const today = new Date().toISOString().split('T')[0];
    // ============================================
    // STEP 1: Select Doctor
    // ============================================
    const renderSelectDoctor = () => {
        if (doctorsLoading) {
            return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, {}) }));
        }
        return (_jsxs(Box, { children: [_jsxs(FormControl, { fullWidth: true, sx: { mb: 3 }, children: [_jsx(InputLabel, { children: "Filter by Specialization" }), _jsxs(Select, { value: specializationFilter, label: "Filter by Specialization", onChange: (e) => setSpecializationFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All Specializations" }), specializations.map((spec) => (_jsx(MenuItem, { value: spec, children: spec }, spec)))] })] }), _jsx(Grid, { container: true, spacing: 2, children: filteredDoctors.length === 0 ? (_jsx(Grid, { item: true, xs: 12, children: _jsx(Alert, { severity: "info", children: "No doctors available matching your filter" }) })) : (filteredDoctors.map((doctor) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(Card, { sx: {
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-4px)',
                                },
                            }, onClick: () => handleSelectDoctor(String(doctor.id)), children: _jsx(CardContent, { children: _jsxs(Stack, { spacing: 1, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(Avatar, { sx: { bgcolor: 'primary.main', width: 48, height: 48 }, children: doctor.name.charAt(0).toUpperCase() }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: ["Dr. ", doctor.name] }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: doctor.specialization })] })] }), _jsx(Chip, { label: doctor.status === 'ACTIVE' ? 'Available' : 'Not Available', color: doctor.status === 'ACTIVE' ? 'success' : 'error', size: "small", variant: "outlined" }), doctor.shiftStartTime && doctor.shiftEndTime && (_jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["Hours: ", doctor.shiftStartTime, " - ", doctor.shiftEndTime] })), doctor.specialization && (_jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["Specialization: ", doctor.specialization] }))] }) }) }) }, doctor.id)))) })] }));
    };
    // ============================================
    // STEP 2: Select Date & Time
    // ============================================
    const renderSelectDateTime = () => {
        if (!selectedDoctor) {
            return _jsx(Alert, { severity: "error", children: "Doctor not selected" });
        }
        return (_jsxs(Box, { children: [_jsx(Paper, { sx: { p: 2, mb: 3, bgcolor: 'info.light' }, children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Avatar, { sx: { bgcolor: 'primary.main', width: 48, height: 48 }, children: (selectedDoctor.name || 'D').charAt(0).toUpperCase() }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: ["Dr. ", selectedDoctor.name || selectedDoctor.userId] }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: selectedDoctor.specialization })] })] }) }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Select Date", type: "date", value: bookingState.appointmentDate.split('T')[0] || '', onChange: (e) => {
                                    const date = e.target.value;
                                    setBookingState({
                                        ...bookingState,
                                        appointmentDate: date ? `${date}T09:00` : '',
                                    });
                                }, inputProps: { min: today }, InputLabelProps: { shrink: true } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Select Time", type: "time", value: bookingState.appointmentDate
                                    ? bookingState.appointmentDate.split('T')[1]
                                    : '09:00', onChange: (e) => {
                                    const time = e.target.value;
                                    const date = bookingState.appointmentDate.split('T')[0];
                                    if (date) {
                                        setBookingState({
                                            ...bookingState,
                                            appointmentDate: `${date}T${time}`,
                                        });
                                    }
                                }, inputProps: { step: 1800 }, InputLabelProps: { shrink: true } }) })] }), slotsLoading && (_jsxs(Box, { sx: { mt: 3, textAlign: 'center' }, children: [_jsx(CircularProgress, { size: 24, sx: { mr: 1 } }), _jsx(Typography, { variant: "body2", display: "inline", children: "Loading available slots..." })] })), _jsx(TextField, { fullWidth: true, label: "Reason for Visit (Optional)", multiline: true, rows: 3, value: bookingState.notes, onChange: (e) => setBookingState({ ...bookingState, notes: e.target.value }), sx: { mt: 2 } })] }));
    };
    // ============================================
    // STEP 3: Review & Confirm
    // ============================================
    const renderReviewConfirm = () => {
        if (!selectedDoctor) {
            return _jsx(Alert, { severity: "error", children: "Doctor not selected" });
        }
        const appointmentDate = new Date(bookingState.appointmentDate);
        return (_jsxs(Stack, { spacing: 2, children: [_jsxs(Paper, { sx: { p: 2, bgcolor: 'info.light' }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "Doctor Details" }), _jsxs(Stack, { spacing: 1, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "body2", children: "Name:" }), _jsxs(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: ["Dr. ", selectedDoctor.name || selectedDoctor.userId] })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "body2", children: "Specialization:" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: selectedDoctor.specialization })] })] })] }), _jsxs(Paper, { sx: { p: 2, bgcolor: 'success.light' }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "Appointment Details" }), _jsxs(Stack, { spacing: 1, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "body2", children: "Date:" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: appointmentDate.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            }) })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { variant: "body2", children: "Time:" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: appointmentDate.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }) })] })] })] }), bookingState.notes && (_jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1 }, children: "Reason for Visit" }), _jsx(Typography, { variant: "body2", children: bookingState.notes })] })), _jsx(Alert, { severity: "info", children: "Please review your appointment details carefully before confirming." })] }));
    };
    return (_jsxs(Container, { maxWidth: "md", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h3", component: "h1", sx: { fontWeight: 700, mb: 1 }, children: "Book an Appointment" }), _jsx(Typography, { variant: "body1", color: "textSecondary", children: "Follow the steps below to schedule your appointment" })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsx(SuccessToast, { open: successOpen, message: successMessage, onClose: () => setSuccessOpen(false) }), _jsxs(Card, { sx: { boxShadow: 2 }, children: [_jsx(CardHeader, { title: "Booking Steps", titleTypographyProps: { variant: 'subtitle1', sx: { fontWeight: 600 } } }), _jsxs(CardContent, { sx: { pt: 2 }, children: [_jsx(Stepper, { activeStep: activeStep, sx: { mb: 4 }, children: steps.map((label) => (_jsx(Step, { children: _jsx(StepLabel, { children: label }) }, label))) }), _jsxs(Box, { sx: { minHeight: 300 }, children: [activeStep === 0 && renderSelectDoctor(), activeStep === 1 && renderSelectDateTime(), activeStep === 2 && renderReviewConfirm()] })] }), _jsxs(CardActions, { sx: { justifyContent: 'space-between', p: 2 }, children: [_jsx(Button, { onClick: () => {
                                    if (activeStep === 0) {
                                        navigate('/patient/dashboard');
                                    }
                                    else {
                                        setActiveStep(activeStep - 1);
                                    }
                                }, startIcon: _jsx(ArrowBackIcon, {}), children: activeStep === 0 ? 'Cancel' : 'Back' }), _jsx(Button, { disabled: (activeStep === 0 && !bookingState.doctorId) ||
                                    (activeStep === 1 && !bookingState.appointmentDate) ||
                                    loading, onClick: () => {
                                    if (activeStep === 2) {
                                        handleConfirmBooking();
                                    }
                                    else {
                                        setActiveStep(activeStep + 1);
                                    }
                                }, variant: "contained", color: "primary", endIcon: activeStep === 2 ? _jsx(CheckCircleIcon, {}) : _jsx(ArrowForwardIcon, {}), children: activeStep === 2 ? (loading ? 'Confirming...' : 'Confirm Booking') : 'Next' })] })] }), _jsxs("div", { style: { display: 'none' }, "aria-hidden": true, children: [availableSlots.join(','), tokenNumber] })] }));
};
export default BookAppointment;
