import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNotifications } from '@hooks/useNotifications';
import { doctorAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import ConfirmDialog from '@components/ConfirmDialog';

interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  maxPatients: number;
  shiftStartTime?: string;
  shiftEndTime?: string;
  createdAt: string;
}

interface PaginatedResponse {
  content: Doctor[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface DoctorFormData {
  specialization: string;
  status: string;
  maxPatients: number;
  shiftStartTime: string;
  shiftEndTime: string;
}

export const DoctorManagement: React.FC = () => {
  const { addNotification } = useNotifications();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [specializationFilter, setSpecializationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Dialog states
  const [editDialog, setEditDialog] = useState({
    open: false,
    doctorId: '',
    doctorName: '',
    formData: {
      specialization: '',
      status: 'ACTIVE',
      maxPatients: 50,
      shiftStartTime: '09:00',
      shiftEndTime: '17:00',
    } as DoctorFormData,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    doctorId: '',
    doctorName: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Fetch doctors from API
   */
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await doctorAPI.getAll(page, pageSize);
      const data: PaginatedResponse = response.data;

      // Filter by specialization and status if needed
      let filteredDoctors = data.content || [];

      if (specializationFilter) {
        filteredDoctors = filteredDoctors.filter(
          (d) => d.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
        );
      }

      if (statusFilter) {
        filteredDoctors = filteredDoctors.filter((d) => d.status === statusFilter);
      }

      setDoctors(filteredDoctors);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error('Failed to fetch doctors:', err);
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, specializationFilter, statusFilter]);

  /**
   * Initialize on mount and when filters change
   */
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  /**
   * Handle page change
   */
  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Open edit dialog
   */
  const handleEditClick = (doctor: Doctor) => {
    setEditDialog({
      open: true,
      doctorId: doctor.id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      formData: {
        specialization: doctor.specialization,
        status: doctor.status,
        maxPatients: doctor.maxPatients,
        shiftStartTime: doctor.shiftStartTime || '09:00',
        shiftEndTime: doctor.shiftEndTime || '17:00',
      },
    });
  };

  /**
   * Close edit dialog
   */
  const handleEditCancel = () => {
    setEditDialog({
      open: false,
      doctorId: '',
      doctorName: '',
      formData: {
        specialization: '',
        status: 'ACTIVE',
        maxPatients: 50,
        shiftStartTime: '09:00',
        shiftEndTime: '17:00',
      },
    });
  };

  /**
   * Update doctor
   */
  const handleEditSave = async () => {
    try {
      setActionLoading(true);

      await doctorAPI.update(editDialog.doctorId, {
        specialization: editDialog.formData.specialization,
        status: editDialog.formData.status,
        maxPatients: editDialog.formData.maxPatients,
        shiftStartTime: editDialog.formData.shiftStartTime,
        shiftEndTime: editDialog.formData.shiftEndTime,
      });

      // Dispatch notification
      addNotification({
        type: 'system',
        title: 'Doctor Updated',
        message: `${editDialog.doctorName} details have been updated.`,
      });

      // Refresh doctors list
      await fetchDoctors();

      // Close dialog
      handleEditCancel();
    } catch (err: any) {
      console.error('Failed to update doctor:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update doctor';
      setError(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Open delete dialog
   */
  const handleDeleteClick = (doctor: Doctor) => {
    setDeleteDialog({
      open: true,
      doctorId: doctor.id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
    });
  };

  /**
   * Close delete dialog
   */
  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, doctorId: '', doctorName: '' });
  };

  /**
   * Delete doctor
   */
  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);

      await doctorAPI.delete(deleteDialog.doctorId);

      // Dispatch notification
      addNotification({
        type: 'system',
        title: 'Doctor Deleted',
        message: `${deleteDialog.doctorName} has been removed from the system.`,
      });

      // Refresh doctors list
      await fetchDoctors();

      // Close dialog
      setDeleteDialog({ open: false, doctorId: '', doctorName: '' });
    } catch (err: any) {
      console.error('Failed to delete doctor:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete doctor';
      setError(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'ON_LEAVE':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading && doctors.length === 0) {
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Doctor Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage doctors, specializations, and schedules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href="/admin/doctors/create"
        >
          Create Doctor
        </Button>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} sx={{ mb: 3 }} />}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search specialization..."
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                size="small"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="ON_LEAVE">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader
          title="Doctors"
          subheader={`Total: ${totalElements} doctors`}
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Specialization</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Max Patients
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Shift Times</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id} hover>
                    <TableCell>
                      {doctor.firstName} {doctor.lastName}
                    </TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>
                      <Chip
                        label={doctor.status}
                        color={getStatusColor(doctor.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{doctor.maxPatients}</TableCell>
                    <TableCell>
                      {doctor.shiftStartTime && doctor.shiftEndTime
                        ? `${doctor.shiftStartTime} - ${doctor.shiftEndTime}`
                        : 'Not set'}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(doctor)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(doctor)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={totalElements}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Doctor - {editDialog.doctorName}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Specialization"
              value={editDialog.formData.specialization}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  formData: { ...editDialog.formData, specialization: e.target.value },
                })
              }
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editDialog.formData.status}
                label="Status"
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    formData: { ...editDialog.formData, status: e.target.value },
                  })
                }
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="ON_LEAVE">On Leave</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Max Patients"
              type="number"
              value={editDialog.formData.maxPatients}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  formData: { ...editDialog.formData, maxPatients: parseInt(e.target.value) },
                })
              }
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Shift Start Time"
              type="time"
              value={editDialog.formData.shiftStartTime}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  formData: { ...editDialog.formData, shiftStartTime: e.target.value },
                })
              }
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Shift End Time"
              type="time"
              value={editDialog.formData.shiftEndTime}
              onChange={(e) =>
                setEditDialog({
                  ...editDialog,
                  formData: { ...editDialog.formData, shiftEndTime: e.target.value },
                })
              }
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={actionLoading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        title="Delete Doctor"
        message={`Are you sure you want to delete ${deleteDialog.doctorName}? This action cannot be undone.`}
        open={deleteDialog.open}
        type="error"
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmLoading={actionLoading}
        confirmDisabled={actionLoading}
      />
    </Container>
  );
};

export default DoctorManagement;
