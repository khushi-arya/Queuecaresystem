package com.hospital.queuecaresystem.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * Request DTO for Appointment booking operations.
 * 
 * Validation rules:
 * - patientId: Required, must exist in database (validated in service)
 * - doctorId: Required, must exist in database (validated in service)
 * - appointmentDate: Required, must be in the future
 * - notes: Optional, max 500 characters
 * 
 * Never exposes JPA entities in API requests. Use this DTO for all appointment-related
 * API input to ensure data validation and entity encapsulation.
 * 
 * Business validations (performed in service layer):
 * - Patient and Doctor must exist
 * - Appointment time must be within doctor's shift hours
 * - Appointment time must not fall during doctor's break
 * - Patient cannot have duplicate appointments on same date with same doctor
 * - Doctor must not exceed maxPatientsPerDay quota
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {

    /**
     * ID of the patient booking the appointment.
     * Required field, must reference an existing Patient in the database.
     * Existence is validated in the service layer.
     */
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    /**
     * ID of the doctor for the appointment.
     * Required field, must reference an existing Doctor in the database.
     * Existence is validated in the service layer.
     */
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    /**
     * Date and time of the appointment.
     * Required field, must be in the future.
     * Must also be within doctor's shift hours (validated in service layer).
     * 
     * Format: ISO 8601 (yyyy-MM-dd'T'HH:mm:ss)
     * Example: 2024-05-15T14:30:00
     */
    @NotNull(message = "Appointment date/time is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDateTime appointmentDate;

    /**
     * Optional notes or remarks about the appointment.
     * Max 500 characters.
     */
    @Size(max = 500, message = "Appointment notes must not exceed 500 characters")
    private String notes;
}
