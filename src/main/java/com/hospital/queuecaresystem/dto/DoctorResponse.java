package com.hospital.queuecaresystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;
import java.time.LocalDateTime;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;

/**
 * Response DTO for Doctor details
 * 
 * This DTO is used for all API responses related to doctor information.
 * It provides a safe way to return doctor data without exposing JPA entities.
 * 
 * Usage:
 * - GET /api/doctors/{doctorId}
 * - GET /api/doctors/user/{userId}
 * - GET /api/doctors/specialization/{specialization}
 * - POST /api/doctors/{userId} (returns created doctor)
 * - PUT /api/doctors/{doctorId} (returns updated doctor)
 * 
 * Security:
 * - Does NOT include the associated User entity (only userId)
 * - Does NOT include sensitive security information
 * - Safe to expose via REST API
 * 
 * Time Format:
 * All time fields use LocalTime format (HH:mm:ss)
 * Example: "09:00:00", "17:30:00"
 * 
 * @see DoctorRequest for input validation rules
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {

    /**
     * Unique identifier of the doctor
     */
    private Long id;

    /**
     * ID of the User account associated with this doctor
     */
    private Long userId;

    /**
     * Doctor's full name
     */
    private String name;

    /**
     * Doctor's medical specialization (e.g., "Cardiology", "Pediatrics", "Orthopedics")
     */
    private String specialization;

    /**
     * Time when the doctor's shift starts (HH:mm:ss format)
     * Example: 09:00:00 for 9:00 AM
     */
    private LocalTime shiftStartTime;

    /**
     * Time when the doctor's shift ends (HH:mm:ss format)
     * Example: 17:30:00 for 5:30 PM
     */
    private LocalTime shiftEndTime;

    /**
     * Time when the doctor's break starts (HH:mm:ss format, optional)
     * Example: 12:00:00 for 12:00 PM (lunch break)
     */
    private LocalTime breakStartTime;

    /**
     * Time when the doctor's break ends (HH:mm:ss format, optional)
     * Example: 13:00:00 for 1:00 PM
     */
    private LocalTime breakEndTime;

    /**
     * Maximum number of patients the doctor can see per day
     * Range: 1-100 patients
     */
    private Integer maxPatientsPerDay;

    /**
     * Current status of the doctor
     * Values: ACTIVE, INACTIVE, ON_LEAVE
     */
    private DoctorStatus status;

    /**
     * Timestamp when the doctor record was created (ISO 8601 format)
     */
    private LocalDateTime createdAt;

    /**
     * Timestamp when the doctor record was last updated (ISO 8601 format)
     */
    private LocalDateTime updatedAt;
}
