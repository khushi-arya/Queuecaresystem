import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem as ContextMenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { appointmentAPI } from '@services/api';
import type { Appointment } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';
import ConfirmDialog from '@components/ConfirmDialog';
import PaginationControls from '@components/PaginationControls';

/**
 * MyAppointments Page
 * Displays patient's appointment history with filtering and management options
 * Route: /patient/appointments
 *
 * Features:
 * - List all patient appointments
 * - Filter by date range and status
 * - Cancel appointments (SCHEDULED only)
 * - Pagination controls
 */
export const PatientMyAppointments: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Context menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Confirm dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogLoading, setConfirmDialogLoading] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  const statusOptions = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'];

  /**
   * Fetch appointments
   */
  const fetchAppointments = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      const params: any = {
        page: pageNum - 1,
        size: pageSize,
        sort: 'appointmentDate,desc',
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const response = await appointmentAPI.getByPatient(user.id, pageNum - 1, pageSize);
      
      // Handle both Page object and direct Array response
      const data = response.data;
      const fetchedAppointments = Array.isArray(data) ? data : (data?.content || data?.data || []);
      const totalPgs = Array.isArray(data) ? 1 : (data?.totalPages || 1);
      const totalItms = Array.isArray(data) ? data.length : (data?.totalElements || 0);

      // Apply client-side filtering
      let filtered = [...fetchedAppointments];
      
      if (statusFilter) {
        filtered = filtered.filter(apt => apt.status === statusFilter);
      }
      
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter(apt => new Date(apt.appointmentDate) <= end);
      }

      setAppointments(filtered);
      setTotalPages(totalPgs);
      setTotalItems(totalItms);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load appointments when filters change - reset to page 1
   */
  useEffect(() => {
    setPage(1);
    fetchAppointments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, statusFilter, startDate, endDate]);

  /**
   * Load appointments when page or pageSize changes (skip initial mount handled above)
   */
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchAppointments(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  /**
   * Handle cancel appointment
   */
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      setConfirmDialogLoading(true);
      await appointmentAPI.cancel(appointmentToCancel, 'Cancelled by patient');

      // Add notification
      addNotification({
        type: 'appointment',
        title: 'Appointment Cancelled',
        message: 'Your appointment has been successfully cancelled.',
      });

      // Refresh list
      setConfirmDialogOpen(false);
      setAppointmentToCancel(null);
      fetchAppointments(page);
    } catch (err: any) {
      console.error('Failed to cancel appointment:', err);
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setConfirmDialogLoading(false);
    }
  };

  /**
   * Open context menu
   */
  const handleOpenContextMenu = (event: React.MouseEvent<HTMLElement>, appointmentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointmentId(appointmentId);
  };

  /**
   * Close context menu
   */
  const handleCloseContextMenu = () => {
    setAnchorEl(null);
    setSelectedAppointmentId(null);
  };

  /**
   * Open confirm dialog for cancellation
   */
  const handleConfirmCancel = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setConfirmDialogOpen(true);
    handleCloseContextMenu();
  };

  /**
   * Format date and time
   */
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get status color
   */
  const getStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (status) {
      case 'SCHEDULED':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'NO_SHOW':
        return 'warning';
      case 'RESCHEDULED':
        return 'secondary';
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
          My Appointments
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage all your appointments
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Filters Card */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader
          title="Filters"
          titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
        />
        <CardContent>
          <Grid container spacing={2}>
            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Start Date Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* End Date Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Clear Filters */}
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setStatusFilter('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {appointments.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Alert severity="info">No appointments found</Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.light' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Doctor</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {/* Date & Time */}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}>
                            {new Date(appointment.appointmentDate).getDate()}
                          </Avatar>
                          <Typography variant="body2">
                            {formatDateTime(appointment.appointmentDate)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Doctor */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Dr. {appointment.doctor?.name || appointment.doctorId}
                        </Typography>
                      </TableCell>


                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          size="small"
                          color={getStatusColor(appointment.status)}
                          variant="outlined"
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenContextMenu(e, appointment.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseContextMenu}
      >
        <ContextMenuItem>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </ContextMenuItem>

        {selectedAppointmentId &&
          appointments.find((apt) => apt.id === selectedAppointmentId)?.status === 'SCHEDULED' && (
            <ContextMenuItem
              onClick={() => {
                if (selectedAppointmentId) {
                  handleConfirmCancel(selectedAppointmentId);
                }
              }}
            >
              <ListItemIcon>
                <CloseIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>
                <Typography color="error">Cancel Appointment</Typography>
              </ListItemText>
            </ContextMenuItem>
          )}
      </Menu>

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        type="warning"
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        confirmLoading={confirmDialogLoading}
        onConfirm={handleCancelAppointment}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setAppointmentToCancel(null);
        }}
      />
    </Container>
  );
};

export default PatientMyAppointments;
