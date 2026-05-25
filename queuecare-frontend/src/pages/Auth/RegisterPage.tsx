import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  MenuItem,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '@hooks/useAuth';
import type { UserRole } from '../../types/api';

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
    role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN'] as const, {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register Page Component
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister, isAuthenticated, error: authError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<RegisterFormData>({
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
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setFormError(null);
      await authRegister(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.role,
        data.phone
      );
      // Navigation will be handled by the useEffect above
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setFormError(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              QueueCare
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Create your account
            </Typography>
          </Box>

          {/* Error Messages */}
          {(formError || authError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError || authError}
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* First Name and Last Name */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  placeholder="John"
                  {...register('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={isSubmitting || loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  placeholder="Doe"
                  {...register('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={isSubmitting || loading}
                />
              </Grid>
            </Grid>

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isSubmitting || loading}
              sx={{ mb: 2 }}
              autoComplete="email"
            />

            {/* Phone Field */}
            <TextField
              fullWidth
              label="Phone Number (Optional)"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={isSubmitting || loading}
              sx={{ mb: 2 }}
              autoComplete="tel"
            />

            {/* Role Selection */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  select
                  label="Role"
                  {...field}
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  disabled={isSubmitting || loading}
                  sx={{ mb: 2 }}
                  onChange={(e) => {
                    field.onChange(e);
                    setSelectedRole(e.target.value as UserRole);
                  }}
                >
                  <MenuItem value="PATIENT">Patient</MenuItem>
                  <MenuItem value="DOCTOR">Doctor</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </TextField>
              )}
            />

            {/* Role-specific info */}
            {selectedRole === 'DOCTOR' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Doctor accounts will need to be verified before full access is granted.
                </Typography>
              </Alert>
            )}

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting || loading}
              sx={{ mb: 2 }}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting || loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isSubmitting || loading}
              sx={{ mb: 3 }}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={isSubmitting || loading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Requirements Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Password must contain:
              </Typography>
              <Typography variant="body2">• At least 6 characters</Typography>
              <Typography variant="body2">• Uppercase letter (A-Z)</Typography>
              <Typography variant="body2">• Lowercase letter (a-z)</Typography>
              <Typography variant="body2">• Number (0-9)</Typography>
            </Alert>

            {/* Register Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || loading}
              sx={{ mb: 2 }}
            >
              {isSubmitting || loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </form>

          {/* Separator */}
          <Divider sx={{ my: 3 }} />

          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
