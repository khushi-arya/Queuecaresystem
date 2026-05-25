import axios from 'axios';
/**
 * Axios API Client with interceptors
 * Handles authentication, error handling, and base URL configuration
 */
// Create axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});
/**
 * Request interceptor: Add Authorization header with JWT token
 */
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});
/**
 * Response interceptor: Handle errors and invalid tokens
 */
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Token expired or invalid - clear storage and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
    }
    else if (error.response?.status === 403) {
        console.error('Access forbidden');
        window.location.href = '/unauthorized';
    }
    else if (error.response?.status === 400) {
        console.error('Bad request:', error.response.data);
    }
    else if (error.response?.status === 500) {
        console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
});
/**
 * API Methods
 */
// ============================================
// AUTH ENDPOINTS
// ============================================
export const authAPI = {
    login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
    register: (email, password, firstName, lastName, role, phone) => apiClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
        role,
        phone,
    }),
    logout: () => apiClient.post('/api/auth/logout'),
    refreshToken: () => apiClient.post('/api/auth/refresh'),
    getCurrentUser: () => apiClient.get('/api/auth/me'),
    updateProfile: (userData) => apiClient.put('/api/auth/profile', userData),
    verifyEmail: (token) => apiClient.post('/api/auth/verify-email', { token }),
    requestPasswordReset: (email) => apiClient.post('/api/auth/request-password-reset', { email }),
    resetPassword: (token, newPassword) => apiClient.post('/api/auth/reset-password', { token, newPassword }),
};
// ============================================
// PATIENT ENDPOINTS
// ============================================
export const patientAPI = {
    getAll: (page = 0, pageSize = 20, search = '') => apiClient.get('/api/patients', {
        params: { page, pageSize, search },
    }),
    getById: (id) => apiClient.get(`/api/patients/${id}`),
    create: (patientData) => apiClient.post('/api/patients', patientData),
    update: (id, patientData) => apiClient.put(`/api/patients/${id}`, patientData),
    delete: (id) => apiClient.delete(`/api/patients/${id}`),
    getProfile: () => apiClient.get('/api/patients/profile'),
    updateProfile: (patientData) => apiClient.put('/api/patients/profile', patientData),
    getMedicalHistory: (id) => apiClient.get(`/api/patients/${id}/medical-history`),
    getAppointmentHistory: (id, page = 0, pageSize = 20) => apiClient.get(`/api/patients/${id}/appointments`, {
        params: { page, pageSize },
    }),
};
// ============================================
// DOCTOR ENDPOINTS
// ============================================
export const doctorAPI = {
    getAll: (page = 0, pageSize = 20, specialization = '', isAvailable) => apiClient.get('/api/doctors', {
        params: { page, pageSize, specialization, isAvailable },
    }),
    getById: (id) => apiClient.get(`/api/doctors/${id}`),
    create: (doctorData) => apiClient.post('/api/doctors', doctorData),
    update: (id, doctorData) => apiClient.put(`/api/doctors/${id}`, doctorData),
    delete: (id) => apiClient.delete(`/api/doctors/${id}`),
    getProfile: () => apiClient.get('/api/doctors/profile'),
    updateProfile: (doctorData) => apiClient.put('/api/doctors/profile', doctorData),
    getAvailability: (doctorId, date) => apiClient.get(`/api/doctors/${doctorId}/availability`, {
        params: { date },
    }),
    setAvailability: (doctorId, availabilityData) => apiClient.post(`/api/doctors/${doctorId}/availability`, availabilityData),
    getAppointments: (page = 0, pageSize = 20, status) => apiClient.get('/api/doctors/appointments', {
        params: { page, pageSize, status },
    }),
    updateAppointmentStatus: (appointmentId, status) => apiClient.put(`/api/doctors/appointments/${appointmentId}`, { status }),
    getReviews: (doctorId, page = 0, pageSize = 20) => apiClient.get(`/api/doctors/${doctorId}/reviews`, {
        params: { page, pageSize },
    }),
    getSchedule: (doctorId) => apiClient.get(`/api/doctors/${doctorId}/schedule`),
};
// ============================================
// APPOINTMENT ENDPOINTS
// ============================================
export const appointmentAPI = {
    getAll: (page = 0, pageSize = 20, status, startDate, endDate) => apiClient.get('/api/appointments', {
        params: { page, pageSize, status, startDate, endDate },
    }),
    getById: (id) => apiClient.get(`/api/appointments/${id}`),
    create: (appointmentData) => apiClient.post('/api/appointments', appointmentData),
    update: (id, appointmentData) => apiClient.put(`/api/appointments/${id}`, appointmentData),
    delete: (id) => apiClient.delete(`/api/appointments/${id}`),
    cancel: (id, reason) => apiClient.post(`/api/appointments/${id}/cancel`, { reason }),
    reschedule: (id, newDateTime) => apiClient.post(`/api/appointments/${id}/reschedule`, {
        appointmentDateTime: newDateTime,
    }),
    confirm: (id) => apiClient.post(`/api/appointments/${id}/confirm`),
    complete: (id, notes) => apiClient.post(`/api/appointments/${id}/complete`, { notes }),
    getByPatient: (patientId, page = 0, pageSize = 20) => apiClient.get(`/api/appointments/patient/${patientId}`, {
        params: { page, pageSize },
    }),
    getByDoctor: (doctorId, page = 0, pageSize = 20) => apiClient.get(`/api/appointments/doctor/${doctorId}`, {
        params: { page, pageSize },
    }),
    getAvailableSlots: (doctorId, date) => apiClient.get(`/api/appointments/doctor/${doctorId}/available-slots`, { params: { date } }),
};
// ============================================
// QUEUE ENDPOINTS
// ============================================
export const queueAPI = {
    getAll: (page = 0, pageSize = 20) => apiClient.get('/api/queues', { params: { page, pageSize } }),
    getById: (id) => apiClient.get(`/api/queues/${id}`),
    create: (queueData) => apiClient.post('/api/queues', queueData),
    update: (id, queueData) => apiClient.put(`/api/queues/${id}`, queueData),
    delete: (id) => apiClient.delete(`/api/queues/${id}`),
    getByDoctor: (doctorId) => apiClient.get(`/api/queues/doctor/${doctorId}`),
    getQueueStatus: (doctorId) => apiClient.get(`/api/queues/${doctorId}/status`),
    updateQueueStatus: (doctorId, isActive) => apiClient.put(`/api/queues/${doctorId}/status`, { isActive }),
};
// ============================================
// TOKEN ENDPOINTS (Doctor Queue Tokens)
// ============================================
export const tokenAPI = {
    getAll: (page = 0, pageSize = 20, status) => apiClient.get('/api/tokens', { params: { page, pageSize, status } }),
    getById: (id) => apiClient.get(`/api/tokens/${id}`),
    generateToken: (doctorId, patientId) => apiClient.post('/api/tokens', { doctorId, patientId }),
    updateTokenStatus: (id, status) => apiClient.put(`/api/tokens/${id}`, { status }),
    getCurrentToken: (doctorId) => apiClient.get(`/api/tokens/doctor/${doctorId}/current`),
    getQueueTokens: (doctorId, page = 0, pageSize = 50) => apiClient.get(`/api/tokens/doctor/${doctorId}`, {
        params: { page, pageSize },
    }),
    callNextToken: (doctorId) => apiClient.post(`/api/tokens/doctor/${doctorId}/call-next`),
    completeToken: (id) => apiClient.put(`/api/tokens/${id}/complete`),
    cancelToken: (id, reason) => apiClient.put(`/api/tokens/${id}/cancel`, { reason }),
};
// ============================================
// ADMIN ENDPOINTS
// ============================================
export const adminAPI = {
    getDashboardStats: () => apiClient.get('/api/admin/stats'),
    getSystemLogs: (page = 0, pageSize = 20, level) => apiClient.get('/api/admin/logs', { params: { page, pageSize, level } }),
    getUserStats: () => apiClient.get('/api/admin/users/stats'),
    getAppointmentStats: (startDate, endDate) => apiClient.get('/api/admin/appointments/stats', {
        params: { startDate, endDate },
    }),
    approveDoctor: (doctorId) => apiClient.post(`/api/admin/doctors/${doctorId}/approve`),
    rejectDoctor: (doctorId, reason) => apiClient.post(`/api/admin/doctors/${doctorId}/reject`, { reason }),
    disableUser: (userId) => apiClient.post(`/api/admin/users/${userId}/disable`),
    enableUser: (userId) => apiClient.post(`/api/admin/users/${userId}/enable`),
    generateReport: (reportType, params) => apiClient.post(`/api/admin/reports/${reportType}`, params),
    getAllUsers: (page = 0, pageSize = 20, role) => apiClient.get('/api/admin/users', { params: { page, pageSize, role } }),
    promoteUserToDoctor: (userId) => apiClient.put(`/api/admin/promote/${userId}`),
};
// ============================================
// NOTIFICATION ENDPOINTS
// ============================================
export const notificationAPI = {
    getAll: (page = 0, pageSize = 20, read) => apiClient.get('/api/notifications', {
        params: { page, pageSize, read },
    }),
    getById: (id) => apiClient.get(`/api/notifications/${id}`),
    markAsRead: (id) => apiClient.put(`/api/notifications/${id}/read`),
    markAllAsRead: () => apiClient.post('/api/notifications/mark-all-read'),
    delete: (id) => apiClient.delete(`/api/notifications/${id}`),
    getPreferences: () => apiClient.get('/api/notifications/preferences'),
    updatePreferences: (preferences) => apiClient.put('/api/notifications/preferences', preferences),
    getUnreadCount: () => apiClient.get('/api/notifications/unread-count'),
};
export default apiClient;
