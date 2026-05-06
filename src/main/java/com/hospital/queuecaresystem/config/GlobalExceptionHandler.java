package com.hospital.queuecaresystem.config;

import com.hospital.queuecaresystem.dto.ApiErrorResponse;
import com.hospital.queuecaresystem.dto.ValidationErrorResponse;
import com.hospital.queuecaresystem.dto.ValidationErrorDetail;
import com.hospital.queuecaresystem.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler for the QueueCare System.
 * Centralized handling of all exceptions with consistent API error responses.
 * 
 * Uses @RestControllerAdvice for automatic ResponseEntity wrapping in REST APIs.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Helper method to build error responses consistently (DRY principle).
     * Eliminates code duplication across all exception handlers.
     * 
     * @param status HTTP status
     * @param message Error message
     * @return ResponseEntity with ApiErrorResponse
     */
    private ResponseEntity<ApiErrorResponse> buildErrorResponse(
            HttpStatus status, 
            String message) {
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                message
        );
        return new ResponseEntity<>(errorResponse, status);
    }

    /**
     * Handle DoctorNotAvailableException - HTTP 404 (NOT_FOUND)
     * Logs WARN: Doctor resource not available or not found.
     */
    @ExceptionHandler(DoctorNotAvailableException.class)
    public ResponseEntity<ApiErrorResponse> handleDoctorNotAvailable(
            DoctorNotAvailableException ex) {
        log.warn("Doctor not available exception occurred - Message: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /**
     * Handle BreakTimeException - HTTP 403 (FORBIDDEN)
     * Logs WARN: Doctor is on break or during scheduled break time.
     */
    @ExceptionHandler(BreakTimeException.class)
    public ResponseEntity<ApiErrorResponse> handleBreakTime(
            BreakTimeException ex) {
        log.warn("Break time exception occurred - Doctor is on break - Message: {}", 
                ex.getMessage());
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    /**
     * Handle DuplicateBookingException - HTTP 409 (CONFLICT)
     * Logs WARN: Attempt to book an already-booked time slot.
     */
    @ExceptionHandler(DuplicateBookingException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateBooking(
            DuplicateBookingException ex) {
        log.warn("Duplicate booking attempt - Time slot already booked - Message: {}", 
                ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    /**
     * Handle MaxLimitReachedException - HTTP 429 (TOO_MANY_REQUESTS)
     * Logs WARN: Resource quota or rate limit exceeded.
     */
    @ExceptionHandler(MaxLimitReachedException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxLimitReached(
            MaxLimitReachedException ex) {
        log.warn("Max limit reached exception - Quota exceeded - Message: {}", 
                ex.getMessage());
        return buildErrorResponse(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage());
    }

    /**
     * Handle UserNotFoundException - HTTP 404 (NOT_FOUND)
     * Logs WARN: User resource not found by ID.
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(
            UserNotFoundException ex) {
        log.warn("User not found exception - Message: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /**
     * Handle ResourceNotFoundException - HTTP 404 (NOT_FOUND)
     * Logs WARN: Generic resource not found exception.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex) {
        log.warn("Resource not found exception - Message: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /**
     * Handle UnauthorizedException - HTTP 401 (UNAUTHORIZED)
     * Logs WARN: User not authorized to access resource.
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthorized(
            UnauthorizedException ex) {
        log.warn("Unauthorized access attempt - Message: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    /**
     * Handle validation errors from @Valid/@Validated annotations - HTTP 400 (BAD_REQUEST)
     * Overrides parent class method to provide detailed field-level error response.
     * 
     * Logs WARN: Each field validation failure with field name and reason.
     * 
     * Returns ValidationErrorResponse with individual field errors including:
     * - Field name
     * - Rejected value (sanitized)
     * - Error message
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        
        // Extract field-level validation errors
        List<ValidationErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ValidationErrorDetail(
                        error.getField(),
                        error.getRejectedValue(),
                        error.getDefaultMessage()
                ))
                .collect(Collectors.toList());
        
        // Create structured validation error response
        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed: " + errors.size() + " field(s) contain errors",
                errors
        );
        
        // Log validation errors with field details
        log.warn("Validation error occurred - Total errors: {} - Details: {}", 
                errors.size(),
                errors.stream()
                      .map(e -> e.getField() + " -> " + e.getMessage())
                      .collect(Collectors.joining("; ")));
        
        // Debug level: include rejected values
        log.debug("Validation rejected values - {}", 
                errors.stream()
                      .map(e -> e.getField() + "=" + e.getRejectedValue())
                      .collect(Collectors.joining(", ")));
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle invalid JSON in request body - HTTP 400 (BAD_REQUEST)
     * Overrides parent class method to provide custom logging.
     * Logs WARN: JSON parsing or format error in request body.
     */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        log.warn("Invalid JSON in request body - Error: {}", ex.getMessage());
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Invalid JSON format in request body"
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle database constraint violations - HTTP 409 (CONFLICT)
     * Logs WARN: JPA/SQL integrity constraint violation (unique, foreign key, check, etc).
     * Occurs when attempting to violate database constraints.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {
        log.warn("Data integrity violation occurred - Constraint violated - Error: {}", 
                ex.getMessage());
        // Root cause might contain sensitive info, so we don't expose it to client
        log.debug("Data integrity violation root cause: ", ex);
        return buildErrorResponse(HttpStatus.CONFLICT, 
                "Operation violates data constraints. Please check your input.");
    }

    /**
     * Handle HTTP method not allowed - HTTP 405 (METHOD_NOT_ALLOWED)
     * Overrides parent class method to provide custom logging.
     * Logs WARN: Client uses unsupported HTTP method (e.g., POST on GET-only endpoint).
     */
    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        log.warn("HTTP method not supported - Method: {} - Supported methods: {}", 
                ex.getMethod(), 
                ex.getSupportedHttpMethods());
        ApiErrorResponse errorResponse = new ApiErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                HttpStatus.METHOD_NOT_ALLOWED.getReasonPhrase(),
                "HTTP method not supported for this endpoint"
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    /**
     * Generic exception handler for all unhandled exceptions - HTTP 500 (INTERNAL_SERVER_ERROR)
     * Logs ERROR with full stack trace: Any unexpected exception that wasn't explicitly handled.
     * This is the catch-all handler and should be the last resort.
     * 
     * SECURITY: Does NOT send actual exception details to client (log only to server).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGlobalException(
            Exception ex,
            WebRequest request) {
        
        // Log full error with stack trace for debugging
        log.error("Unexpected error occurred - Type: {}, Message: {}, URI: {}", 
                ex.getClass().getSimpleName(),
                ex.getMessage(),
                request.getDescription(false), ex);
        
        // Return generic error message to client (don't expose internals)
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An unexpected error occurred. Please contact support if the problem persists.");
    }
}
