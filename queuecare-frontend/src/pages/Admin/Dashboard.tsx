import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';

interface DashboardStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAdmins: number;
  totalAppointmentsThisWeek: number;
  totalAppointmentsThisMonth: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageQueueWaitTime: number;
  completionRatio: number;
}

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  unit?: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
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
  const [error, setError] = useState<string | null>(null);

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
      const appointmentStatsResponse = await adminAPI.getAppointmentStats(
        dateRanges.weekStart,
        dateRanges.now
      );
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
      const monthStatsResponse = await adminAPI.getAppointmentStats(
        dateRanges.monthStart,
        dateRanges.now
      );
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
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
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
  const StatCard: React.FC<StatCard> = ({ title, value, icon, color, unit }) => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        border: `1px solid ${color}30`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography
              color="textSecondary"
              sx={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Box sx={{ color, opacity: 0.5 }}>{icon}</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {unit && (
              <Typography variant="body2" color="textSecondary">
                {unit}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          System overview and key metrics
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} sx={{ mb: 3 }} />}

      {/* User Statistics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          User Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<PeopleIcon sx={{ fontSize: '2rem' }} />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Patients"
              value={stats.totalPatients}
              icon={<PersonAddIcon sx={{ fontSize: '2rem' }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Doctors"
              value={stats.totalDoctors}
              icon={<PeopleIcon sx={{ fontSize: '2rem' }} />}
              color="#f57c00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Admins"
              value={stats.totalAdmins}
              icon={<PersonAddIcon sx={{ fontSize: '2rem' }} />}
              color="#c2185b"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Appointment Statistics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Appointment Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="This Week"
              value={stats.totalAppointmentsThisWeek}
              icon={<ScheduleIcon sx={{ fontSize: '2rem' }} />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="This Month"
              value={stats.totalAppointmentsThisMonth}
              icon={<ScheduleIcon sx={{ fontSize: '2rem' }} />}
              color="#0288d1"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed"
              value={stats.completedAppointments}
              icon={<CheckCircleIcon sx={{ fontSize: '2rem' }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cancelled"
              value={stats.cancelledAppointments}
              icon={<CloseIcon sx={{ fontSize: '2rem' }} />}
              color="#d32f2f"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Performance Metrics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Queue Wait Time"
              value={stats.averageQueueWaitTime}
              icon={<AccessTimeIcon sx={{ fontSize: '2rem' }} />}
              color="#f57c00"
              unit="min"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completion Ratio"
              value={stats.completionRatio}
              icon={<TrendingUpIcon sx={{ fontSize: '2rem' }} />}
              color="#2e7d32"
              unit="%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #1976d220 0%, #1976d210 100%)',
                border: '1px solid #1976d230',
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/admin/users')}
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/admin/doctors')}
                  >
                    Manage Doctors
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/admin/users')}
                  >
                    View Appointments
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="small"
          onClick={fetchDashboardStats}
          sx={{ mt: 2 }}
        >
          Refresh Statistics
        </Button>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
