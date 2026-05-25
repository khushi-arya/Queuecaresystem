package com.hospital.queuecaresystem.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Standard API Error Response DTO for consistent error handling across the application.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {

    private int status;
    private String error;
    private String message;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    /**
     * Constructor for creating error response with automatic timestamp.
     * 
     * @param status HTTP status code
     * @param error Error name (e.g., "NOT_FOUND")
     * @param message Descriptive error message
     */
    public ApiErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor for creating simple error response with default status.
     * 
     * @param error Error name
     * @param message Descriptive error message
     */
    public ApiErrorResponse(String error, String message) {
        this.status = 500;
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
