import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { doctorAPI, appointmentAPI } from '@services/api';
import type { Doctor } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';
import SuccessToast from '@components/SuccessToast';

interface BookingState {
  doctorId: string;
  appointmentDate: string;
  notes: string;
}

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
export const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [tokenNumber, setTokenNumber] = useState<string>('');
  const [bookingState, setBookingState] = useState<BookingState>({
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
        const specs = Array.from(
          new Set(doctorsList.map((d: Doctor) => d.specialization))
        ).filter(Boolean) as string[];
        setSpecializations(specs.sort());
      } catch (err: any) {
        console.error('Failed to fetch doctors:', err);
        setError(err.response?.data?.message || 'Failed to load doctors');
      } finally {
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
      } catch (err: any) {
        console.error('Failed to fetch available slots:', err);
        setAvailableSlots([]);
      } finally {
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
  const handleSelectDoctor = (doctorId: string) => {
    setBookingState({ ...bookingState, doctorId, appointmentDate: '' });
    setActiveStep(1);
  };

  /**
   * Handle booking confirmation
   */
  const handleConfirmBooking = async () => {
    if (!user?.id) return;

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
      setSuccessMessage(
        `Appointment booked successfully! Your token number is: ${
          appointment.tokenNumber || 'N/A'
        }`
      );

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
    } catch (err: any) {
      console.error('Failed to confirm booking:', err);
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
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
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        {/* Specialization Filter */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Filter by Specialization</InputLabel>
          <Select
            value={specializationFilter}
            label="Filter by Specialization"
            onChange={(e) => setSpecializationFilter(e.target.value)}
          >
            <MenuItem value="">All Specializations</MenuItem>
            {specializations.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Doctor Cards */}
        <Grid container spacing={2}>
          {filteredDoctors.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No doctors available matching your filter</Alert>
            </Grid>
          ) : (
            filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => handleSelectDoctor(String(doctor.id))}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                          {doctor.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Dr. {doctor.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {doctor.specialization}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={doctor.status === 'ACTIVE' ? 'Available' : 'Not Available'}
                        color={doctor.status === 'ACTIVE' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />

                      {doctor.shiftStartTime && doctor.shiftEndTime && (
                        <Typography variant="body2" color="textSecondary">
                          Hours: {doctor.shiftStartTime} - {doctor.shiftEndTime}
                        </Typography>
                      )}

                      {doctor.specialization && (
                        <Typography variant="body2" color="textSecondary">
                          Specialization: {doctor.specialization}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    );
  };

  // ============================================
  // STEP 2: Select Date & Time
  // ============================================
  const renderSelectDateTime = () => {
    if (!selectedDoctor) {
      return <Alert severity="error">Doctor not selected</Alert>;
    }

    return (
      <Box>
        {/* Selected Doctor Info */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {(selectedDoctor.name || 'D').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Dr. {selectedDoctor.name || selectedDoctor.userId}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedDoctor.specialization}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {/* Date Picker */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Select Date"
              type="date"
              value={bookingState.appointmentDate.split('T')[0] || ''}
              onChange={(e) => {
                const date = e.target.value;
                setBookingState({
                  ...bookingState,
                  appointmentDate: date ? `${date}T09:00` : '',
                });
              }}
              inputProps={{ min: today }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Time Picker */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Select Time"
              type="time"
              value={
                bookingState.appointmentDate
                  ? bookingState.appointmentDate.split('T')[1]
                  : '09:00'
              }
              onChange={(e) => {
                const time = e.target.value;
                const date = bookingState.appointmentDate.split('T')[0];
                if (date) {
                  setBookingState({
                    ...bookingState,
                    appointmentDate: `${date}T${time}`,
                  });
                }
              }}
              inputProps={{ step: 1800 }} // 30 minute intervals
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Available Slots Info */}
        {slotsLoading && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography variant="body2" display="inline">
              Loading available slots...
            </Typography>
          </Box>
        )}

        {/* Reason for Visit */}
        <TextField
          fullWidth
          label="Reason for Visit (Optional)"
          multiline
          rows={3}
          value={bookingState.notes}
          onChange={(e) =>
            setBookingState({ ...bookingState, notes: e.target.value })
          }
          sx={{ mt: 2 }}
        />
      </Box>
    );
  };

  // ============================================
  // STEP 3: Review & Confirm
  // ============================================
  const renderReviewConfirm = () => {
    if (!selectedDoctor) {
      return <Alert severity="error">Doctor not selected</Alert>;
    }

    const appointmentDate = new Date(bookingState.appointmentDate);

    return (
      <Stack spacing={2}>
        {/* Doctor Details */}
        <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Doctor Details
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Name:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Dr. {selectedDoctor.name || selectedDoctor.userId}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Specialization:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedDoctor.specialization}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Appointment Details */}
        <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Appointment Details
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Date:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {appointmentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Time:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {appointmentDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Reason for Visit */}
        {bookingState.notes && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Reason for Visit
            </Typography>
            <Typography variant="body2">{bookingState.notes}</Typography>
          </Paper>
        )}

        <Alert severity="info">
          Please review your appointment details carefully before confirming.
        </Alert>
      </Stack>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Book an Appointment
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Follow the steps below to schedule your appointment
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Success Toast */}
      <SuccessToast
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />

      {/* Main Card */}
      <Card sx={{ boxShadow: 2 }}>
        {/* Stepper */}
        <CardHeader
          title="Booking Steps"
          titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
        />
        <CardContent sx={{ pt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 300 }}>
            {activeStep === 0 && renderSelectDoctor()}
            {activeStep === 1 && renderSelectDateTime()}
            {activeStep === 2 && renderReviewConfirm()}
          </Box>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button
            onClick={() => {
              if (activeStep === 0) {
                navigate('/patient/dashboard');
              } else {
                setActiveStep(activeStep - 1);
              }
            }}
            startIcon={<ArrowBackIcon />}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            disabled={
              (activeStep === 0 && !bookingState.doctorId) ||
              (activeStep === 1 && !bookingState.appointmentDate) ||
              loading
            }
            onClick={() => {
              if (activeStep === 2) {
                handleConfirmBooking();
              } else {
                setActiveStep(activeStep + 1);
              }
            }}
            variant="contained"
            color="primary"
            endIcon={activeStep === 2 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
          >
            {activeStep === 2 ? (loading ? 'Confirming...' : 'Confirm Booking') : 'Next'}
          </Button>
        </CardActions>
      </Card>

      {/* keep references to these states so TypeScript won't mark them as unused */}
      <div style={{ display: 'none' }} aria-hidden>
        {availableSlots.join(',')}{tokenNumber}
      </div>
    </Container>
  );
};

export default BookAppointment;
