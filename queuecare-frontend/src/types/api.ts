/**
 * API Types and Data Transfer Objects
 * Defines all TypeScript interfaces for type-safe API communication
 */

/**
 * User Roles in the system
 */
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

/**
 * User interface - represents authenticated user
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Patient profile information
 */
export interface Patient {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Doctor profile information
 */
export interface Doctor {
  id: string | number;
  userId: number | string;
  name: string;
  specialization: string;
  licenseNumber?: string;
  qualifications?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  workingHours?: string;
  maxPatientsPerDay?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  bio?: string;
  experience?: number;
  averageRating?: number;
  totalReviews?: number;
  hospitalAffiliation?: string;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Appointment information
 */
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  doctor?: {
    id: number;
    name: string;
    specialization: string;
  };
  appointmentDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Doctor queue/availability slot
 */
export interface DoctorQueue {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  currentPatients: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Doctor token for queue management
 */
export interface DoctorToken {
  id: string;
  doctorId: string;
  tokenNumber: number;
  patientId: string;
  status: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  issuedAt: string;
  calledAt?: string;
  completedAt?: string;
}

/**
 * Notification types and structure
 */
export type NotificationType = 'APPOINTMENT' | 'QUEUE' | 'SYSTEM' | 'ALERT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  preferences?: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  queueUpdates: boolean;
}

/**
 * AUTH REQUEST/RESPONSE DTOs
 */

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response payload
 */
export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number; // in seconds
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

/**
 * Register response payload
 */
export interface RegisterResponse {
  token: string;
  user: User;
  message: string;
}

/**
 * Generic API Error Response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * PAGINATED RESPONSE WRAPPER
 */

/**
 * Paginated response wrapper for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
  success: boolean;
}

/**
 * Single item response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
  success: boolean;
}

/**
 * LIST RESPONSE TYPES
 */

export type PaginatedPatients = PaginatedResponse<Patient>;
export type PaginatedDoctors = PaginatedResponse<Doctor>;
export type PaginatedAppointments = PaginatedResponse<Appointment>;
export type PaginatedQueues = PaginatedResponse<DoctorQueue>;
export type PaginatedTokens = PaginatedResponse<DoctorToken>;
export type PaginatedNotifications = PaginatedResponse<Notification>;

/**
 * Query parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  search?: string;
}

/**
 * Doctor specific query params
 */
export interface DoctorListParams extends ListQueryParams {
  specialization?: string;
  isAvailable?: boolean;
}

/**
 * Appointment query params
 */
export interface AppointmentListParams extends ListQueryParams {
  status?: Appointment['status'];
  startDate?: string;
  endDate?: string;
}
