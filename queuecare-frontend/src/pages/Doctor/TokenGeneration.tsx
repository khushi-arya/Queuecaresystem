import React, { useState, useEffect } from 'react';
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
  Alert,
  Chip,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { tokenAPI } from '@services/api';
import type { DoctorToken } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';

interface TokenGenerationData {
  tokenValue: string;
  generationTime: string;
  expiresAt: string;
  isValid: boolean;
}

export const TokenGeneration: React.FC = () => {
  const { user } = useAuth();
  const [tokenData, setTokenData] = useState<TokenGenerationData | null>(null);
  const [tokens, setTokens] = useState<DoctorToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate or fetch token
   */
  const fetchToken = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      setError(null);

      if (!user?.id) return;

      // Fetch current token
      await tokenAPI.getCurrentToken(user.id);

      // Create token data
      const tokenValue = `DOC${user.id.substring(0, 4).toUpperCase()}_${new Date()
        .toISOString()
        .substring(0, 10)
        .replace(/-/g, '')}_${String(tokens.length + 1).padStart(3, '0')}`;

      setTokenData({
        tokenValue,
        generationTime: new Date().toLocaleString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
        isValid: true,
      });

      // Fetch token history for today
      const tokensResponse = await tokenAPI.getQueueTokens(user.id, 0, 50);
      setTokens(tokensResponse.data.content || []);
    } catch (err: any) {
      console.error('Failed to fetch token:', err);
      setError(err.response?.data?.message || 'Failed to generate token');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Initialize on mount
   */
  useEffect(() => {
    fetchToken();
  }, [user?.id]);

  /**
   * Format date and time
   */
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: any; label: string }> = {
      WAITING: { color: 'warning', label: 'Waiting' },
      CALLED: { color: 'info', label: 'Called' },
      IN_CONSULTATION: { color: 'primary', label: 'In Progress' },
      COMPLETED: { color: 'success', label: 'Completed' },
      CANCELLED: { color: 'error', label: 'Cancelled' },
    };

    const mapped = statusMap[status] || { color: 'default', label: status };
    return <Chip label={mapped.label} color={mapped.color} size="small" />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading token information...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Token Generation
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => fetchToken(true)}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Current Token Card */}
      {tokenData && (
        <Card sx={{ mb: 4, backgroundColor: 'primary.light', borderRadius: 2 }}>
          <CardHeader
            avatar={<CodeIcon sx={{ color: 'primary.main' }} />}
            title="Today's Token Sequence"
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* Token Value */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: 'white',
                    textAlign: 'center',
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Token Value
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      fontFamily: 'monospace',
                      my: 1,
                      wordBreak: 'break-all',
                    }}
                  >
                    {tokenData.tokenValue}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      navigator.clipboard.writeText(tokenData.tokenValue);
                      alert('Token copied to clipboard!');
                    }}
                  >
                    Copy Token
                  </Button>
                </Paper>
              </Grid>

              {/* Token Info */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Generation Time
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ScheduleIcon fontSize="small" color="primary" />
                      <Typography variant="body1">{tokenData.generationTime}</Typography>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Expires At
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ScheduleIcon fontSize="small" color="warning" />
                      <Typography variant="body1">{tokenData.expiresAt}</Typography>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Status
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {tokenData.isValid ? (
                        <>
                          <CheckCircleIcon sx={{ color: 'success.main' }} />
                          <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            Valid
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CloseIcon sx={{ color: 'error.main' }} />
                          <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                            Expired
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Token History */}
      <Card>
        <CardHeader
          title={`Token History (${tokens.length})`}
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 'bold' } }}
        />
        <CardContent>
          {tokens.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Token #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Patient ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Issued At</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Called At</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.id} hover>
                      <TableCell>
                        <Chip label={`#${token.tokenNumber}`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{token.patientId || '-'}</TableCell>
                      <TableCell>{formatDateTime(token.issuedAt)}</TableCell>
                      <TableCell>{token.calledAt ? formatDateTime(token.calledAt) : '-'}</TableCell>
                      <TableCell>{getStatusBadge(token.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">No token history available</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Token Generation Information:</strong> Your daily token sequence is automatically
          generated and is valid for 24 hours. It identifies your queue session and helps manage
          patient flow efficiently. You can regenerate your token if needed, but the current one
          will remain valid until expiration.
        </Typography>
      </Alert>
    </Container>
  );
};

export default TokenGeneration;
