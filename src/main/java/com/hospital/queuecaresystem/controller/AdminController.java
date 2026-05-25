package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.*;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.exception.UserAlreadyDoctorException;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.service.AdminService;
import com.hospital.queuecaresystem.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;
    

    /**
     * Endpoint 1: GET /api/admin/stats
     * Get system-wide statistics including users, appointments, and performance metrics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        log.info("Admin request for system statistics");

        try {
            SystemStatsResponse stats = adminService.getSystemStats();
            log.info("System statistics retrieved successfully");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching system statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Failed to fetch system statistics", e.getMessage()));
        }
    }

    /**
     * Endpoint 2: GET /api/admin/users/stats
     * Get user breakdown by role (patient, doctor, admin counts)
     */
    @GetMapping("/users/stats")
    public ResponseEntity<?> getUserStats() {
        log.info("Admin request for user statistics");

        try {
            UserStatsResponse stats = adminService.getUserStats();
            log.info("User statistics retrieved successfully");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching user statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Failed to fetch user statistics", e.getMessage()));
        }
    }

    /**
     * Endpoint 3: GET /api/admin/appointments/stats?startDate=ISO&endDate=ISO
     * Get appointment statistics for a date range
     */
    @GetMapping("/appointments/stats")
    public ResponseEntity<?> getAppointmentStats(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {
        
        log.info("Admin request for appointment statistics - Start: {}, End: {}", startDate, endDate);

        try {
            // Default to last 30 days if dates not provided
            LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();
            LocalDateTime start = startDate != null ? startDate : end.minusDays(30);

            AppointmentStatsResponse stats = adminService.getAppointmentStats(start, end);
            log.info("Appointment statistics retrieved successfully for range: {} to {}", start, end);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching appointment statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Failed to fetch appointment statistics", e.getMessage()));
        }
    }

    /**
     * Endpoint 4: GET /api/admin/users?page=0&size=20&role=PATIENT
     * Get paginated list of all users with optional role filtering
     */
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort) {
        
        log.info("Admin request for user list - Page: {}, Size: {}, Role: {}, Sort: {}", 
                page, size, role, sort);

        try {
            // Parse sort parameter (format: "field,direction")
            String[] sortParts = sort.split(",");
            String sortField = sortParts.length > 0 ? sortParts[0] : "id";
            Sort.Direction sortDirection = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1]) 
                    ? Sort.Direction.ASC 
                    : Sort.Direction.DESC;

            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

            // Parse role filter if provided
            Role roleFilter = null;
            if (role != null && !role.isEmpty()) {
                try {
                    roleFilter = Role.valueOf(role.toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role provided: {}", role);
                    return ResponseEntity.badRequest()
                            .body(new ApiErrorResponse("Invalid role provided", 
                                    "Role must be one of: PATIENT, DOCTOR, ADMIN"));
                }
            }

            PaginationResponse<UserResponse> response = adminService.listUsers(roleFilter, pageable);
            log.info("User list retrieved successfully - Page: {}, Total: {}, Size: {}", 
                    page, response.getTotalElements(), response.getContent().size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching user list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Failed to fetch user list", e.getMessage()));
        }
    }

    /**
     * Endpoint 6: POST /api/admin/users/{userId}/disable
     * Disable/deactivate a user account
     */
    @PostMapping("/users/{userId}/disable")
    public ResponseEntity<?> disableUser(@PathVariable Long userId) {
        log.info("Admin request to disable user with ID: {}", userId);

        try {
            UserDisableResponse response = adminService.disableUser(userId);
            log.info("User successfully disabled - UserId: {}", userId);
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException e) {
            log.warn("Disable user failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse("User not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error disabling user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("Failed to disable user", e.getMessage()));
        }
    }

    /**
     * Endpoint 5: PUT /api/admin/promote/{userId}
     * Promote a user from PATIENT to DOCTOR role
     * Only accessible by ADMIN users
     *
     * @param userId The ID of the user to promote
     * @return PromotionResponse with promotion details
     */
    @PutMapping("/promote/{userId}")
    public ResponseEntity<?> promoteUserToDoctor(@PathVariable Long userId) {
        log.info("Admin promotion request for user ID: {}", userId);

        try {
            User promotedUser = userService.promoteToDoctor(userId);
            
            PromotionResponse response = new PromotionResponse(
                    promotedUser.getId(),
                    promotedUser.getEmail(),
                    null,  // Previous role will be PATIENT, but we don't have it here
                    promotedUser.getRole()
            );

            log.info("User {} successfully promoted to DOCTOR by admin", userId);
            return ResponseEntity.ok(response);

        } catch (UserNotFoundException e) {
            log.warn("Promotion failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new PromotionResponse() {{
                        setMessage("User not found with id: " + userId);
                    }});

        } catch (UserAlreadyDoctorException e) {
            log.warn("Promotion failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PromotionResponse() {{
                        setMessage("User is already promoted to DOCTOR role");
                    }});

        } catch (Exception e) {
            log.error("Unexpected error during promotion for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PromotionResponse() {{
                        setMessage("An unexpected error occurred during promotion");
                    }});
        }
    }
}
