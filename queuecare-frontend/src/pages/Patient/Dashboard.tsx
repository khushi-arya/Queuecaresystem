import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  Add as AddIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { appointmentAPI } from '@services/api';
import type { Appointment } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    nextAppointmentDate: null as string | null,
  });

  /**
   * Fetch upcoming appointments
   */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) return;

        // Fetch upcoming appointments (only SCHEDULED status)
        const response = await appointmentAPI.getByPatient(user.id, 0, 5);
        const data = response.data;
        const allAppointments = Array.isArray(data) ? data : (data?.content || data?.data || []);
        
        const upcomingAppointments = allAppointments.filter(
          (apt: Appointment) => apt.status === 'SCHEDULED'
        );
        setAppointments(upcomingAppointments);

        // Calculate stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthAppointments = allAppointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
        });

        setStats({
          totalThisMonth: thisMonthAppointments.length,
          nextAppointmentDate:
            upcomingAppointments.length > 0
              ? new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString()
              : null,
        });
      } catch (err: any) {
        console.error('Failed to fetch appointments:', err);
        setError(err.response?.data?.message || 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id]);

  /**
   * Format date and time
   */
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
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
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your appointments and book new ones
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Appointments This Month */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {stats.totalThisMonth}
            </Typography>
            <Typography variant="body2">Appointments This Month</Typography>
          </Paper>
        </Grid>

        {/* Next Appointment */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#fff',
              borderRadius: 2,
            }}
          >
            <EventAvailableIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>Next Appointment</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {stats.nextAppointmentDate || 'No upcoming'}
            </Typography>
          </Paper>
        </Grid>

        {/* CTA Buttons */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
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
            }}
            onClick={() => navigate('/patient/book-appointment')}
          >
            <AddIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>Ready to Book?</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Book Now</Typography>
          </Paper>
        </Grid>

        {/* View All Button */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
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
            }}
            onClick={() => navigate('/patient/appointments')}
          >
            <ViewListIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>View Details</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>All Appointments</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Appointments Card */}
      <Card sx={{ boxShadow: 2 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <CalendarTodayIcon />
            </Avatar>
          }
          title="Upcoming Appointments"
          subheader={`Next ${Math.min(5, appointments.length)} appointments`}
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
        />

        <CardContent>
          {appointments.length === 0 ? (
            <Alert severity="info">
              No upcoming appointments. <strong>Book an appointment now!</strong>
            </Alert>
          ) : (
            <Stack spacing={2}>
              {appointments.map((appointment, index) => {
                const { date, time } = formatDateTime(appointment.appointmentDate);
                return (
                  <Paper
                    key={appointment.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Appointment Number */}
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                        {index + 1}
                      </Avatar>

                      {/* Appointment Details */}
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Dr. {appointment.doctor?.name || appointment.doctorId}
                            </Typography>
                          </Stack>
                          <Chip
                            label={appointment.status}
                            size="small"
                            color={getStatusColor(appointment.status)}
                            variant="outlined"
                          />
                        </Stack>

                        <Stack direction="row" spacing={3} sx={{ mt: 0.5 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="textSecondary">
                              {date}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="textSecondary">
                              {time}
                            </Typography>
                          </Stack>
                        </Stack>

                        {appointment.notes && (
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                            Notes: {appointment.notes}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </CardContent>

        <CardActions>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/patient/book-appointment')}
          >
            Book New Appointment
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<ViewListIcon />}
            onClick={() => navigate('/patient/appointments')}
          >
            View All
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};

export default PatientDashboard;
