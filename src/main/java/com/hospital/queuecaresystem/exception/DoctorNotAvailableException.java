package com.hospital.queuecaresystem.exception;

/**
 * Exception thrown when a doctor is not available for appointment booking.
 */
public class DoctorNotAvailableException extends RuntimeException {

    public DoctorNotAvailableException(String message) {
        super(message);
    }

    public DoctorNotAvailableException() {
        super("Doctor is not available");
    }

    public DoctorNotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
