import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, CircularProgress, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Divider, Paper, } from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, Cancel as CancelIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { doctorAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import SuccessToast from '@components/SuccessToast';
export const DoctorProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        specialization: '',
        licenseNumber: '',
        qualifications: '',
        experience: 0,
        hospitalAffiliation: '',
        workingHours: '',
        bio: '',
        isAvailable: true,
        shiftStart: '09:00',
        shiftEnd: '17:00',
        breakStart: '13:00',
        breakEnd: '14:00',
        maxPatientsPerDay: 50,
        status: 'ACTIVE',
    });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState(profile);
    /**
     * Fetch doctor profile
     */
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!user?.id)
                return;
            const response = await doctorAPI.getById(user.id);
            const doctorData = response.data;
            setProfile({
                specialization: doctorData.specialization || '',
                licenseNumber: doctorData.licenseNumber || '',
                qualifications: doctorData.qualifications || '',
                experience: doctorData.experience || 0,
                hospitalAffiliation: doctorData.hospitalAffiliation || '',
                workingHours: doctorData.workingHours || '',
                bio: doctorData.bio || '',
                isAvailable: doctorData.isAvailable || true,
                averageRating: doctorData.averageRating,
                totalReviews: doctorData.totalReviews,
            });
            setFormData({
                specialization: doctorData.specialization || '',
                licenseNumber: doctorData.licenseNumber || '',
                qualifications: doctorData.qualifications || '',
                experience: doctorData.experience || 0,
                hospitalAffiliation: doctorData.hospitalAffiliation || '',
                workingHours: doctorData.workingHours || '',
                bio: doctorData.bio || '',
                isAvailable: doctorData.isAvailable || true,
                averageRating: doctorData.averageRating,
                totalReviews: doctorData.totalReviews,
            });
        }
        catch (err) {
            console.error('Failed to fetch profile:', err);
            setError(err.response?.data?.message || 'Failed to load profile');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Initialize on mount
     */
    useEffect(() => {
        fetchProfile();
    }, [user?.id]);
    /**
     * Handle input change
     */
    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };
    /**
     * Handle save
     */
    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);
            if (!user?.id)
                return;
            // Validate required fields
            if (!formData.specialization || !formData.licenseNumber) {
                setError('Please fill in all required fields');
                return;
            }
            await doctorAPI.update(user.id, formData);
            setProfile(formData);
            setEditing(false);
            setSuccess('Profile updated successfully!');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        }
        catch (err) {
            console.error('Failed to save profile:', err);
            setError(err.response?.data?.message || 'Failed to save profile');
        }
        finally {
            setSaving(false);
        }
    };
    /**
     * Handle cancel edit
     */
    const handleCancel = () => {
        setFormData(profile);
        setEditing(false);
    };
    if (loading) {
        return (_jsxs(Container, { maxWidth: "md", sx: { py: 4, textAlign: 'center' }, children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "body1", sx: { mt: 2 }, children: "Loading profile..." })] }));
    }
    return (_jsxs(Container, { maxWidth: "md", sx: { py: 4 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold' }, children: "Doctor Profile" }), _jsx(Button, { startIcon: editing ? _jsx(CancelIcon, {}) : _jsx(EditIcon, {}), onClick: () => (editing ? handleCancel() : setEditing(true)), variant: editing ? 'outlined' : 'contained', children: editing ? 'Cancel Edit' : 'Edit Profile' })] }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), success && _jsx(SuccessToast, { message: success }), _jsxs(Card, { sx: { mb: 3 }, children: [_jsx(CardHeader, { title: "Basic Information" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "First Name", value: user?.firstName || '', disabled: true, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Last Name", value: user?.lastName || '', disabled: true, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Email", value: user?.email || '', disabled: true, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Phone", value: user?.phone || '', disabled: true, size: "small" }) })] }) })] }), _jsxs(Card, { sx: { mb: 3 }, children: [_jsx(CardHeader, { title: "Professional Information" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Specialization *", value: formData.specialization, onChange: (e) => handleInputChange('specialization', e.target.value), disabled: !editing, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "License Number *", value: formData.licenseNumber, onChange: (e) => handleInputChange('licenseNumber', e.target.value), disabled: !editing, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, type: "number", label: "Years of Experience", value: formData.experience, onChange: (e) => handleInputChange('experience', parseInt(e.target.value)), disabled: !editing, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Hospital Affiliation", value: formData.hospitalAffiliation, onChange: (e) => handleInputChange('hospitalAffiliation', e.target.value), disabled: !editing, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, multiline: true, rows: 2, label: "Qualifications", value: formData.qualifications, onChange: (e) => handleInputChange('qualifications', e.target.value), disabled: !editing, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, multiline: true, rows: 3, label: "Professional Bio", value: formData.bio, onChange: (e) => handleInputChange('bio', e.target.value), disabled: !editing, size: "small" }) })] }) })] }), _jsxs(Card, { sx: { mb: 3 }, children: [_jsx(CardHeader, { title: "Working Hours & Availability" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, type: "time", label: "Shift Start", value: formData.shiftStart, onChange: (e) => handleInputChange('shiftStart', e.target.value), disabled: !editing, InputLabelProps: { shrink: true }, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, type: "time", label: "Shift End", value: formData.shiftEnd, onChange: (e) => handleInputChange('shiftEnd', e.target.value), disabled: !editing, InputLabelProps: { shrink: true }, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, type: "time", label: "Break Start", value: formData.breakStart, onChange: (e) => handleInputChange('breakStart', e.target.value), disabled: !editing, InputLabelProps: { shrink: true }, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, type: "time", label: "Break End", value: formData.breakEnd, onChange: (e) => handleInputChange('breakEnd', e.target.value), disabled: !editing, InputLabelProps: { shrink: true }, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, type: "number", label: "Max Patients Per Day", value: formData.maxPatientsPerDay, onChange: (e) => handleInputChange('maxPatientsPerDay', parseInt(e.target.value)), disabled: !editing, size: "small" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(FormControl, { fullWidth: true, size: "small", disabled: !editing, children: [_jsx(InputLabel, { children: "Status" }), _jsxs(Select, { value: formData.status, label: "Status", onChange: (e) => handleInputChange('status', e.target.value), children: [_jsx(MenuItem, { value: "ACTIVE", children: "Active" }), _jsx(MenuItem, { value: "INACTIVE", children: "Inactive" }), _jsx(MenuItem, { value: "ON_LEAVE", children: "On Leave" })] })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(FormControl, { fullWidth: true, size: "small", disabled: !editing, children: [_jsx(InputLabel, { children: "Available for New Appointments" }), _jsxs(Select, { value: formData.isAvailable ? 'true' : 'false', label: "Available for New Appointments", onChange: (e) => handleInputChange('isAvailable', e.target.value === 'true'), children: [_jsx(MenuItem, { value: "true", children: "Available" }), _jsx(MenuItem, { value: "false", children: "Not Available" })] })] }) })] }) })] }), (profile.averageRating || profile.totalReviews) && (_jsxs(Card, { sx: { mb: 3 }, children: [_jsx(CardHeader, { title: "Performance Metrics" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(Paper, { sx: { p: 2, textAlign: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Average Rating" }), _jsxs(Typography, { variant: "h5", sx: { fontWeight: 'bold', color: 'warning.main' }, children: [profile.averageRating || 'N/A', " / 5.0"] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(Paper, { sx: { p: 2, textAlign: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: "Total Reviews" }), _jsx(Typography, { variant: "h5", sx: { fontWeight: 'bold' }, children: profile.totalReviews || 0 })] }) })] }) })] })), editing && (_jsxs(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'flex-end' }, children: [_jsx(Button, { startIcon: _jsx(CancelIcon, {}), variant: "outlined", onClick: handleCancel, disabled: saving, children: "Cancel" }), _jsx(Button, { startIcon: _jsx(SaveIcon, {}), variant: "contained", onClick: handleSave, disabled: saving, children: saving ? _jsx(CircularProgress, { size: 24 }) : 'Save Changes' })] }))] }));
};
export default DoctorProfile;
