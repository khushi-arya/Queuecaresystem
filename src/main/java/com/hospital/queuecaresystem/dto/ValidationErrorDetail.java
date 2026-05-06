package com.hospital.queuecaresystem.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for individual field validation error details.
 * Provides structured information about what validation failed and why.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ValidationErrorDetail {

    /**
     * The field name that failed validation
     */
    private String field;

    /**
     * The rejected value that failed validation
     */
    private Object rejectedValue;

    /**
     * Human-readable error message explaining the validation failure
     */
    private String message;

    /**
     * Constructor for basic field validation error
     * 
     * @param field Field name
     * @param message Error message
     */
    public ValidationErrorDetail(String field, String message) {
        this.field = field;
        this.message = message;
    }
}
