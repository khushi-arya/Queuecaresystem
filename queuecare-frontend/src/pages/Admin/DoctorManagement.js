import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button, Stack, CircularProgress, TextField, MenuItem, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, Tooltip, Paper, } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, } from '@mui/icons-material';
import { useNotifications } from '@hooks/useNotifications';
import { doctorAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import ConfirmDialog from '@components/ConfirmDialog';
export const DoctorManagement = () => {
    const { addNotification } = useNotifications();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    // Dialog states
    const [editDialog, setEditDialog] = useState({
        open: false,
        doctorId: '',
        doctorName: '',
        formData: {
            name: '',
            specialization: '',
            status: 'ACTIVE',
            shiftStartTime: '09:00',
            shiftEndTime: '17:00',
            maxPatientsPerDay: 20,
        },
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
            const data = response.data;
            // Filter by specialization and status if needed
            let filteredDoctors = data.content || [];
            if (specializationFilter) {
                filteredDoctors = filteredDoctors.filter((d) => d.specialization.toLowerCase().includes(specializationFilter.toLowerCase()));
            }
            if (statusFilter) {
                filteredDoctors = filteredDoctors.filter((d) => d.status === statusFilter);
            }
            setDoctors(filteredDoctors);
            setTotalElements(data.totalElements || 0);
        }
        catch (err) {
            console.error('Failed to fetch doctors:', err);
            setError(err.response?.data?.message || 'Failed to load doctors');
        }
        finally {
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
     * Open edit dialog
     */
    const handleEditClick = (doctor) => {
        setEditDialog({
            open: true,
            doctorId: doctor.id,
            doctorName: doctor.name || 'Doctor',
            formData: {
                name: doctor.name || '',
                specialization: doctor.specialization,
                status: doctor.status,
                shiftStartTime: doctor.shiftStartTime || '09:00',
                shiftEndTime: doctor.shiftEndTime || '17:00',
                maxPatientsPerDay: doctor.maxPatientsPerDay || 20,
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
                name: '',
                specialization: '',
                status: 'ACTIVE',
                shiftStartTime: '09:00',
                shiftEndTime: '17:00',
                maxPatientsPerDay: 20,
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
                name: editDialog.formData.name,
                specialization: editDialog.formData.specialization,
                status: editDialog.formData.status,
                shiftStartTime: editDialog.formData.shiftStartTime,
                shiftEndTime: editDialog.formData.shiftEndTime,
                maxPatientsPerDay: editDialog.formData.maxPatientsPerDay,
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
        }
        catch (err) {
            console.error('Failed to update doctor:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update doctor';
            setError(errorMsg);
        }
        finally {
            setActionLoading(false);
        }
    };
    /**
     * Open delete dialog
     */
    const handleDeleteClick = (doctor) => {
        setDeleteDialog({
            open: true,
            doctorId: doctor.id,
            doctorName: doctor.name || 'Doctor',
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
        }
        catch (err) {
            console.error('Failed to delete doctor:', err);
            const errorMsg = err.response?.data?.message || 'Failed to delete doctor';
            setError(errorMsg);
        }
        finally {
            setActionLoading(false);
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
            case 'ON_LEAVE':
                return 'info';
            default:
                return 'default';
        }
    };
    if (loading && doctors.length === 0) {
        return (_jsx(Container, { maxWidth: "lg", sx: { py: 4 }, children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }, children: _jsx(CircularProgress, {}) }) }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 1 }, children: "Doctor Management" }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "Manage doctors, specializations, and schedules" })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), href: "/admin/doctors/create", children: "Create Doctor" })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null), sx: { mb: 3 } }), _jsx(Card, { sx: { mb: 3 }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, children: [_jsx(TextField, { placeholder: "Search specialization...", value: specializationFilter, onChange: (e) => {
                                    setSpecializationFilter(e.target.value);
                                    setPage(0);
                                }, size: "small", sx: { flex: 1 } }), _jsxs(FormControl, { sx: { minWidth: 150 }, children: [_jsx(InputLabel, { children: "Status" }), _jsxs(Select, { value: statusFilter, label: "Status", onChange: (e) => {
                                            setStatusFilter(e.target.value);
                                            setPage(0);
                                        }, size: "small", children: [_jsx(MenuItem, { value: "", children: "All Status" }), _jsx(MenuItem, { value: "ACTIVE", children: "Active" }), _jsx(MenuItem, { value: "INACTIVE", children: "Inactive" }), _jsx(MenuItem, { value: "ON_LEAVE", children: "On Leave" })] })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { title: "Doctors", subheader: `Total: ${totalElements} doctors`, sx: { pb: 0 } }), _jsxs(CardContent, { sx: { p: 0 }, children: [_jsx(TableContainer, { component: Paper, variant: "outlined", sx: { border: 'none' }, children: _jsxs(Table, { children: [_jsx(TableHead, { sx: { backgroundColor: '#fafafa' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { fontWeight: 600 }, children: "Name" }), _jsx(TableCell, { sx: { fontWeight: 600 }, children: "Specialization" }), _jsx(TableCell, { sx: { fontWeight: 600 }, children: "Status" }), _jsx(TableCell, { sx: { fontWeight: 600 }, children: "Shift Times" }), _jsx(TableCell, { sx: { fontWeight: 600 }, align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: doctors.map((doctor) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: doctor.name || 'Unknown' }), _jsx(TableCell, { children: doctor.specialization }), _jsx(TableCell, { children: _jsx(Chip, { label: doctor.status || 'UNKNOWN', color: getStatusColor(doctor.status), size: "small" }) }), _jsx(TableCell, { children: doctor.shiftStartTime && doctor.shiftEndTime
                                                            ? `${doctor.shiftStartTime} - ${doctor.shiftEndTime}`
                                                            : 'Not set' }), _jsx(TableCell, { align: "right", children: _jsxs(Stack, { direction: "row", spacing: 1, justifyContent: "flex-end", children: [_jsx(Tooltip, { title: "Edit", children: _jsx(IconButton, { size: "small", onClick: () => handleEditClick(doctor), children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Delete", children: _jsx(IconButton, { size: "small", onClick: () => handleDeleteClick(doctor), color: "error", children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }) })] }, doctor.id))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 20, 50], component: "div", count: totalElements, rowsPerPage: pageSize, page: page, onPageChange: handlePageChange, onRowsPerPageChange: handlePageSizeChange })] })] }), _jsxs(Dialog, { open: editDialog.open, onClose: handleEditCancel, maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["Edit Doctor - ", editDialog.doctorName] }), _jsx(DialogContent, { sx: { pt: 3 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Name", value: editDialog.formData.name, onChange: (e) => setEditDialog({
                                        ...editDialog,
                                        formData: { ...editDialog.formData, name: e.target.value },
                                    }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Specialization", value: editDialog.formData.specialization, onChange: (e) => setEditDialog({
                                        ...editDialog,
                                        formData: { ...editDialog.formData, specialization: e.target.value },
                                    }), fullWidth: true, size: "small" }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Status" }), _jsxs(Select, { value: editDialog.formData.status, label: "Status", onChange: (e) => setEditDialog({
                                                ...editDialog,
                                                formData: { ...editDialog.formData, status: e.target.value },
                                            }), children: [_jsx(MenuItem, { value: "ACTIVE", children: "Active" }), _jsx(MenuItem, { value: "INACTIVE", children: "Inactive" }), _jsx(MenuItem, { value: "ON_LEAVE", children: "On Leave" })] })] }), _jsx(TextField, { label: "Shift Start Time", type: "time", value: editDialog.formData.shiftStartTime, onChange: (e) => setEditDialog({
                                        ...editDialog,
                                        formData: { ...editDialog.formData, shiftStartTime: e.target.value },
                                    }), fullWidth: true, size: "small", InputLabelProps: { shrink: true } }), _jsx(TextField, { label: "Shift End Time", type: "time", value: editDialog.formData.shiftEndTime, onChange: (e) => setEditDialog({
                                        ...editDialog,
                                        formData: { ...editDialog.formData, shiftEndTime: e.target.value },
                                    }), fullWidth: true, size: "small", InputLabelProps: { shrink: true } }), _jsx(TextField, { label: "Max Patients Per Day", type: "number", value: editDialog.formData.maxPatientsPerDay, onChange: (e) => setEditDialog({
                                        ...editDialog,
                                        formData: { ...editDialog.formData, maxPatientsPerDay: parseInt(e.target.value) || 20 },
                                    }), fullWidth: true, size: "small", inputProps: { min: 1, max: 100 } })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleEditCancel, disabled: actionLoading, children: "Cancel" }), _jsx(Button, { onClick: handleEditSave, variant: "contained", disabled: actionLoading, children: "Save Changes" })] })] }), _jsx(ConfirmDialog, { title: "Delete Doctor", message: `Are you sure you want to delete ${deleteDialog.doctorName}? This action cannot be undone.`, open: deleteDialog.open, type: "error", confirmText: "Delete", onConfirm: handleDeleteConfirm, onCancel: handleDeleteCancel, confirmLoading: actionLoading, confirmDisabled: actionLoading })] }));
};
export default DoctorManagement;
