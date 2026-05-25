import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { appointmentAPI } from '@services/api';
import type { Appointment } from '../../types/api';
import ErrorAlert from '@components/ErrorAlert';
import PaginationControls from '@components/PaginationControls';

export const DoctorMyAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  /**
   * Fetch appointments
   */
  const fetchAppointments = async (
    pageNum = 1,
    pageSizeNum = 20,
    status?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      // Fetch doctor's appointments
      const response = await appointmentAPI.getByDoctor(user.id, pageNum - 1, pageSizeNum);
      const data = response.data;
      const fetchedAppointments = Array.isArray(data) ? data : (data?.content || data?.data || []);
      const totalItms = Array.isArray(data) ? data.length : (data?.totalElements || 0);

      // Apply client-side filtering (if any additional filtering is needed)
      let filtered = [...fetchedAppointments];
      
      if (status) {
        filtered = filtered.filter((apt) => apt.status === status);
      }

      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter((apt) => new Date(apt.appointmentDate) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter((apt) => new Date(apt.appointmentDate) <= end);
      }

      if (searchTerm) {
        filtered = filtered.filter((apt) =>
          apt.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setAppointments(filtered);
      setTotalElements(totalItms);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize on mount
   */
  useEffect(() => {
    fetchAppointments(page, pageSize, statusFilter, dateFrom, dateTo);
  }, [user?.id, page, pageSize, statusFilter, dateFrom, dateTo]);

  /**
   * Handle filter changes
   */
  const handleApplyFilters = () => {
    setPage(1);
    fetchAppointments(1, pageSize, statusFilter, dateFrom, dateTo);
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  /**
   * Format date and time
   */
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string): any => {
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

  if (loading && page === 1 && appointments.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading appointments...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        My Appointments
      </Typography>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filters" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="NO_SHOW">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader
          title={`Appointments (${totalElements})`}
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 'bold' } }}
        />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} hover>
                    <TableCell>{formatDateTime(apt.appointmentDate)}</TableCell>
                    <TableCell>
                      {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : `Patient #${apt.patientId}`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={apt.status}
                        color={getStatusColor(apt.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {apt.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {appointments.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">No appointments found</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalElements > 0 && (
        <Box sx={{ mt: 3 }}>
          <PaginationControls
            page={page}
            totalPages={Math.ceil(totalElements / pageSize)}
            pageSize={pageSize}
            totalItems={totalElements}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Box>
      )}
    </Container>
  );
};

export default DoctorMyAppointments;
