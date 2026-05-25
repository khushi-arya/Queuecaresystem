package com.hospital.queuecaresystem.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalTime;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;

/**
 * Request DTO for Doctor creation/update operations.
 * 
 * Validation rules:
 * - name: Required, 2-100 characters
 * - specialization: Required, 2-100 characters
 * - shiftStartTime: Required, must be a valid time
 * - shiftEndTime: Required, must be a valid time (should be after start time - validated in service)
 * - breakStartTime: Optional
 * - breakEndTime: Optional
 * - maxPatientsPerDay: Required, 1-100 patients per day
 * - status: Optional, defaults to ACTIVE
 * 
 * Never exposes JPA entities in API requests. Use this DTO for all doctor-related
 * API input to ensure data validation and entity encapsulation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequest {

    /**
     * Doctor's full name.
     * Required field, must be 2-100 characters.
     */
    @NotBlank(message = "Doctor name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    /**
     * Doctor's medical specialization (e.g., "Cardiology", "Pediatrics").
     * Required field, must be 2-100 characters.
     */
    @NotBlank(message = "Specialization is required")
    @Size(min = 2, max = 100, message = "Specialization must be between 2 and 100 characters")
    private String specialization;

    /**
     * Time when the doctor's shift starts.
     * Required field, must be a valid LocalTime (e.g., "08:00", "09:30").
     */
    @NotNull(message = "Shift start time is required")
    private LocalTime shiftStartTime;

    /**
     * Time when the doctor's shift ends.
     * Required field, must be a valid LocalTime and should be after shiftStartTime.
     * This is validated in the service layer.
     */
    @NotNull(message = "Shift end time is required")
    private LocalTime shiftEndTime;

    /**
     * Time when the doctor's break starts (optional).
     * If provided, breakEndTime must also be provided.
     */
    private LocalTime breakStartTime;

    /**
     * Time when the doctor's break ends (optional).
     * If provided, breakStartTime must also be provided.
     */
    private LocalTime breakEndTime;

    /**
     * Maximum number of patients the doctor can see per day.
     * Required field, must be between 1 and 100.
     */
    @NotNull(message = "Max patients per day is required")
    @Min(value = 1, message = "Max patients per day must be at least 1")
    @Max(value = 100, message = "Max patients per day cannot exceed 100")
    private Integer maxPatientsPerDay;

    /**
     * Doctor's current status (ACTIVE, INACTIVE, ON_LEAVE).
     * Optional field, defaults to ACTIVE if not provided.
     */
    private DoctorStatus status;

    /**
     * Doctor's biography or professional summary.
     * Optional field.
     */
    private String bio;

    /**
     * Years of experience.
     * Optional field.
     */
    private Integer experience;

    /**
     * Hospital or clinic affiliation.
     * Optional field.
     */
    private String hospitalAffiliation;
}
