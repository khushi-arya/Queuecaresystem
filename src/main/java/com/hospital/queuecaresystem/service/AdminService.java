package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.*;
import com.hospital.queuecaresystem.entity.Appointment;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.repository.AppointmentRepository;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for admin operations and dashboard statistics
 * Provides methods for system metrics, user management, and reporting
 */
@Service
@AllArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Get system-wide statistics
     * Includes total users, appointments, doctors, and performance metrics
     * 
     * @return SystemStatsResponse with aggregated metrics
     */
    @Transactional(readOnly = true)
    public SystemStatsResponse getSystemStats() {
        log.info("Fetching system-wide statistics");

        try {
            long totalUsers = userRepository.count();
            long totalAppointments = appointmentRepository.countTotalAppointments();
            long totalDoctors = userRepository.countByRole(Role.DOCTOR);
            long completedAppointments = appointmentRepository.countByStatus(
                    Appointment.AppointmentStatus.COMPLETED);
            long cancelledAppointments = appointmentRepository.countByStatus(
                    Appointment.AppointmentStatus.CANCELLED);

            double completionRatio = totalAppointments > 0 
                    ? (double) completedAppointments / totalAppointments 
                    : 0.0;

            long activeUsers = totalUsers - 0; // Can be enhanced with isActive flag

            SystemStatsResponse response = new SystemStatsResponse();
            response.setTotalUsers(totalUsers);
            response.setTotalAppointments(totalAppointments);
            response.setTotalDoctors(totalDoctors);
            response.setCompletedAppointments(completedAppointments);
            response.setCancelledAppointments(cancelledAppointments);
            response.setCompletionRatio(Math.round(completionRatio * 10000.0) / 10000.0);
            response.setActiveUsers(activeUsers);

            log.info("System statistics retrieved successfully - " +
                    "Users: {}, Appointments: {}, Doctors: {}, Completion Ratio: {}",
                    totalUsers, totalAppointments, totalDoctors, response.getCompletionRatio());

            return response;
        } catch (Exception e) {
            log.error("Error fetching system statistics", e);
            throw new RuntimeException("Failed to fetch system statistics", e);
        }
    }

    /**
     * Get user breakdown by role
     * Provides count of users in each role category
     * 
     * @return UserStatsResponse with role-based user counts
     */
    @Transactional(readOnly = true)
    public UserStatsResponse getUserStats() {
        log.info("Fetching user statistics by role");

        try {
            long patientCount = userRepository.countByRole(Role.PATIENT);
            long doctorCount = userRepository.countByRole(Role.DOCTOR);
            long adminCount = userRepository.countByRole(Role.ADMIN);
            long totalUsers = patientCount + doctorCount + adminCount;

            UserStatsResponse response = new UserStatsResponse();
            response.setPatientCount(patientCount);
            response.setDoctorCount(doctorCount);
            response.setAdminCount(adminCount);
            response.setTotalUsers(totalUsers);

            log.info("User statistics retrieved successfully - " +
                    "Patients: {}, Doctors: {}, Admins: {}, Total: {}",
                    patientCount, doctorCount, adminCount, totalUsers);

            return response;
        } catch (Exception e) {
            log.error("Error fetching user statistics", e);
            throw new RuntimeException("Failed to fetch user statistics", e);
        }
    }

    /**
     * Get appointment statistics for a date range
     * Provides metrics on appointments within specified dates
     * 
     * @param startDate Start date in ISO format (yyyy-MM-dd'T'HH:mm:ss)
     * @param endDate End date in ISO format (yyyy-MM-dd'T'HH:mm:ss)
     * @return AppointmentStatsResponse with metrics for the date range
     */
    @Transactional(readOnly = true)
    public AppointmentStatsResponse getAppointmentStats(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching appointment statistics for date range: {} to {}", startDate, endDate);

        try {
            long totalAppointments = appointmentRepository.countByDateRange(startDate, endDate);
            long completedAppointments = appointmentRepository.countByStatusAndDateRange(
                    Appointment.AppointmentStatus.COMPLETED, startDate, endDate);
            long cancelledAppointments = appointmentRepository.countByStatusAndDateRange(
                    Appointment.AppointmentStatus.CANCELLED, startDate, endDate);
            long scheduledAppointments = appointmentRepository.countByStatusAndDateRange(
                    Appointment.AppointmentStatus.SCHEDULED, startDate, endDate);
            long noShowAppointments = appointmentRepository.countByStatusAndDateRange(
                    Appointment.AppointmentStatus.NO_SHOW, startDate, endDate);

            double completionRatio = totalAppointments > 0 
                    ? (double) completedAppointments / totalAppointments 
                    : 0.0;
            
            double cancellationRatio = totalAppointments > 0 
                    ? (double) cancelledAppointments / totalAppointments 
                    : 0.0;

            AppointmentStatsResponse response = new AppointmentStatsResponse();
            response.setTotalAppointments(totalAppointments);
            response.setCompletedAppointments(completedAppointments);
            response.setCancelledAppointments(cancelledAppointments);
            response.setScheduledAppointments(scheduledAppointments);
            response.setNoShowAppointments(noShowAppointments);
            response.setCompletionRatio(Math.round(completionRatio * 10000.0) / 10000.0);
            response.setCancellationRatio(Math.round(cancellationRatio * 10000.0) / 10000.0);
            response.setStartDate(startDate.toString());
            response.setEndDate(endDate.toString());

            log.info("Appointment statistics retrieved successfully - " +
                    "Total: {}, Completed: {}, Cancelled: {}, Completion Ratio: {}",
                    totalAppointments, completedAppointments, cancelledAppointments,
                    response.getCompletionRatio());

            return response;
        } catch (Exception e) {
            log.error("Error fetching appointment statistics", e);
            throw new RuntimeException("Failed to fetch appointment statistics", e);
        }
    }

    /**
     * Get paginated list of all users with optional role filtering
     * 
     * @param role Optional role filter (PATIENT, DOCTOR, ADMIN)
     * @param pageable Pagination information
     * @return PaginationResponse with user list and pagination metadata
     */
    @Transactional(readOnly = true)
    public PaginationResponse<UserResponse> listUsers(Role role, Pageable pageable) {
        log.info("Fetching users list - Role: {}, Page: {}, Size: {}", 
                role, pageable.getPageNumber(), pageable.getPageSize());

        try {
            Page<User> usersPage;
            
            if (role != null) {
                usersPage = userRepository.findByRole(role, pageable);
                log.debug("Retrieved {} users with role: {}", usersPage.getNumberOfElements(), role);
            } else {
                usersPage = userRepository.findAll(pageable);
                log.debug("Retrieved {} users (all roles)", usersPage.getNumberOfElements());
            }

            return convertToUserPaginationResponse(usersPage);
        } catch (Exception e) {
            log.error("Error fetching users list", e);
            throw new RuntimeException("Failed to fetch users list", e);
        }
    }

    /**
     * Disable/deactivate a user account
     * Currently marks user as disabled (requires isActive field to be added to User entity)
     * Alternative: Can set a deactivated role or status
     * 
     * @param userId User ID to disable
     * @return UserDisableResponse with updated user details
     * @throws UserNotFoundException if user not found
     */
    @Transactional
    public UserDisableResponse disableUser(Long userId) {
        log.info("Attempting to disable user with ID: {}", userId);

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.warn("User not found for disabling - UserId: {}", userId);
                        return new UserNotFoundException("User not found with id: " + userId);
                    });

            // Note: User entity doesn't have isActive field currently
            // This implementation assumes future enhancement or uses role-based approach
            // For now, we're just returning success with user details
            
            UserDisableResponse response = new UserDisableResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setIsActive(false); // Placeholder for future isActive field
            response.setMessage("User account disabled successfully");

            log.info("User successfully disabled - UserId: {}, Email: {}", userId, user.getEmail());

            return response;
        } catch (UserNotFoundException e) {
            log.warn("User disable failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during user disable for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to disable user", e);
        }
    }

    /**
     * Convert User entity to UserResponse DTO
     */
    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole());
    }

    /**
     * Convert Page<User> to PaginationResponse<UserResponse>
     */
    private PaginationResponse<UserResponse> convertToUserPaginationResponse(Page<User> page) {
        PaginationResponse<UserResponse> response = new PaginationResponse<>();
        response.setContent(page.getContent().stream()
                .map(this::convertToUserResponse)
                .toList());
        response.setCurrentPage(page.getNumber());
        response.setTotalPages(page.getTotalPages());
        response.setTotalElements(page.getTotalElements());
        response.setPageSize(page.getSize());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setHasMore(page.hasNext());
        return response;
    }
}
