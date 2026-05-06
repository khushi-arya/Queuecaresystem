package com.hospital.queuecaresystem.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request DTO for Patient creation/update operations.
 * 
 * Validation rules:
 * - firstName: Required, 2-100 characters
 * - lastName: Required, 2-100 characters
 * - phoneNumber: Required, valid format (10-15 digits with optional country code)
 * 
 * Never exposes JPA entities in API requests. Use this DTO for all patient-related
 * API input to ensure data validation and entity encapsulation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequest {

    /**
     * First name of the patient.
     * Required field, must be 2-100 characters.
     */
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    /**
     * Last name of the patient.
     * Required field, must be 2-100 characters.
     */
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    /**
     * Phone number of the patient.
     * Required field, supports 10-15 digits or +country code format.
     * 
     * Valid formats:
     * - 1234567890 (10 digits)
     * - 12345678901 (11 digits)
     * - +11234567890 (country code + digits)
     */
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$|^\\d{11}$|^\\+\\d{1,3}\\d{9,12}$", 
             message = "Phone number must be 10-15 digits, optionally starting with +country code")
    private String phoneNumber;
}
