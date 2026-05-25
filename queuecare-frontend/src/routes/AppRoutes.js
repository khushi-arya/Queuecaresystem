import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from '@pages/Auth/LoginPage';
import RegisterPage from '@pages/Auth/RegisterPage';
import HomePage from '@pages/HomePage';
import ProtectedRoute from '@components/ProtectedRoute';
import MainLayout from '@layouts/MainLayout';
import LoadingSpinner from '@components/LoadingSpinner';
import NotFound from '@pages/NotFound';
import ComingSoon from '@pages/ComingSoon';
import { Box } from '@mui/material';
import { useAuth } from '@hooks/useAuth';
// React Router v7 future flags to suppress deprecation warnings
export const routerFutureFlags = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
};
// Lazy loaded: NotificationPreferences (code splitting)
const NotificationPreferences = lazy(() => import('@pages/NotificationPreferences').then((m) => ({ default: m.NotificationPreferences })));
// Lazy loaded: Patient pages (code splitting)
const PatientDashboard = lazy(() => import('@pages/Patient/Dashboard').then((m) => ({ default: m.PatientDashboard })));
const PatientProfile = lazy(() => import('@pages/Patient/Profile').then((m) => ({ default: m.PatientProfile })));
const BookAppointment = lazy(() => import('@pages/Patient/BookAppointment').then((m) => ({ default: m.BookAppointment })));
const PatientMyAppointments = lazy(() => import('@pages/Patient/MyAppointments').then((m) => ({ default: m.PatientMyAppointments })));
const ViewDoctors = lazy(() => import('@pages/Patient/ViewDoctors').then((m) => ({ default: m.ViewDoctors })));
// Lazy loaded: Doctor pages (code splitting)
const DoctorDashboard = lazy(() => import('@pages/Doctor/Dashboard').then((m) => ({ default: m.DoctorDashboard })));
const DoctorQueueManagement = lazy(() => import('@pages/Doctor/QueueManagement').then((m) => ({ default: m.QueueManagement })));
const DoctorMyAppointments = lazy(() => import('@pages/Doctor/MyAppointments').then((m) => ({ default: m.DoctorMyAppointments })));
const DoctorTokenGeneration = lazy(() => import('@pages/Doctor/TokenGeneration').then((m) => ({ default: m.TokenGeneration })));
const DoctorQueueStatistics = lazy(() => import('@pages/Doctor/QueueStatistics').then((m) => ({ default: m.QueueStatistics })));
const DoctorProfile = lazy(() => import('@pages/Doctor/Profile').then((m) => ({ default: m.DoctorProfile })));
// Lazy loaded: Admin pages (code splitting)
const AdminDashboard = lazy(() => import('@pages/Admin/Dashboard').then((m) => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('@pages/Admin/UserManagement').then((m) => ({ default: m.UserManagement })));
const DoctorManagement = lazy(() => import('@pages/Admin/DoctorManagement').then((m) => ({ default: m.DoctorManagement })));
const CreateDoctor = lazy(() => import('@pages/Admin/CreateDoctor').then((m) => ({ default: m.CreateDoctor })));
/**
 * Fallback component shown while code-split chunks load
 */
const RouteLoadingFallback = () => _jsx(LoadingSpinner, { fullscreen: true, message: "Loading..." });
/**
 * Redirect component for generic /dashboard route
 * Routes to role-specific dashboard based on user role
 */
const DashboardRedirect = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    useEffect(() => {
        if (loading)
            return;
        if (user?.role === 'PATIENT') {
            navigate('/patient/dashboard', { replace: true });
        }
        else if (user?.role === 'DOCTOR') {
            navigate('/doctor/dashboard', { replace: true });
        }
        else if (user?.role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);
    return _jsx(RouteLoadingFallback, {});
};
/**
 * Redirect component for generic /profile route
 * Routes to role-specific profile based on user role
 * Falls back to dashboard if profile page doesn't exist for that role
 */
const ProfileRedirect = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    useEffect(() => {
        if (loading)
            return;
        if (user?.role === 'PATIENT') {
            navigate('/patient/profile', { replace: true });
        }
        else if (user?.role === 'DOCTOR') {
            navigate('/doctor/profile', { replace: true });
        }
        else if (user?.role === 'ADMIN') {
            // Admin profile doesn't exist yet, redirect to dashboard
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);
    return _jsx(RouteLoadingFallback, {});
};
/**
 * Redirect component for generic /appointments route
 * Routes to role-specific appointments based on user role
 */
const AppointmentsRedirect = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    useEffect(() => {
        if (loading)
            return;
        if (user?.role === 'PATIENT') {
            navigate('/patient/appointments', { replace: true });
        }
        else if (user?.role === 'DOCTOR') {
            navigate('/doctor/appointments', { replace: true });
        }
        else {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);
    return _jsx(RouteLoadingFallback, {});
};
/**
 * Redirect component for generic /doctors route
 * Routes to role-specific doctors based on user role
 */
const DoctorsRedirect = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    useEffect(() => {
        if (loading)
            return;
        if (user?.role === 'PATIENT') {
            navigate('/patient/doctors', { replace: true });
        }
        else if (user?.role === 'ADMIN') {
            navigate('/admin/doctors', { replace: true });
        }
        else {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);
    return _jsx(RouteLoadingFallback, {});
};
/**
 * Main routing configuration for the application
 *
 * Routes:
 * - /login - Login page (public)
 * - /register - Register page (public)
 * - /dashboard - Protected dashboard (authenticated users, redirects to role-specific dashboard)
 * - /profile - Protected profile page (authenticated users, redirects to role-specific profile)
 * - /settings - Protected settings page (authenticated users)
 * - /settings/notifications - Notification preferences
 * - / - Redirects to /login
 * - /* - 404 page
 */
export default function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DashboardRedirect, {}) }) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(ProfileRedirect, {}) }) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx("div", { children: "Settings - Coming Soon" }) }) }) }), _jsx(Route, { path: "/settings/notifications", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(NotificationPreferences, {}) }) }) }) }), _jsx(Route, { path: "/patient/dashboard", element: _jsx(ProtectedRoute, { allowedRoles: ['PATIENT'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(PatientDashboard, {}) }) }) }) }), _jsx(Route, { path: "/patient/profile", element: _jsx(ProtectedRoute, { allowedRoles: ['PATIENT'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(PatientProfile, {}) }) }) }) }), _jsx(Route, { path: "/patient/book-appointment", element: _jsx(ProtectedRoute, { allowedRoles: ['PATIENT'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(BookAppointment, {}) }) }) }) }), _jsx(Route, { path: "/patient/appointments", element: _jsx(ProtectedRoute, { allowedRoles: ['PATIENT'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(PatientMyAppointments, {}) }) }) }) }), _jsx(Route, { path: "/patient/doctors", element: _jsx(ProtectedRoute, { allowedRoles: ['PATIENT'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(ViewDoctors, {}) }) }) }) }), _jsx(Route, { path: "/appointments", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(AppointmentsRedirect, {}) }) }) }), _jsx(Route, { path: "/doctors", element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, { children: _jsx(DoctorsRedirect, {}) }) }) }), _jsx(Route, { path: "/doctor/dashboard", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(DoctorDashboard, {}) }) }) }) }), _jsx(Route, { path: "/doctor/queue-management", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(DoctorQueueManagement, {}) }) }) }) }), _jsx(Route, { path: "/doctor/appointments", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(DoctorMyAppointments, {}) }) }) }) }), _jsx(Route, { path: "/doctor/tokens", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(DoctorTokenGeneration, {}) }) }) }) }), _jsx(Route, { path: "/doctor/statistics", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(DoctorQueueStatistics, {}) }) }) }) }), _jsx(Route, { path: "/doctor/profile", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(DoctorProfile, {}) }) }) }) }), _jsx(Route, { path: "/patients", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(ComingSoon, { featureName: "My Patients" }) }) }) }), _jsx(Route, { path: "/consultations", element: _jsx(ProtectedRoute, { allowedRoles: ['DOCTOR'], children: _jsx(MainLayout, { children: _jsx(ComingSoon, { featureName: "Consultations" }) }) }) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(ProtectedRoute, { allowedRoles: ['ADMIN'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(AdminDashboard, {}) }) }) }) }), _jsx(Route, { path: "/admin/users", element: _jsx(ProtectedRoute, { allowedRoles: ['ADMIN'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(UserManagement, {}) }) }) }) }), _jsx(Route, { path: "/admin/doctors", element: _jsx(ProtectedRoute, { allowedRoles: ['ADMIN'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(DoctorManagement, {}) }) }) }) }), _jsx(Route, { path: "/admin/doctors/create", element: _jsx(ProtectedRoute, { allowedRoles: ['ADMIN'], children: _jsx(MainLayout, { children: _jsx(Suspense, { fallback: _jsx(RouteLoadingFallback, {}), children: _jsx(CreateDoctor, {}) }) }) }) }), _jsx(Route, { path: "/admin/analytics", element: _jsx(ProtectedRoute, { allowedRoles: ['ADMIN'], children: _jsx(MainLayout, { children: _jsx("div", { children: "Analytics - Coming Soon" }) }) }) }), _jsx(Route, { path: "/admin/settings", element: _jsx(ProtectedRoute, { allowedRoles: ['ADMIN'], children: _jsx(MainLayout, { children: _jsx("div", { children: "System Settings - Coming Soon" }) }) }) }), _jsx(Route, { path: "/unauthorized", element: _jsxs(Box, { sx: { p: 4, textAlign: 'center' }, children: [_jsx("h1", { children: "Access Denied" }), _jsx("p", { children: "You don't have permission to access this page." })] }) }), _jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
}
