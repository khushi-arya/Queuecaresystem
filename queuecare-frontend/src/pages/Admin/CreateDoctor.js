import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Container, TextField, Typography, Alert, Paper, Grid, } from '@mui/material';
import apiClient from '@services/api';
const schema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional().or(z.literal('')),
    // Doctor fields
    name: z.string().min(2, 'Name is required'),
    specialization: z.string().min(2, 'Specialization is required'),
    shiftStartTime: z.string().min(1, 'Shift start time is required'),
    shiftEndTime: z.string().min(1, 'Shift end time is required'),
    maxPatientsPerDay: z
        .number()
        .min(1)
        .max(100)
        .or(z.string().transform((s) => Number(s))),
    bio: z.string().optional().or(z.literal('')),
    experience: z.number().optional().or(z.string().transform((s) => (s ? Number(s) : undefined))),
    hospitalAffiliation: z.string().optional().or(z.literal('')),
});
export const CreateDoctor = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            phone: '',
            bio: '',
            experience: undefined,
            hospitalAffiliation: '',
        },
    });
    const onSubmit = async (data) => {
        setError(null);
        setLoading(true);
        try {
            // Create user as DOCTOR without altering current admin session
            const registerResp = await apiClient.post('/api/auth/register', {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'DOCTOR',
                phone: data.phone || undefined,
            });
            const userId = registerResp?.data?.user?.id;
            if (!userId) {
                throw new Error('Failed to create user for doctor');
            }
            // Prepare doctor payload (backend expects LocalTime strings like "08:00")
            const doctorPayload = {
                name: data.name,
                specialization: data.specialization,
                shiftStartTime: data.shiftStartTime,
                shiftEndTime: data.shiftEndTime,
                maxPatientsPerDay: Number(data.maxPatientsPerDay),
                bio: data.bio || undefined,
                experience: data.experience ? Number(data.experience) : undefined,
                hospitalAffiliation: data.hospitalAffiliation || undefined,
            };
            await apiClient.post(`/api/doctors/${userId}`, doctorPayload);
            navigate('/admin/doctors');
        }
        catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to create doctor';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Container, { maxWidth: "md", children: _jsx(Box, { sx: { py: 4 }, children: _jsxs(Paper, { sx: { p: 3 }, elevation: 3, children: [_jsx(Typography, { variant: "h5", sx: { mb: 2 }, children: "Create Doctor" }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsx(Typography, { variant: "subtitle1", sx: { mt: 1, mb: 1 }, children: "User Account" }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { label: "Email", fullWidth: true, ...register('email') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { label: "Password", type: "password", fullWidth: true, ...register('password') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { label: "First Name", fullWidth: true, ...register('firstName') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { label: "Last Name", fullWidth: true, ...register('lastName') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { label: "Phone (optional)", fullWidth: true, ...register('phone') }) })] }), _jsx(Typography, { variant: "subtitle1", sx: { mt: 1, mb: 1 }, children: "Doctor Profile" }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Doctor Full Name", fullWidth: true, ...register('name') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { label: "Specialization", fullWidth: true, ...register('specialization') }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(TextField, { label: "Shift Start (HH:mm)", fullWidth: true, ...register('shiftStartTime') }) }), _jsx(Grid, { item: true, xs: 6, sm: 3, children: _jsx(TextField, { label: "Shift End (HH:mm)", fullWidth: true, ...register('shiftEndTime') }) }), _jsx(Grid, { item: true, xs: 12, sm: 4, children: _jsx(TextField, { label: "Max Patients/Day", type: "number", fullWidth: true, ...register('maxPatientsPerDay') }) }), _jsx(Grid, { item: true, xs: 12, sm: 4, children: _jsx(TextField, { label: "Experience (years)", type: "number", fullWidth: true, ...register('experience') }) }), _jsx(Grid, { item: true, xs: 12, sm: 4, children: _jsx(TextField, { label: "Hospital Affiliation", fullWidth: true, ...register('hospitalAffiliation') }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Bio", multiline: true, rows: 4, fullWidth: true, ...register('bio') }) })] }), _jsxs(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'flex-end' }, children: [_jsx(Button, { variant: "outlined", onClick: () => navigate('/admin/doctors'), disabled: loading, children: "Cancel" }), _jsx(Button, { variant: "contained", type: "submit", disabled: loading, children: loading ? 'Creating...' : 'Create Doctor' })] })] })] }) }) }));
};
export default CreateDoctor;
