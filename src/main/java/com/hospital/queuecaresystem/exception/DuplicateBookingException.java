package com.hospital.queuecaresystem.exception;

/**
 * Exception thrown when a duplicate booking is attempted for the same patient and doctor.
 */
public class DuplicateBookingException extends RuntimeException {

    public DuplicateBookingException(String message) {
        super(message);
    }

    public DuplicateBookingException() {
        super("Duplicate booking detected");
    }

    public DuplicateBookingException(String message, Throwable cause) {
        super(message, cause);
    }
}
