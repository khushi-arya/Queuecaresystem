import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuth from '@hooks/useAuth';
import type { UserRole } from '../types/api';

/**
 * Protected Route Component Props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Protected Route Component
 *
 * Protects routes by:
 * 1. Checking if user is authenticated
 * 2. Checking if user has the required role (if specified)
 * 3. Redirecting to login if not authenticated
 * 4. Redirecting to unauthorized if role doesn't match
 *
 * @example
 * <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
 *   <DoctorDashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  /**
   * Show loading spinner while checking authentication
   */
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * Redirect to login if not authenticated
   */
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  /**
   * Check role permissions if specified
   */
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  /**
   * Render children if all checks pass
   */
  return <>{children}</>;
};

export default ProtectedRoute;
