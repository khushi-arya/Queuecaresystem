import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
} from '@mui/material';
import ErrorAlert from '@components/ErrorAlert';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { useNotificationSubscription } from '@hooks/useNotificationSubscription';
import { tokenAPI } from '@services/api';

interface QueueToken {
  id: string;
  patientId: string;
  doctorId: string;
  tokenNumber: string;
  position: number;
  status: 'WAITING' | 'CALLED' | 'COMPLETED' | 'SKIPPED';
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
}

interface QueueStatus {
  totalInQueue: number;
  estimatedWaitTime: number; // in minutes
  currentToken?: QueueToken;
}

/**
 * QueueStatus Component
 * Displays patient's current queue position and estimated wait time
 * Shows if patient has been called in queue
 *
 * Features:
 * - Display position in queue
 * - Estimated wait time
 * - Real-time updates via WebSocket
 * - "Called in queue" notifications
 *
 * @example
 * <QueueStatus />
 */
export const QueueStatus: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { isConnected } = useNotificationSubscription();

  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBeenCalled, setHasBeenCalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current queue status
   */
  const fetchQueueStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      // Get all tokens for the patient
      const response = await tokenAPI.getAll(0, 100, 'WAITING');
      const tokens = response.data.content || [];

      // Find patient's active token
      const patientToken = tokens.find((t: QueueToken) => t.patientId === user.id);

      if (!patientToken) {
        setQueueStatus(null);
        return;
      }

      // Calculate queue status
      const waitingTokens = tokens.filter((t: QueueToken) => t.status === 'WAITING');
      const patientPosition = waitingTokens.findIndex((t: QueueToken) => t.id === patientToken.id) + 1;

      // Estimate wait time: 5 minutes per person ahead
      const estimatedWaitTime = (patientPosition > 1 ? patientPosition - 1 : 0) * 5;

      setQueueStatus({
        totalInQueue: waitingTokens.length,
        estimatedWaitTime,
        currentToken: patientToken,
      });

      // Check if patient has been called
      if (patientToken.status === 'CALLED' && !hasBeenCalled) {
        setHasBeenCalled(true);
        addNotification({
          type: 'appointment',
          title: 'You\'ve Been Called!',
          message: `Token ${patientToken.tokenNumber} is now being called. Please proceed to the examination room.`,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch queue status:', err);
      setError(err.response?.data?.message || 'Failed to load queue status');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle WebSocket queue status updates
   */
  const handleQueueStatusUpdate = (event: Event) => {
    console.log('Queue status update event received:', event);
    fetchQueueStatus();
  };

  /**
   * Handle token status changes from WebSocket
   */
  const handleTokenStatusChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Token status change received:', customEvent.detail);
    
    if (customEvent.detail?.patientId === user?.id) {
      // Refetch if this is for the current patient
      fetchQueueStatus();
    }
  };

  /**
   * Fetch queue status on mount and set up polling
   */
  useEffect(() => {
    fetchQueueStatus();

    // Poll for queue updates every 10 seconds
    const interval = setInterval(fetchQueueStatus, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

  /**
   * Subscribe to WebSocket events
   */
  useEffect(() => {
    window.addEventListener('queueStatusUpdate', handleQueueStatusUpdate);
    window.addEventListener('tokenStatusChange', handleTokenStatusChange);

    return () => {
      window.removeEventListener('queueStatusUpdate', handleQueueStatusUpdate);
      window.removeEventListener('tokenStatusChange', handleTokenStatusChange);
    };
  }, [user?.id]);

  /**
   * Handle leaving queue
   */
  const handleLeaveQueue = async () => {
    if (!queueStatus?.currentToken) return;

    try {
      await tokenAPI.updateTokenStatus(queueStatus.currentToken.id, 'SKIPPED');
      setQueueStatus(null);
      addNotification({
        type: 'system',
        title: 'Queue Exited',
        message: 'You have exited the queue.',
      });
    } catch (err: any) {
      console.error('Failed to leave queue:', err);
      setError(err.response?.data?.message || 'Failed to leave queue');
    }
  };

  // Don't render if no active queue
  if (!queueStatus?.currentToken) {
    return null;
  }

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  const { currentToken, totalInQueue, estimatedWaitTime } = queueStatus;
  const patientPosition = currentToken.position || 0;

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light', border: '2px solid', borderColor: 'info.main' }}>
      {/* Connection Status */}
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Connection Status</AlertTitle>
          Real-time updates are temporarily unavailable. Queue status will be updated periodically.
        </Alert>
      )}

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} sx={{ mb: 2 }} />}

      {/* Called in Queue Alert */}
      {currentToken.status === 'CALLED' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Your Turn!</AlertTitle>
          Token <strong>{currentToken.tokenNumber}</strong> is now being called. Please proceed to the
          examination room immediately!
        </Alert>
      )}

      {/* Queue Information */}
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Queue Status
          </Typography>
          {isConnected && (
            <Chip label="Live" size="small" color="success" variant="outlined" />
          )}
        </Stack>

        {/* Token Number */}
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            Your Token Number
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '2.5rem',
            }}
          >
            {currentToken.tokenNumber}
          </Typography>
        </Box>

        {/* Position in Queue */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TimerIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Position in Queue
              </Typography>
            </Stack>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: patientPosition === 1 ? 'success.main' : 'warning.main',
              }}
            >
              {patientPosition === 1 ? 'Next!' : `#${patientPosition}`}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={totalInQueue > 0 ? ((totalInQueue - patientPosition) / totalInQueue) * 100 : 0}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Queue Stats */}
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Total in Queue
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {totalInQueue}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Est. Wait Time
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ~{estimatedWaitTime} min
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              Status
            </Typography>
            <Chip
              label={currentToken.status}
              size="small"
              color={
                currentToken.status === 'CALLED'
                  ? 'success'
                  : currentToken.status === 'WAITING'
                    ? 'info'
                    : 'default'
              }
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CloseIcon />}
            onClick={handleLeaveQueue}
          >
            Leave Queue
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CheckCircleIcon />}
            onClick={fetchQueueStatus}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default QueueStatus;
