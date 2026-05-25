import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, Stack, CircularProgress, TextField, Grid, MenuItem, Divider, } from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, Cancel as CancelIcon, } from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { patientAPI } from '@services/api';
import ErrorAlert from '@components/ErrorAlert';
import SuccessToast from '@components/SuccessToast';
export const PatientProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalConditions: '',
        allergies: '',
        currentMedications: '',
    });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState(profile);
    /**
     * Fetch patient profile
     */
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await patientAPI.getProfile();
            const profileData = response.data;
            setProfile({
                firstName: profileData.firstName || '',
                lastName: profileData.lastName || '',
                email: profileData.email || user?.email || '',
                phoneNumber: profileData.phoneNumber || '',
                dateOfBirth: profileData.dateOfBirth || '',
                gender: profileData.gender || '',
                bloodType: profileData.bloodType || '',
                address: profileData.address || '',
                city: profileData.city || '',
                state: profileData.state || '',
                zipCode: profileData.zipCode || '',
                emergencyContactName: profileData.emergencyContactName || '',
                emergencyContactPhone: profileData.emergencyContactPhone || '',
                medicalConditions: profileData.medicalConditions || '',
                allergies: profileData.allergies || '',
                currentMedications: profileData.currentMedications || '',
            });
            setFormData({
                firstName: profileData.firstName || '',
                lastName: profileData.lastName || '',
                email: profileData.email || user?.email || '',
                phoneNumber: profileData.phoneNumber || '',
                dateOfBirth: profileData.dateOfBirth || '',
                gender: profileData.gender || '',
                bloodType: profileData.bloodType || '',
                address: profileData.address || '',
                city: profileData.city || '',
                state: profileData.state || '',
                zipCode: profileData.zipCode || '',
                emergencyContactName: profileData.emergencyContactName || '',
                emergencyContactPhone: profileData.emergencyContactPhone || '',
                medicalConditions: profileData.medicalConditions || '',
                allergies: profileData.allergies || '',
                currentMedications: profileData.currentMedications || '',
            });
        }
        catch (err) {
            console.error('Failed to fetch profile:', err);
            setError(err.response?.data?.message || 'Failed to fetch profile');
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Save profile changes
     */
    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);
            await patientAPI.updateProfile(formData);
            setProfile(formData);
            setEditing(false);
            setSuccess('Profile updated successfully');
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
     * Handle form input changes
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    /**
     * Cancel editing and reset form
     */
    const handleCancel = () => {
        setFormData(profile);
        setEditing(false);
        setError(null);
    };
    useEffect(() => {
        fetchProfile();
    }, []);
    if (loading) {
        return (_jsx(Container, { maxWidth: "md", sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Container, { maxWidth: "md", sx: { py: 4 }, children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 1 }, children: "My Profile" }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "Manage your personal and medical information" })] }), success && _jsx(SuccessToast, { message: success }), error && _jsx(ErrorAlert, { message: error, onClose: () => setError(null) }), _jsxs(Card, { elevation: 2, children: [_jsx(CardHeader, { title: "Personal Information", action: !editing ? (_jsx(Button, { startIcon: _jsx(EditIcon, {}), variant: "outlined", onClick: () => setEditing(true), children: "Edit Profile" })) : null, sx: { pb: 2 } }), _jsx(Divider, {}), _jsxs(CardContent, { children: [_jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "First Name", name: "firstName", value: formData.firstName, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Last Name", name: "lastName", value: formData.lastName, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Email", name: "email", type: "email", value: formData.email, onChange: handleChange, disabled: true, variant: "outlined", helperText: "Email cannot be changed" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Phone Number", name: "phoneNumber", value: formData.phoneNumber, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Date of Birth", name: "dateOfBirth", type: "date", value: formData.dateOfBirth, onChange: handleChange, disabled: !editing, variant: "outlined", InputLabelProps: { shrink: true } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(TextField, { fullWidth: true, label: "Gender", name: "gender", select: true, value: formData.gender, onChange: handleChange, disabled: !editing, variant: "outlined", children: [_jsx(MenuItem, { value: "", children: "Select Gender" }), _jsx(MenuItem, { value: "MALE", children: "Male" }), _jsx(MenuItem, { value: "FEMALE", children: "Female" }), _jsx(MenuItem, { value: "OTHER", children: "Other" })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(TextField, { fullWidth: true, label: "Blood Type", name: "bloodType", select: true, value: formData.bloodType, onChange: handleChange, disabled: !editing, variant: "outlined", children: [_jsx(MenuItem, { value: "", children: "Select Blood Type" }), _jsx(MenuItem, { value: "O+", children: "O+" }), _jsx(MenuItem, { value: "O-", children: "O-" }), _jsx(MenuItem, { value: "A+", children: "A+" }), _jsx(MenuItem, { value: "A-", children: "A-" }), _jsx(MenuItem, { value: "B+", children: "B+" }), _jsx(MenuItem, { value: "B-", children: "B-" }), _jsx(MenuItem, { value: "AB+", children: "AB+" }), _jsx(MenuItem, { value: "AB-", children: "AB-" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Address", name: "address", value: formData.address, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "City", name: "city", value: formData.city, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(TextField, { fullWidth: true, label: "State", name: "state", value: formData.state, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsx(TextField, { fullWidth: true, label: "Zip Code", name: "zipCode", value: formData.zipCode, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Medical Information" })] }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Medical Conditions", name: "medicalConditions", value: formData.medicalConditions, onChange: handleChange, disabled: !editing, variant: "outlined", multiline: true, rows: 3, placeholder: "List any chronic or serious medical conditions" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Allergies", name: "allergies", value: formData.allergies, onChange: handleChange, disabled: !editing, variant: "outlined", multiline: true, rows: 3, placeholder: "List any known allergies (drugs, food, etc.)" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { fullWidth: true, label: "Current Medications", name: "currentMedications", value: formData.currentMedications, onChange: handleChange, disabled: !editing, variant: "outlined", multiline: true, rows: 3, placeholder: "List any current medications you're taking" }) }), _jsxs(Grid, { item: true, xs: 12, children: [_jsx(Divider, { sx: { my: 2 } }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Emergency Contact" })] }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Emergency Contact Name", name: "emergencyContactName", value: formData.emergencyContactName, onChange: handleChange, disabled: !editing, variant: "outlined" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Emergency Contact Phone", name: "emergencyContactPhone", value: formData.emergencyContactPhone, onChange: handleChange, disabled: !editing, variant: "outlined" }) })] }), editing && (_jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: 4 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(SaveIcon, {}), onClick: handleSave, disabled: saving, sx: {
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        }, children: saving ? 'Saving...' : 'Save Changes' }), _jsx(Button, { variant: "outlined", startIcon: _jsx(CancelIcon, {}), onClick: handleCancel, disabled: saving, children: "Cancel" })] }))] })] })] }));
};
