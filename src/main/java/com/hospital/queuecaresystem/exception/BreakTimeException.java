package com.hospital.queuecaresystem.exception;

/**
 * Exception thrown when an appointment is requested during doctor's break time.
 */
public class BreakTimeException extends RuntimeException {

    public BreakTimeException(String message) {
        super(message);
    }

    public BreakTimeException() {
        super("Doctor is on break");
    }

    public BreakTimeException(String message, Throwable cause) {
        super(message, cause);
    }
}
