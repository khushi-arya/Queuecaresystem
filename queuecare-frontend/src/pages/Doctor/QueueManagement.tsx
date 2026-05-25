import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Done as DoneIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { useQueueSubscription } from '@hooks/useQueueSubscription';
import { tokenAPI } from '@services/api';
import type { DoctorToken } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';

interface QueueToken extends DoctorToken {
  patientName?: string;
  position?: number;
  timeInQueue?: number;
}

export const QueueManagement: React.FC = () => {
  const { user } = useAuth();
  const { isConnected, queueUpdates } = useQueueSubscription();
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missedDialog, setMissedDialog] = useState(false);
  const [missedNotes, setMissedNotes] = useState('');
  const [missedTokenId, setMissedTokenId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Fetch today's queue tokens
   */
  const fetchQueueTokens = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      setError(null);

      if (!user?.id) return;

      const response = await tokenAPI.getQueueTokens(user.id, 0, 100);
      const rawTokens: DoctorToken[] = response.data.content || [];

      // Sort by position: IN_CONSULTATION first, then WAITING, then completed ones
      const sortedTokens = rawTokens.sort((a, b) => {
        const statusOrder: Record<string, number> = {
          IN_CONSULTATION: 0,
          WAITING: 1,
          COMPLETED: 2,
          CANCELLED: 3,
        };
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
      });

      // Map tokens with additional info
      const mappedTokens = sortedTokens.map((token, index) => {
        const timeInQueue = token.calledAt
          ? Math.round((new Date().getTime() - new Date(token.calledAt).getTime()) / (1000 * 60))
          : Math.round((new Date().getTime() - new Date(token.issuedAt).getTime()) / (1000 * 60));

        return {
          ...token,
          patientName: `Patient #${token.tokenNumber}`,
          position: index + 1,
          timeInQueue: Math.max(0, timeInQueue),
        };
      });

      setTokens(mappedTokens);
    } catch (err: any) {
      console.error('Failed to fetch queue tokens:', err);
      setError(err.response?.data?.message || 'Failed to load queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    fetchQueueTokens();
  }, [fetchQueueTokens]);

  /**
   * Refresh when WebSocket updates arrive
   */
  useEffect(() => {
    if (queueUpdates) {
      fetchQueueTokens(true);
    }
  }, [queueUpdates, fetchQueueTokens]);

  /**
   * Call next patient
   */
  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (!user?.id) return;

      await tokenAPI.callNextToken(user.id);

      // Refresh queue
      await fetchQueueTokens(true);
    } catch (err: any) {
      console.error('Failed to call next patient:', err);
      setError(err.response?.data?.message || 'Failed to call next patient');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Mark token as done
   */
  const handleMarkDone = async (tokenId: string) => {
    try {
      setActionLoading(true);
      setError(null);

      await tokenAPI.completeToken(tokenId);

      // Refresh queue
      await fetchQueueTokens(true);
    } catch (err: any) {
      console.error('Failed to mark patient as done:', err);
      setError(err.response?.data?.message || 'Failed to update token status');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Mark token as missed
   */
  const handleMarkMissed = async () => {
    try {
      setActionLoading(true);
      setError(null);

      if (!missedTokenId) return;

      await tokenAPI.cancelToken(missedTokenId, missedNotes || 'Patient did not show up');

      // Refresh queue
      await fetchQueueTokens(true);

      // Close dialog
      setMissedDialog(false);
      setMissedNotes('');
      setMissedTokenId(null);
    } catch (err: any) {
      console.error('Failed to mark patient as missed:', err);
      setError(err.response?.data?.message || 'Failed to update token status');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Open missed dialog
   */
  const openMissedDialog = (tokenId: string) => {
    setMissedTokenId(tokenId);
    setMissedNotes('');
    setMissedDialog(true);
  };

  /**
   * Format date and time
   */
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  /**
   * Get status chip color
   */
  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'IN_CONSULTATION':
        return 'primary';
      case 'WAITING':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'IN_CONSULTATION':
        return 'In Progress';
      case 'WAITING':
        return 'Waiting';
      case 'COMPLETED':
        return 'Done';
      case 'CANCELLED':
        return 'Missed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading queue...
        </Typography>
      </Container>
    );
  }

  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const inConsultation = tokens.find((t) => t.status === 'IN_CONSULTATION');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Queue Management
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={isConnected ? <CheckCircleIcon /> : <CloseIcon />}
              label={isConnected ? 'Real-time Connected' : 'Offline'}
              color={isConnected ? 'success' : 'default'}
              variant="outlined"
            />
            <Typography variant="caption" color="textSecondary">
              Total: {tokens.length} patients
            </Typography>
          </Stack>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => fetchQueueTokens(true)}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Call Next CTA */}
      <Card sx={{ mb: 4, backgroundColor: 'primary.light' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Ready to Call Next Patient?
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {waitingTokens.length} patient(s) waiting
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<PhoneIcon />}
              onClick={handleCallNext}
              disabled={waitingTokens.length === 0 || actionLoading}
              sx={{ minWidth: 180 }}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Call Next'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Current Patient */}
      {inConsultation && (
        <Card sx={{ mb: 4, backgroundColor: 'info.light', borderRadius: 2 }}>
          <CardHeader
            title={`Currently In Progress: ${inConsultation.patientName}`}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Called at:</strong> {formatDateTime(inConsultation.calledAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Time in consultation:</strong> {inConsultation.timeInQueue}m
                </Typography>
              </Stack>
              <Button
                variant="contained"
                color="success"
                startIcon={<DoneIcon />}
                onClick={() => handleMarkDone(inConsultation.id)}
                disabled={actionLoading}
              >
                Mark as Done
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Queue Table */}
      <Card>
        <CardHeader
          title={`All Queue Tokens (${tokens.length})`}
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 'bold' } }}
        />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Called At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id} hover>
                    <TableCell>
                      <Chip
                        label={`#${token.position}`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{token.patientName}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(token.status)}
                        color={getStatusColor(token.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {token.timeInQueue && token.timeInQueue > 0
                        ? `${token.timeInQueue}m`
                        : '-'}
                    </TableCell>
                    <TableCell align="center">{formatDateTime(token.calledAt)}</TableCell>
                    <TableCell align="center">
                      {token.status === 'WAITING' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<PhoneIcon />}
                          onClick={handleCallNext}
                          disabled={actionLoading}
                          sx={{ mr: 1 }}
                        >
                          Call
                        </Button>
                      )}
                      {token.status === 'IN_CONSULTATION' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<DoneIcon />}
                            onClick={() => handleMarkDone(token.id)}
                            disabled={actionLoading}
                            sx={{ mr: 1 }}
                          >
                            Done
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<BlockIcon />}
                            onClick={() => openMissedDialog(token.id)}
                            disabled={actionLoading}
                          >
                            Missed
                          </Button>
                        </>
                      )}
                      {(token.status === 'COMPLETED' || token.status === 'CANCELLED') && (
                        <Typography variant="caption" color="textSecondary">
                          {getStatusLabel(token.status)}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {tokens.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">No queue tokens for today</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Missed Dialog */}
      <Dialog open={missedDialog} onClose={() => setMissedDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Patient as Missed</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              placeholder="Why did the patient miss their appointment?"
              value={missedNotes}
              onChange={(e) => setMissedNotes(e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMissedDialog(false)}>Cancel</Button>
          <Button
            onClick={handleMarkMissed}
            variant="contained"
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Mark as Missed'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QueueManagement;
