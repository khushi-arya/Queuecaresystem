import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

/**
 * Axios API Client with interceptors
 * Handles authentication, error handling, and base URL configuration
 */

// Create axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request interceptor: Add Authorization header with JWT token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors and invalid tokens
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Access forbidden');
      window.location.href = '/unauthorized';
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

/**
 * API Methods
 */

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),

  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    phone?: string
  ) =>
    apiClient.post('/api/auth/register', {
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

  updateProfile: (userData: any) =>
    apiClient.put('/api/auth/profile', userData),

  verifyEmail: (token: string) =>
    apiClient.post('/api/auth/verify-email', { token }),

  requestPasswordReset: (email: string) =>
    apiClient.post('/api/auth/request-password-reset', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/api/auth/reset-password', { token, newPassword }),
};

// ============================================
// PATIENT ENDPOINTS
// ============================================

export const patientAPI = {
  getAll: (page = 0, pageSize = 20, search = '') =>
    apiClient.get('/api/patients', {
      params: { page, pageSize, search },
    }),

  getById: (id: string) => apiClient.get(`/api/patients/${id}`),

  create: (patientData: any) =>
    apiClient.post('/api/patients', patientData),

  update: (id: string, patientData: any) =>
    apiClient.put(`/api/patients/${id}`, patientData),

  delete: (id: string) => apiClient.delete(`/api/patients/${id}`),

  getProfile: () => apiClient.get('/api/patients/profile'),

  updateProfile: (patientData: any) =>
    apiClient.put('/api/patients/profile', patientData),

  getMedicalHistory: (id: string) =>
    apiClient.get(`/api/patients/${id}/medical-history`),

  getAppointmentHistory: (id: string, page = 0, pageSize = 20) =>
    apiClient.get(`/api/patients/${id}/appointments`, {
      params: { page, pageSize },
    }),
};

// ============================================
// DOCTOR ENDPOINTS
// ============================================

export const doctorAPI = {
  getAll: (page = 0, pageSize = 20, specialization = '', isAvailable?: boolean) =>
    apiClient.get('/api/doctors', {
      params: { page, pageSize, specialization, isAvailable },
    }),

  getById: (id: string) => apiClient.get(`/api/doctors/${id}`),

  create: (doctorData: any) =>
    apiClient.post('/api/doctors', doctorData),

  update: (id: string, doctorData: any) =>
    apiClient.put(`/api/doctors/${id}`, doctorData),

  delete: (id: string) => apiClient.delete(`/api/doctors/${id}`),

  getProfile: () => apiClient.get('/api/doctors/profile'),

  updateProfile: (doctorData: any) =>
    apiClient.put('/api/doctors/profile', doctorData),

  getAvailability: (doctorId: string, date: string) =>
    apiClient.get(`/api/doctors/${doctorId}/availability`, {
      params: { date },
    }),

  setAvailability: (doctorId: string, availabilityData: any) =>
    apiClient.post(`/api/doctors/${doctorId}/availability`, availabilityData),

  getAppointments: (page = 0, pageSize = 20, status?: string) =>
    apiClient.get('/api/doctors/appointments', {
      params: { page, pageSize, status },
    }),

  updateAppointmentStatus: (appointmentId: string, status: string) =>
    apiClient.put(`/api/doctors/appointments/${appointmentId}`, { status }),

  getReviews: (doctorId: string, page = 0, pageSize = 20) =>
    apiClient.get(`/api/doctors/${doctorId}/reviews`, {
      params: { page, pageSize },
    }),

  getSchedule: (doctorId: string) =>
    apiClient.get(`/api/doctors/${doctorId}/schedule`),
};

// ============================================
// APPOINTMENT ENDPOINTS
// ============================================

export const appointmentAPI = {
  getAll: (page = 0, pageSize = 20, status?: string, startDate?: string, endDate?: string) =>
    apiClient.get('/api/appointments', {
      params: { page, pageSize, status, startDate, endDate },
    }),

  getById: (id: string) => apiClient.get(`/api/appointments/${id}`),

  create: (appointmentData: any) =>
    apiClient.post('/api/appointments', appointmentData),

  update: (id: string, appointmentData: any) =>
    apiClient.put(`/api/appointments/${id}`, appointmentData),

  delete: (id: string) => apiClient.delete(`/api/appointments/${id}`),

  cancel: (id: string, reason?: string) =>
    apiClient.post(`/api/appointments/${id}/cancel`, { reason }),

  reschedule: (id: string, newDateTime: string) =>
    apiClient.post(`/api/appointments/${id}/reschedule`, {
      appointmentDateTime: newDateTime,
    }),

  confirm: (id: string) =>
    apiClient.post(`/api/appointments/${id}/confirm`),

  complete: (id: string, notes?: string) =>
    apiClient.post(`/api/appointments/${id}/complete`, { notes }),

  getByPatient: (patientId: string, page = 0, pageSize = 20) =>
    apiClient.get(`/api/appointments/patient/${patientId}`, {
      params: { page, pageSize },
    }),

  getByDoctor: (doctorId: string, page = 0, pageSize = 20) =>
    apiClient.get(`/api/appointments/doctor/${doctorId}`, {
      params: { page, pageSize },
    }),

  getAvailableSlots: (doctorId: string | number, date: string) =>
    apiClient.get(`/api/appointments/doctor/${doctorId}/available-slots`, { params: { date } }),
};

// ============================================
// QUEUE ENDPOINTS
// ============================================

export const queueAPI = {
  getAll: (page = 0, pageSize = 20) =>
    apiClient.get('/api/queues', { params: { page, pageSize } }),

  getById: (id: string) => apiClient.get(`/api/queues/${id}`),

  create: (queueData: any) =>
    apiClient.post('/api/queues', queueData),

  update: (id: string, queueData: any) =>
    apiClient.put(`/api/queues/${id}`, queueData),

  delete: (id: string) => apiClient.delete(`/api/queues/${id}`),

  getByDoctor: (doctorId: string) =>
    apiClient.get(`/api/queues/doctor/${doctorId}`),

  getQueueStatus: (doctorId: string) =>
    apiClient.get(`/api/queues/${doctorId}/status`),

  updateQueueStatus: (doctorId: string, isActive: boolean) =>
    apiClient.put(`/api/queues/${doctorId}/status`, { isActive }),
};

// ============================================
// TOKEN ENDPOINTS (Doctor Queue Tokens)
// ============================================

export const tokenAPI = {
  getAll: (page = 0, pageSize = 20, status?: string) =>
    apiClient.get('/api/tokens', { params: { page, pageSize, status } }),

  getById: (id: string) => apiClient.get(`/api/tokens/${id}`),

  generateToken: (doctorId: string, patientId: string) =>
    apiClient.post('/api/tokens', { doctorId, patientId }),

  updateTokenStatus: (id: string, status: string) =>
    apiClient.put(`/api/tokens/${id}`, { status }),

  getCurrentToken: (doctorId: string) =>
    apiClient.get(`/api/tokens/doctor/${doctorId}/current`),

  getQueueTokens: (doctorId: string, page = 0, pageSize = 50) =>
    apiClient.get(`/api/tokens/doctor/${doctorId}`, {
      params: { page, pageSize },
    }),

  callNextToken: (doctorId: string) =>
    apiClient.post(`/api/tokens/doctor/${doctorId}/call-next`),

  completeToken: (id: string) =>
    apiClient.put(`/api/tokens/${id}/complete`),

  cancelToken: (id: string, reason?: string) =>
    apiClient.put(`/api/tokens/${id}/cancel`, { reason }),
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const adminAPI = {
  getDashboardStats: () =>
    apiClient.get('/api/admin/stats'),

  getSystemLogs: (page = 0, pageSize = 20, level?: string) =>
    apiClient.get('/api/admin/logs', { params: { page, pageSize, level } }),

  getUserStats: () =>
    apiClient.get('/api/admin/users/stats'),

  getAppointmentStats: (startDate?: string, endDate?: string) =>
    apiClient.get('/api/admin/appointments/stats', {
      params: { startDate, endDate },
    }),

  approveDoctor: (doctorId: string) =>
    apiClient.post(`/api/admin/doctors/${doctorId}/approve`),

  rejectDoctor: (doctorId: string, reason: string) =>
    apiClient.post(`/api/admin/doctors/${doctorId}/reject`, { reason }),

  disableUser: (userId: string) =>
    apiClient.post(`/api/admin/users/${userId}/disable`),

  enableUser: (userId: string) =>
    apiClient.post(`/api/admin/users/${userId}/enable`),

  generateReport: (reportType: string, params: any) =>
    apiClient.post(`/api/admin/reports/${reportType}`, params),

  getAllUsers: (page = 0, pageSize = 20, role?: string) =>
    apiClient.get('/api/admin/users', { params: { page, pageSize, role } }),

  promoteUserToDoctor: (userId: string) =>
    apiClient.put(`/api/admin/promote/${userId}`),
};

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================

export const notificationAPI = {
  getAll: (page = 0, pageSize = 20, read?: boolean) =>
    apiClient.get('/api/notifications', {
      params: { page, pageSize, read },
    }),

  getById: (id: string) => apiClient.get(`/api/notifications/${id}`),

  markAsRead: (id: string) =>
    apiClient.put(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.post('/api/notifications/mark-all-read'),

  delete: (id: string) => apiClient.delete(`/api/notifications/${id}`),

  getPreferences: () =>
    apiClient.get('/api/notifications/preferences'),

  updatePreferences: (preferences: any) =>
    apiClient.put('/api/notifications/preferences', preferences),

  getUnreadCount: () =>
    apiClient.get('/api/notifications/unread-count'),
};

export default apiClient;
