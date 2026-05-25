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
  Alert,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useNotifications } from '@hooks/useNotifications';
import { adminAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import ConfirmDialog from '@components/ConfirmDialog';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
}

interface PaginatedResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const UserManagement: React.FC = () => {
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: '',
    userEmail: '',
    action: '',
  });
  const [promoteDialog, setPromoteDialog] = useState({
    open: false,
    userId: '',
    userEmail: '',
    currentRole: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Fetch users from API
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getAllUsers(page, pageSize, roleFilter || undefined);
      const data: PaginatedResponse = response.data;

      setUsers(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, roleFilter]);

  /**
   * Initialize on mount and when filters change
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
   * Handle role filter change
   */
  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  /**
   * Open promote dialog
   */
  const handlePromoteClick = (userId: string, userEmail: string, currentRole: string) => {
    setPromoteDialog({
      open: true,
      userId,
      userEmail,
      currentRole,
    });
  };

  /**
   * Close promote dialog
   */
  const handlePromoteCancel = () => {
    setPromoteDialog({ open: false, userId: '', userEmail: '', currentRole: '' });
  };

  /**
   * Promote user to doctor
   */
  const handlePromoteConfirm = async () => {
    try {
      setActionLoading(true);

      // API call to promote user
      await adminAPI.promoteUserToDoctor(promoteDialog.userId);

      // Dispatch notification to admin
      addNotification({
        type: 'system',
        title: 'User Promoted',
        message: `${promoteDialog.userEmail} has been promoted from ${promoteDialog.currentRole} to DOCTOR. This change requires doctor approval before activation.`,
      });

      // Refresh users list
      await fetchUsers();

      // Close dialog
      setPromoteDialog({ open: false, userId: '', userEmail: '', currentRole: '' });
    } catch (err: any) {
      console.error('Failed to promote user:', err);
      const errorMsg = err.response?.data?.message || 'Failed to promote user';
      setError(errorMsg);
      addNotification({
        type: 'system',
        title: 'Promotion Failed',
        message: errorMsg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Open disable/enable dialog
   */
  const handleDisableClick = (userId: string, userEmail: string) => {
    setConfirmDialog({
      open: true,
      userId,
      userEmail,
      action: 'disable',
    });
  };

  /**
   * Close confirm dialog
   */
  const handleConfirmCancel = () => {
    setConfirmDialog({ open: false, userId: '', userEmail: '', action: '' });
  };

  /**
   * Disable or enable user
   */
  const handleDisableConfirm = async () => {
    try {
      setActionLoading(true);

      if (confirmDialog.action === 'disable') {
        await adminAPI.disableUser(confirmDialog.userId);
        addNotification({
          type: 'system',
          title: 'User Disabled',
          message: `${confirmDialog.userEmail} has been disabled.`,
        });
      }

      // Refresh users list
      await fetchUsers();

      // Close dialog
      setConfirmDialog({ open: false, userId: '', userEmail: '', action: '' });
    } catch (err: any) {
      console.error('Failed to update user:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update user';
      setError(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Get role color
   */
  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'DOCTOR':
        return 'primary';
      case 'PATIENT':
        return 'info';
      default:
        return 'default';
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
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && users.length === 0) {
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
          User Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage system users, roles, and permissions
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} sx={{ mb: 3 }} />}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              disabled
              helperText="Search functionality coming soon"
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={handleRoleFilterChange}
                size="small"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="PATIENT">Patient</MenuItem>
                <MenuItem value="DOCTOR">Doctor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader
          title="Users"
          subheader={`Total: ${totalElements} users`}
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {user.role === 'PATIENT' && (
                          <Tooltip title="Promote to Doctor">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handlePromoteClick(user.id, user.email, user.role)
                              }
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {user.status === 'ACTIVE' && (
                          <Tooltip title="Disable User">
                            <IconButton
                              size="small"
                              onClick={() => handleDisableClick(user.id, user.email)}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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

      {/* Promote Dialog */}
      <Dialog open={promoteDialog.open} onClose={handlePromoteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Promote User to Doctor</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Promote <strong>{promoteDialog.userEmail}</strong> from{' '}
            <strong>{promoteDialog.currentRole}</strong> to <strong>DOCTOR</strong>?
          </DialogContentText>
          <Alert severity="info">
            After promotion, the user will need to complete doctor profile setup and be approved
            by an admin before becoming active as a doctor.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePromoteCancel} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handlePromoteConfirm}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Promote'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disable Confirm Dialog */}
      <ConfirmDialog
        title="Disable User"
        message={`Are you sure you want to disable ${confirmDialog.userEmail}? They will not be able to log in.`}
        open={confirmDialog.open && confirmDialog.action === 'disable'}
        type="warning"
        confirmText="Disable"
        onConfirm={handleDisableConfirm}
        onCancel={handleConfirmCancel}
        confirmLoading={actionLoading}
        confirmDisabled={actionLoading}
      />
    </Container>
  );
};

export default UserManagement;
