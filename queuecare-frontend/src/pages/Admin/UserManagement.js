import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button, Stack, CircularProgress, Alert, Paper, TextField, MenuItem, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, IconButton, Tooltip, } from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon, Block as BlockIcon, } from '@mui/icons-material';
import { useNotifications } from '@hooks/useNotifications';
import { adminAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import ConfirmDialog from '@components/ConfirmDialog';
export const UserManagement = () => {
    const { addNotification } = useNotifications();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [roleFilter, setRoleFilter] = useState('');
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
            const data = response.data;
            setUsers(data.content || []);
            setTotalElements(data.totalElements || 0);
        }
        catch (err) {
            console.error('Failed to fetch users:', err);
            setError(err.response?.data?.message || 'Failed to load users');
        }
        finally {
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
    const handlePageChange = (_event, newPage) => {
        setPage(newPage);
    };
    /**
     * Handle page size change
     */
    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPage(0);
    };
    /**
     * Handle role filter change
     */
    const handleRoleFilterChange = (event) => {
        setRoleFilter(event.target.value);
        setPage(0);
    };
    /**
     * Open promote dialog
     */
    const handlePromoteClick = (userId, userEmail, currentRole) => {
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
        }
        catch (err) {
            console.error('Failed to promote user:', err);
            const errorMsg = err.response?.data?.message || 'Failed to promote user';
            setError(errorMsg);
            addNotification({
                type: 'system',
                title: 'Promotion Failed',
                message: errorMsg,
            });
        }
        finally {
            setActionLoading(false);
        }
    };
    /**
     * Open disable/enable dialog
     */
    const handleDisableClick = (userId, userEmail) => {
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
        }
        catch (err) {
            console.error('Failed to update user:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update user';
            setError(errorMsg);
        }
        finally {
            setActionLoading(false);
        }
    };
    /**
     * Format date
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    /**
     * Get role color
     */
    const getRoleColor = (role) => {
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
    const getStatusColor = (status) => {
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
        return (_jsx(Container, { maxWidth: "lg", sx: { py: 4 }, children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }, children: _jsx(CircularProgress, {}) }) }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 1 }, children: "User Management" }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "Manage system users, roles, and permissions" })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null), sx: { mb: 3 } }), _jsx(Card, { sx: { mb: 3 }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, children: [_jsx(TextField, { placeholder: "Search by email...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), size: "small", sx: { flex: 1 }, disabled: true, helperText: "Search functionality coming soon" }), _jsxs(FormControl, { sx: { minWidth: 150 }, children: [_jsx(InputLabel, { children: "Role" }), _jsxs(Select, { value: roleFilter, label: "Role", onChange: handleRoleFilterChange, size: "small", children: [_jsx(MenuItem, { value: "", children: "All Roles" }), _jsx(MenuItem, { value: "PATIENT", children: "Patient" }), _jsx(MenuItem, { value: "DOCTOR", children: "Doctor" }), _jsx(MenuItem, { value: "ADMIN", children: "Admin" })] })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { title: "Users", subheader: `Total: ${totalElements} users`, sx: { pb: 0 } }), _jsxs(CardContent, { sx: { p: 0 }, children: [_jsx(TableContainer, { component: Paper, variant: "outlined", sx: { border: 'none' }, children: _jsxs(Table, { children: [_jsx(TableHead, { sx: { backgroundColor: '#fafafa' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontWeight: 600 }, children: "Email" }), _jsx(TableCell, { sx: { fontWeight: 600 }, children: "Name" }), _jsx(TableCell, { sx: { fontWeight: 600 }, children: "Role" }), _jsx(TableCell, { sx: { fontWeight: 600 }, children: "Status" }), _jsx(TableCell, { sx: { fontWeight: 600 }, children: "Created" }), _jsx(TableCell, { sx: { fontWeight: 600 }, align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: users.map((user) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: user.email }), _jsxs(TableCell, { children: [user.firstName, " ", user.lastName] }), _jsx(TableCell, { children: _jsx(Chip, { label: user.role, color: getRoleColor(user.role), size: "small", variant: "outlined" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: user.status, color: getStatusColor(user.status), size: "small" }) }), _jsx(TableCell, { children: formatDate(user.createdAt) }), _jsx(TableCell, { align: "right", children: _jsxs(Stack, { direction: "row", spacing: 1, justifyContent: "flex-end", children: [user.role === 'PATIENT' && (_jsx(Tooltip, { title: "Promote to Doctor", children: _jsx(IconButton, { size: "small", onClick: () => handlePromoteClick(user.id, user.email, user.role), children: _jsx(ArrowUpwardIcon, { fontSize: "small" }) }) })), user.status === 'ACTIVE' && (_jsx(Tooltip, { title: "Disable User", children: _jsx(IconButton, { size: "small", onClick: () => handleDisableClick(user.id, user.email), children: _jsx(BlockIcon, { fontSize: "small" }) }) }))] }) })] }, user.id))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 20, 50], component: "div", count: totalElements, rowsPerPage: pageSize, page: page, onPageChange: handlePageChange, onRowsPerPageChange: handlePageSizeChange })] })] }), _jsxs(Dialog, { open: promoteDialog.open, onClose: handlePromoteCancel, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Promote User to Doctor" }), _jsxs(DialogContent, { children: [_jsxs(DialogContentText, { sx: { mb: 2 }, children: ["Promote ", _jsx("strong", { children: promoteDialog.userEmail }), " from", ' ', _jsx("strong", { children: promoteDialog.currentRole }), " to ", _jsx("strong", { children: "DOCTOR" }), "?"] }), _jsx(Alert, { severity: "info", children: "After promotion, the user will need to complete doctor profile setup and be approved by an admin before becoming active as a doctor." })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handlePromoteCancel, disabled: actionLoading, children: "Cancel" }), _jsx(Button, { onClick: handlePromoteConfirm, variant: "contained", disabled: actionLoading, children: actionLoading ? _jsx(CircularProgress, { size: 24 }) : 'Promote' })] })] }), _jsx(ConfirmDialog, { title: "Disable User", message: `Are you sure you want to disable ${confirmDialog.userEmail}? They will not be able to log in.`, open: confirmDialog.open && confirmDialog.action === 'disable', type: "warning", confirmText: "Disable", onConfirm: handleDisableConfirm, onCancel: handleConfirmCancel, confirmLoading: actionLoading, confirmDisabled: actionLoading })] }));
};
export default UserManagement;
