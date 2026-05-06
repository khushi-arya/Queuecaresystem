package com.hospital.queuecaresystem.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * Response DTO for appointment details
 * 
 * This DTO is used for all API responses related to appointment information.
 * It provides a safe way to return appointment data without exposing JPA entities.
 * 
 * Usage:
 * - GET /api/appointments/{appointmentId}
 * - GET /api/appointments/patient/{patientId}
 * - GET /api/appointments/doctor/{doctorId}
 * - POST /api/appointments (returns created appointment)
 * - PUT /api/appointments/{appointmentId} (returns updated appointment)
 * 
 * Nested Objects:
 * - patient: Contains limited patient info (id, name, phone)
 * - doctor: Contains limited doctor info (id, name, specialization)
 * 
 * These nested objects prevent exposing full entity relationships.
 * 
 * Status Values: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
 * 
 * Security:
 * - Does NOT include the associated full entities
 * - Does NOT include sensitive security information
 * - Safe to expose via REST API
 * 
 * @see AppointmentRequest for input validation rules
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {

    /**
     * Unique identifier of the appointment
     */
    private Long id;

    /**
     * Nested patient information in the appointment
     */
    @JsonProperty("patient")
    private PatientInfo patient;

    /**
     * Nested doctor information in the appointment
     */
    @JsonProperty("doctor")
    private DoctorInfo doctor;

    /**
     * Date and time of the appointment (ISO 8601 format)
     * Example: 2024-05-15T14:30:00
     */
    private LocalDateTime appointmentDate;

    /**
     * Token number assigned to the patient in the queue
     * Unique per doctor per day
     */
    private Integer tokenNumber;

    /**
     * Current status of the appointment
     * Possible values: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
     */
    private String status;

    /**
     * Optional notes or remarks about the appointment
     */
    private String notes;

    /**
     * Timestamp when the appointment record was created (ISO 8601 format)
     */
    private LocalDateTime createdAt;

    /**
     * Timestamp when the appointment record was last updated (ISO 8601 format)
     */
    private LocalDateTime updatedAt;

    /**
     * Nested DTO for patient info in appointment response
     * 
     * This class provides limited patient information to prevent exposing
     * the full Patient entity in API responses.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientInfo {
        /**
         * Patient unique identifier
         */
        private Long id;
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
    }

    /**
     * Nested DTO for doctor info in appointment response
     * 
     * This class provides limited doctor information to prevent exposing
     * the full Doctor entity in API responses.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorInfo {
        /**
         * Doctor unique identifier
         */
        private Long id;
        /**
         * Doctor's full name
         */
        private String name;
        /**
         * Doctor's medical specialization
         */
        private String specialization;
    }
}
