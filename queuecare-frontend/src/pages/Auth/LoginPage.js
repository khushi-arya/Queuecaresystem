import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Container, TextField, Typography, Alert, CircularProgress, Paper, InputAdornment, IconButton, } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '@hooks/useAuth';
/**
 * Login form validation schema
 */
const loginSchema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});
/**
 * Login Page Component
 */
export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, error: authError, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    /**
     * Redirect if already authenticated
     */
    useEffect(() => {
        if (isAuthenticated && !loading) {
            navigate('/dashboard', { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, loading]);
    /**
     * Handle form submission
     */
    const onSubmit = async (data) => {
        try {
            setFormError(null);
            await login(data.email, data.password);
            // Navigation will be handled by the useEffect above
        }
        catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Login failed. Please try again.';
            setFormError(errorMessage);
        }
    };
    /**
     * Handle password visibility toggle
     */
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (_jsx(Container, { maxWidth: "sm", children: _jsx(Box, { sx: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
            }, children: _jsxs(Paper, { elevation: 3, sx: { width: '100%', p: 4 }, children: [_jsxs(Box, { sx: { textAlign: 'center', mb: 4 }, children: [_jsx(Typography, { variant: "h4", component: "h1", sx: { fontWeight: 'bold', mb: 1 }, children: "QueueCare" }), _jsx(Typography, { variant: "h6", color: "textSecondary", children: "Login to your account" })] }), (formError || authError) && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: formError || authError })), _jsxs(Alert, { severity: "info", sx: { mb: 3 }, children: [_jsx(Typography, { variant: "body2", sx: { mb: 1, fontWeight: 'bold' }, children: "Demo Credentials:" }), _jsx(Typography, { variant: "body2", children: "Patient: patient@example.com / password123" }), _jsx(Typography, { variant: "body2", children: "Doctor: doctor@example.com / password123" }), _jsx(Typography, { variant: "body2", children: "Admin: admin@example.com / password123" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsx(TextField, { fullWidth: true, label: "Email Address", type: "email", placeholder: "Enter your email", ...register('email'), error: !!errors.email, helperText: errors.email?.message, disabled: isSubmitting || loading, sx: { mb: 2 }, autoComplete: "email" }), _jsx(TextField, { fullWidth: true, label: "Password", type: showPassword ? 'text' : 'password', placeholder: "Enter your password", ...register('password'), error: !!errors.password, helperText: errors.password?.message, disabled: isSubmitting || loading, sx: { mb: 3 }, autoComplete: "current-password", InputProps: {
                                    endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: handleTogglePasswordVisibility, edge: "end", disabled: isSubmitting || loading, children: showPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                                } }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", size: "large", disabled: isSubmitting || loading, sx: { mb: 2 }, children: isSubmitting || loading ? (_jsxs(_Fragment, { children: [_jsx(CircularProgress, { size: 20, sx: { mr: 1 } }), "Logging in..."] })) : ('Login') }), _jsx(Box, { sx: { textAlign: 'center', mb: 2 }, children: _jsx(Link, { to: "/forgot-password", style: {
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                    }, children: "Forgot your password?" }) })] }), _jsx(Box, { sx: { borderTop: '1px solid #e0e0e0', my: 3 } }), _jsx(Box, { sx: { textAlign: 'center' }, children: _jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", style: {
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                    }, children: "Sign up here" })] }) })] }) }) }));
};
export default LoginPage;
