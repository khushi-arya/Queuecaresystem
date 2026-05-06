package com.hospital.queuecaresystem.exception;

/**
 * Custom exception for appointment-related errors
 */
public class AppointmentException extends RuntimeException {

    public AppointmentException(String message) {
        super(message);
    }

    public AppointmentException(String message, Throwable cause) {
        super(message, cause);
    }
}
