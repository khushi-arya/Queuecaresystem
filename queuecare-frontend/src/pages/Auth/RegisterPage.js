import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Container, TextField, Typography, Alert, CircularProgress, Paper, MenuItem, InputAdornment, IconButton, Grid, Divider, } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '@hooks/useAuth';
/**
 * Register form validation schema
 */
const registerSchema = z
    .object({
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must not exceed 50 characters'),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must not exceed 50 characters'),
    email: z
        .string()
        .email('Please enter a valid email address')
        .min(1, 'Email is required'),
    phone: z
        .string()
        .regex(/^[0-9\-+().\s]{10,}$/, 'Please enter a valid phone number')
        .optional()
        .or(z.literal('')),
    role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
/**
 * Register Page Component
 */
export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register: authRegister, isAuthenticated, error: authError, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState(null);
    const [selectedRole, setSelectedRole] = useState('PATIENT');
    const { register, handleSubmit, formState: { errors, isSubmitting }, control, } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'PATIENT',
        },
    });
    /**
     * Redirect if already authenticated
     */
    useEffect(() => {
        if (isAuthenticated && !loading) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);
    /**
     * Handle form submission
     */
    const onSubmit = async (data) => {
        try {
            setFormError(null);
            await authRegister(data.email, data.password, data.firstName, data.lastName, data.role, data.phone);
            // Navigation will be handled by the useEffect above
        }
        catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Registration failed. Please try again.';
            setFormError(errorMessage);
        }
    };
    return (_jsx(Container, { maxWidth: "sm", children: _jsx(Box, { sx: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                py: 4,
            }, children: _jsxs(Paper, { elevation: 3, sx: { width: '100%', p: 4 }, children: [_jsxs(Box, { sx: { textAlign: 'center', mb: 4 }, children: [_jsx(Typography, { variant: "h4", component: "h1", sx: { fontWeight: 'bold', mb: 1 }, children: "QueueCare" }), _jsx(Typography, { variant: "h6", color: "textSecondary", children: "Create your account" })] }), (formError || authError) && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: formError || authError })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsxs(Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "First Name", placeholder: "John", ...register('firstName'), error: !!errors.firstName, helperText: errors.firstName?.message, disabled: isSubmitting || loading }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(TextField, { fullWidth: true, label: "Last Name", placeholder: "Doe", ...register('lastName'), error: !!errors.lastName, helperText: errors.lastName?.message, disabled: isSubmitting || loading }) })] }), _jsx(TextField, { fullWidth: true, label: "Email Address", type: "email", placeholder: "john@example.com", ...register('email'), error: !!errors.email, helperText: errors.email?.message, disabled: isSubmitting || loading, sx: { mb: 2 }, autoComplete: "email" }), _jsx(TextField, { fullWidth: true, label: "Phone Number (Optional)", placeholder: "+1 (555) 123-4567", ...register('phone'), error: !!errors.phone, helperText: errors.phone?.message, disabled: isSubmitting || loading, sx: { mb: 2 }, autoComplete: "tel" }), _jsx(Controller, { name: "role", control: control, render: ({ field }) => (_jsxs(TextField, { fullWidth: true, select: true, label: "Role", ...field, error: !!errors.role, helperText: errors.role?.message, disabled: isSubmitting || loading, sx: { mb: 2 }, onChange: (e) => {
                                        field.onChange(e);
                                        setSelectedRole(e.target.value);
                                    }, children: [_jsx(MenuItem, { value: "PATIENT", children: "Patient" }), _jsx(MenuItem, { value: "DOCTOR", children: "Doctor" }), _jsx(MenuItem, { value: "ADMIN", children: "Admin" })] })) }), selectedRole === 'DOCTOR' && (_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: _jsx(Typography, { variant: "body2", children: "Doctor accounts will need to be verified before full access is granted." }) })), _jsx(TextField, { fullWidth: true, label: "Password", type: showPassword ? 'text' : 'password', placeholder: "Create a strong password", ...register('password'), error: !!errors.password, helperText: errors.password?.message, disabled: isSubmitting || loading, sx: { mb: 2 }, autoComplete: "new-password", InputProps: {
                                    endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", disabled: isSubmitting || loading, children: showPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                                } }), _jsx(TextField, { fullWidth: true, label: "Confirm Password", type: showConfirmPassword ? 'text' : 'password', placeholder: "Confirm your password", ...register('confirmPassword'), error: !!errors.confirmPassword, helperText: errors.confirmPassword?.message, disabled: isSubmitting || loading, sx: { mb: 3 }, autoComplete: "new-password", InputProps: {
                                    endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowConfirmPassword(!showConfirmPassword), edge: "end", disabled: isSubmitting || loading, children: showConfirmPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                                } }), _jsxs(Alert, { severity: "info", sx: { mb: 3 }, children: [_jsx(Typography, { variant: "body2", children: "Password must contain:" }), _jsx(Typography, { variant: "body2", children: "\u2022 At least 6 characters" }), _jsx(Typography, { variant: "body2", children: "\u2022 Uppercase letter (A-Z)" }), _jsx(Typography, { variant: "body2", children: "\u2022 Lowercase letter (a-z)" }), _jsx(Typography, { variant: "body2", children: "\u2022 Number (0-9)" })] }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", size: "large", disabled: isSubmitting || loading, sx: { mb: 2 }, children: isSubmitting || loading ? (_jsxs(_Fragment, { children: [_jsx(CircularProgress, { size: 20, sx: { mr: 1 } }), "Creating account..."] })) : ('Register') })] }), _jsx(Divider, { sx: { my: 3 } }), _jsx(Box, { sx: { textAlign: 'center' }, children: _jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", style: {
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                    }, children: "Login here" })] }) })] }) }) }));
};
export default RegisterPage;
