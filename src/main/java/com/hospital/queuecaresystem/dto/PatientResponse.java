package com.hospital.queuecaresystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * Response DTO for Patient details
 * 
 * This DTO is used for all API responses related to patient information.
 * It provides a safe way to return patient data without exposing JPA entities.
 * 
 * Usage:
 * - GET /api/patients/{patientId}
 * - GET /api/patients/user/{userId}
 * - GET /api/patients/phone/{phoneNumber}
 * - POST /api/patients/{userId} (returns created patient)
 * - PUT /api/patients/{patientId} (returns updated patient)
 * 
 * Security:
 * - Does NOT include the associated User entity (only userId)
 * - Does NOT include passwords or security tokens
 * - Safe to expose via REST API
 * 
 * @see PatientRequest for input validation rules
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {

    /**
     * Unique identifier of the patient
     */
    private Long id;

    /**
     * ID of the User account associated with this patient
     */
    private Long userId;

    /**
     * Patient's first name
     */
    private String firstName;

    /**
     * Patient's last name
     */
    private String lastName;

    /**
     * Patient's phone number
     */
    private String phoneNumber;

    /**
     * Timestamp when the patient record was created (ISO 8601 format)
     */
    private LocalDateTime createdAt;

    /**
     * Timestamp when the patient record was last updated (ISO 8601 format)
     */
    private LocalDateTime updatedAt;
}
