import React, { Suspense, lazy, useEffect } from 'react';
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
const NotificationPreferences = lazy(() =>
  import('@pages/NotificationPreferences').then((m) => ({ default: m.NotificationPreferences }))
);

// Lazy loaded: Patient pages (code splitting)
const PatientDashboard = lazy(() =>
  import('@pages/Patient/Dashboard').then((m) => ({ default: m.PatientDashboard }))
);
const PatientProfile = lazy(() =>
  import('@pages/Patient/Profile').then((m) => ({ default: m.PatientProfile }))
);
const BookAppointment = lazy(() =>
  import('@pages/Patient/BookAppointment').then((m) => ({ default: m.BookAppointment }))
);
const PatientMyAppointments = lazy(() =>
  import('@pages/Patient/MyAppointments').then((m) => ({ default: m.PatientMyAppointments }))
);
const ViewDoctors = lazy(() =>
  import('@pages/Patient/ViewDoctors').then((m) => ({ default: m.ViewDoctors }))
);

// Lazy loaded: Doctor pages (code splitting)
const DoctorDashboard = lazy(() =>
  import('@pages/Doctor/Dashboard').then((m) => ({ default: m.DoctorDashboard }))
);
const DoctorQueueManagement = lazy(() =>
  import('@pages/Doctor/QueueManagement').then((m) => ({ default: m.QueueManagement }))
);
const DoctorMyAppointments = lazy(() =>
  import('@pages/Doctor/MyAppointments').then((m) => ({ default: m.DoctorMyAppointments }))
);
const DoctorTokenGeneration = lazy(() =>
  import('@pages/Doctor/TokenGeneration').then((m) => ({ default: m.TokenGeneration }))
);
const DoctorQueueStatistics = lazy(() =>
  import('@pages/Doctor/QueueStatistics').then((m) => ({ default: m.QueueStatistics }))
);
const DoctorProfile = lazy(() =>
  import('@pages/Doctor/Profile').then((m) => ({ default: m.DoctorProfile }))
);

// Lazy loaded: Admin pages (code splitting)
const AdminDashboard = lazy(() =>
  import('@pages/Admin/Dashboard').then((m) => ({ default: m.AdminDashboard }))
);
const UserManagement = lazy(() =>
  import('@pages/Admin/UserManagement').then((m) => ({ default: m.UserManagement }))
);
const DoctorManagement = lazy(() =>
  import('@pages/Admin/DoctorManagement').then((m) => ({ default: m.DoctorManagement }))
);
const CreateDoctor = lazy(() =>
  import('@pages/Admin/CreateDoctor').then((m) => ({ default: m.CreateDoctor }))
);

/**
 * Fallback component shown while code-split chunks load
 */
const RouteLoadingFallback = () => <LoadingSpinner fullscreen message="Loading..." />;

/**
 * Redirect component for generic /dashboard route
 * Routes to role-specific dashboard based on user role
 */
const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (user?.role === 'PATIENT') {
      navigate('/patient/dashboard', { replace: true });
    } else if (user?.role === 'DOCTOR') {
      navigate('/doctor/dashboard', { replace: true });
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return <RouteLoadingFallback />;
};

/**
 * Redirect component for generic /profile route
 * Routes to role-specific profile based on user role
 * Falls back to dashboard if profile page doesn't exist for that role
 */
const ProfileRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (user?.role === 'PATIENT') {
      navigate('/patient/profile', { replace: true });
    } else if (user?.role === 'DOCTOR') {
      navigate('/doctor/profile', { replace: true });
    } else if (user?.role === 'ADMIN') {
      // Admin profile doesn't exist yet, redirect to dashboard
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return <RouteLoadingFallback />;
};

/**
 * Redirect component for generic /appointments route
 * Routes to role-specific appointments based on user role
 */
const AppointmentsRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (user?.role === 'PATIENT') {
      navigate('/patient/appointments', { replace: true });
    } else if (user?.role === 'DOCTOR') {
      navigate('/doctor/appointments', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return <RouteLoadingFallback />;
};

/**
 * Redirect component for generic /doctors route
 * Routes to role-specific doctors based on user role
 */
const DoctorsRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    
    if (user?.role === 'PATIENT') {
      navigate('/patient/doctors', { replace: true });
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/doctors', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return <RouteLoadingFallback />;
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
  return (
    <Routes>
      {/* ============================================ */}
      {/* PUBLIC ROUTES */}
      {/* ============================================ */}

      {/* Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Register Route */}
      <Route path="/register" element={<RegisterPage />} />

      {/* ============================================ */}
      {/* PROTECTED ROUTES (WITH MAINLAYOUT) */}
      {/* ============================================ */}

      {/* Dashboard - redirects to role-specific dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardRedirect />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Profile - redirects to role-specific profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfileRedirect />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings - available to all authenticated users */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <div>Settings - Coming Soon</div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Notification Preferences - available to all authenticated users */}
      <Route
        path="/settings/notifications"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <NotificationPreferences />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* PATIENT ROUTES */}
      {/* ============================================ */}

      {/* Patient Dashboard */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <PatientDashboard />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient Profile */}
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <PatientProfile />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Book Appointment */}
      <Route
        path="/patient/book-appointment"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <BookAppointment />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* My Appointments */}
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <PatientMyAppointments />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* View Doctors */}
      <Route
        path="/patient/doctors"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <ViewDoctors />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Role-based Appointments Redirect */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AppointmentsRedirect />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Role-based Doctors Redirect */}
      <Route
        path="/doctors"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DoctorsRedirect />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* DOCTOR ROUTES */}
      {/* ============================================ */}

      {/* Doctor Dashboard */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <DoctorDashboard />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Queue Management */}
      <Route
        path="/doctor/queue-management"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <DoctorQueueManagement />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor My Appointments */}
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <DoctorMyAppointments />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Token Generation */}
      <Route
        path="/doctor/tokens"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <DoctorTokenGeneration />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Queue Statistics */}
      <Route
        path="/doctor/statistics"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <DoctorQueueStatistics />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Profile */}
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <DoctorProfile />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Patients */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <ComingSoon featureName="My Patients" />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Consultations */}
      <Route
        path="/consultations"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MainLayout>
              <ComingSoon featureName="Consultations" />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* ADMIN ROUTES */}
      {/* ============================================ */}

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Users Management */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <UserManagement />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Doctors Management */}
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <DoctorManagement />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Create Doctor */}
      <Route
        path="/admin/doctors/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <Suspense fallback={<RouteLoadingFallback />}>
                <CreateDoctor />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Analytics */}
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <div>Analytics - Coming Soon</div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Settings */}
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout>
              <div>System Settings - Coming Soon</div>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* ERROR ROUTES */}
      {/* ============================================ */}

      {/* Unauthorized Access */}
      <Route
        path="/unauthorized"
        element={
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
          </Box>
        }
      />

      {/* Home - Landing page */}
      <Route path="/" element={<HomePage />} />

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
