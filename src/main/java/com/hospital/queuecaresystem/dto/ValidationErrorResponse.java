package com.hospital.queuecaresystem.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for validation error responses.
 * Returns structured validation errors with field-level details.
 * 
 * Example response:
 * {
 *   "status": 400,
 *   "error": "BAD_REQUEST",
 *   "message": "Validation failed",
 *   "errors": [
 *     {
 *       "field": "email",
 *       "rejectedValue": "invalid-email",
 *       "message": "must be a valid email address"
 *     },
 *     {
 *       "field": "firstName",
 *       "rejectedValue": "A",
 *       "message": "First name must be between 2 and 100 characters"
 *     }
 *   ],
 *   "timestamp": "2024-05-01T10:30:00"
 * }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ValidationErrorResponse {

    /**
     * HTTP status code
     */
    private int status;

    /**
     * HTTP error name (e.g., "BAD_REQUEST")
     */
    private String error;

    /**
     * General error message
     */
    private String message;

    /**
     * List of field-specific validation errors
     */
    private List<ValidationErrorDetail> errors = new ArrayList<>();

    /**
     * Timestamp when the error occurred
     */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    /**
     * Constructor for creating validation error response with automatic timestamp.
     * 
     * @param status HTTP status code
     * @param error Error name
     * @param message General message
     */
    public ValidationErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor for creating validation error response with errors list.
     * 
     * @param status HTTP status code
     * @param error Error name
     * @param message General message
     * @param errors List of field-level validation errors
     */
    public ValidationErrorResponse(int status, String error, String message, List<ValidationErrorDetail> errors) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.errors = errors != null ? errors : new ArrayList<>();
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Add a validation error to the errors list
     * 
     * @param field Field name
     * @param message Error message
     */
    public void addError(String field, String message) {
        this.errors.add(new ValidationErrorDetail(field, message));
    }

    /**
     * Add a validation error with rejected value
     * 
     * @param field Field name
     * @param rejectedValue The value that failed validation
     * @param message Error message
     */
    public void addError(String field, Object rejectedValue, String message) {
        this.errors.add(new ValidationErrorDetail(field, message));
        this.errors.get(this.errors.size() - 1).setRejectedValue(rejectedValue);
    }

    /**
     * Get error count
     * 
     * @return Number of validation errors
     */
    public int getErrorCount() {
        return this.errors.size();
    }
}
