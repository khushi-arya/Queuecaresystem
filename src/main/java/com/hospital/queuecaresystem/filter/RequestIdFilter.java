package com.hospital.queuecaresystem.filter;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;

/**
 * RequestIdFilter - Adds correlation ID to all HTTP requests for tracing
 * 
 * Purpose:
 * - Tracks requests across distributed systems
 * - Links related log entries together using correlation ID
 * - Useful for debugging and troubleshooting
 * 
 * Features:
 * - Generates UUID for each request if not provided
 * - Stores correlation ID in MDC (Mapped Diagnostic Context)
 * - Includes correlation ID in all log statements
 * - Cleans up MDC after request processing
 * 
 * Usage:
 * - Every HTTP request automatically gets a unique correlation ID
 * - Log pattern includes [%X{correlationId}] to display it
 * - Can be passed to downstream services for end-to-end tracing
 * 
 * Example Log Output:
 * 2026-05-05 14:30:45.123 [INFO] [12345] [f47ac10b-58cc-4372-a567-0e02b2c3d479] [AuthController] - Login attempt initiated
 * 
 * Production Best Practice:
 * - Use this for all HTTP requests in production
 * - Pass correlation ID to external service calls (REST, messaging, etc.)
 * - Aggregate logs by correlation ID for full request tracing
 */
@Component
@Slf4j
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID = "correlationId";
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    /**
     * Executes once per HTTP request to add correlation ID to MDC
     * 
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @param filterChain FilterChain to continue request processing
     * @throws ServletException if servlet error occurs
     * @throws IOException if I/O error occurs
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                   @NonNull HttpServletResponse response, 
                                   @NonNull FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            // Try to get correlation ID from request header (if passed from upstream service)
            String correlationId = request.getHeader(CORRELATION_ID_HEADER);
            
            // If not provided, generate a new UUID
            if (correlationId == null || correlationId.trim().isEmpty()) {
                correlationId = UUID.randomUUID().toString();
            }
            
            // Store correlation ID in MDC (accessible to all log statements in this thread)
            MDC.put(CORRELATION_ID, correlationId);
            
            // Add correlation ID to response header (for client reference and downstream services)
            response.setHeader(CORRELATION_ID_HEADER, correlationId);
            
            // Log request start with correlation ID and basic info
            log.debug("Incoming request - Method: {}, URI: {}, Correlation ID: {}", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    correlationId);
            
            // Continue request processing
            filterChain.doFilter(request, response);
            
        } finally {
            // IMPORTANT: Clean up MDC to prevent correlation ID leakage between requests
            // (especially important in thread pool environments like Tomcat)
            MDC.remove(CORRELATION_ID);
        }
    }
}
