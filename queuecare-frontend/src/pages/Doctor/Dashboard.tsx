import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useQueueSubscription } from '@hooks/useQueueSubscription';
import { tokenAPI } from '@services/api';
import type { DoctorToken } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';

interface QueueStats {
  waiting: number;
  inProgress: number;
  completed: number;
  missed: number;
  averageWaitTime: number;
  completionRate: number;
}

interface CurrentPatient {
  tokenId: string;
  patientName: string;
  position: number;
  timeInQueue: number; // minutes
  calledAt: string;
}

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, queueUpdates } = useQueueSubscription();
  const [queueStats, setQueueStats] = useState<QueueStats>({
    waiting: 0,
    inProgress: 0,
    completed: 0,
    missed: 0,
    averageWaitTime: 0,
    completionRate: 0,
  });
  const [currentPatient, setCurrentPatient] = useState<CurrentPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callingNext, setCallingNext] = useState(false);

  /**
   * Fetch queue statistics for today
   */
  const fetchQueueStats = useCallback(async () => {
    try {
      setError(null);

      if (!user?.id) return;

      // Fetch today's queue tokens
      const response = await tokenAPI.getQueueTokens(user.id, 0, 100);
      const tokens: DoctorToken[] = response.data.content || [];

      // Calculate statistics
      const waiting = tokens.filter((t) => t.status === 'WAITING').length;
      const inProgress = tokens.filter((t) => t.status === 'IN_CONSULTATION').length;
      const completed = tokens.filter((t) => t.status === 'COMPLETED').length;
      const missed = tokens.filter((t) => t.status === 'CANCELLED').length;

      // Calculate average wait time
      const completedTokens = tokens.filter((t) => t.status === 'COMPLETED');
      let averageWaitTime = 0;
      if (completedTokens.length > 0) {
        const totalWaitTime = completedTokens.reduce((acc, token) => {
          const issuedTime = new Date(token.issuedAt).getTime();
          const calledTime = token.calledAt ? new Date(token.calledAt).getTime() : issuedTime;
          return acc + (calledTime - issuedTime);
        }, 0);
        averageWaitTime = Math.round(totalWaitTime / completedTokens.length / (1000 * 60)); // Convert to minutes
      }

      // Calculate completion rate
      const total = tokens.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setQueueStats({
        waiting,
        inProgress,
        completed,
        missed,
        averageWaitTime,
        completionRate,
      });

      // Find current patient (IN_CONSULTATION status)
      const currentToken = tokens.find((t) => t.status === 'IN_CONSULTATION');
      if (currentToken) {
        const timeInQueue = currentToken.calledAt
          ? Math.round((new Date().getTime() - new Date(currentToken.calledAt).getTime()) / (1000 * 60))
          : 0;

        setCurrentPatient({
          tokenId: currentToken.id,
          patientName: `Patient #${currentToken.tokenNumber}`, // Will be replaced with actual name from API
          position: 1,
          timeInQueue,
          calledAt: currentToken.calledAt || new Date().toISOString(),
        });
      } else {
        setCurrentPatient(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch queue stats:', err);
      setError(err.response?.data?.message || 'Failed to load queue statistics');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    fetchQueueStats();
  }, [fetchQueueStats]);

  /**
   * Refresh stats when queue updates arrive via WebSocket
   */
  useEffect(() => {
    if (queueUpdates) {
      fetchQueueStats();
    }
  }, [queueUpdates, fetchQueueStats]);

  /**
   * Handle call next patient
   */
  const handleCallNextPatient = async () => {
    try {
      setCallingNext(true);
      setError(null);

      if (!user?.id) return;

      await tokenAPI.callNextToken(user.id);

      // Refresh stats
      await fetchQueueStats();
    } catch (err: any) {
      console.error('Failed to call next patient:', err);
      setError(err.response?.data?.message || 'Failed to call next patient');
    } finally {
      setCallingNext(false);
    }
  };

  /**
   * Format time in queue
   */
  const formatTimeInQueue = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading queue statistics...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Doctor Dashboard
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={isConnected ? <CheckCircleIcon /> : <CloseIcon />}
            label={isConnected ? 'Real-time Connected' : 'Offline'}
            color={isConnected ? 'success' : 'default'}
            variant="outlined"
          />
          <Typography variant="caption" color="textSecondary">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Current Patient Card - Call Next CTA */}
      {currentPatient ? (
        <Card sx={{ mb: 4, backgroundColor: 'primary.light', borderRadius: 2 }}>
          <CardHeader
            avatar={<PersonAddIcon sx={{ color: 'primary.main' }} />}
            title="Currently in Progress"
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Patient Name
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {currentPatient.patientName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Time in Queue
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon fontSize="small" color="primary" />
                  <Typography variant="h6">{formatTimeInQueue(currentPatient.timeInQueue)}</Typography>
                </Stack>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
                onClick={() => navigate('/doctor/queue-management')}
              >
                View Queue Management
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 4, backgroundColor: 'success.light', borderRadius: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                No Patients Currently in Progress
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {queueStats.waiting > 0
                  ? `You have ${queueStats.waiting} waiting patient(s)`
                  : 'No patients waiting'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
                onClick={handleCallNextPatient}
                disabled={queueStats.waiting === 0 || callingNext}
              >
                {callingNext ? <CircularProgress size={24} /> : 'Call Next Patient'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Queue Summary Grid */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
        Today's Queue Summary
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Waiting */}
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {queueStats.waiting}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Waiting
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* In Progress */}
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {queueStats.inProgress}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Completed */}
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {queueStats.completed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Missed */}
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CloseIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {queueStats.missed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Missed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Performance Metrics
      </Typography>
      <Grid container spacing={2}>
        {/* Average Wait Time */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'info.light',
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccessTimeIcon sx={{ color: 'info.main', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Average Wait Time
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {queueStats.averageWaitTime} min
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Rate */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'success.light',
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Completion Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {queueStats.completionRate}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Links */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Quick Links
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/doctor/queue-management')}
              sx={{ py: 2 }}
            >
              Queue Management
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/doctor/appointments')}
              sx={{ py: 2 }}
            >
              My Appointments
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/doctor/statistics')}
              sx={{ py: 2 }}
            >
              Statistics
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/doctor/profile')}
              sx={{ py: 2 }}
            >
              My Profile
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DoctorDashboard;
