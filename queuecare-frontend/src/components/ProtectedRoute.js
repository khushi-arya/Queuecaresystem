import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuth from '@hooks/useAuth';
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
export const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login', }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();
    /**
     * Show loading spinner while checking authentication
     */
    if (loading) {
        return (_jsx(Box, { sx: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
            }, children: _jsx(CircularProgress, {}) }));
    }
    /**
     * Redirect to login if not authenticated
     */
    if (!isAuthenticated || !user) {
        return _jsx(Navigate, { to: redirectTo, state: { from: location }, replace: true });
    }
    /**
     * Check role permissions if specified
     */
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            return _jsx(Navigate, { to: "/unauthorized", replace: true });
        }
    }
    /**
     * Render children if all checks pass
     */
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
