package com.hospital.queuecaresystem.exception;

/**
 * Exception thrown when the maximum appointment limit is reached for a doctor or time slot.
 */
public class MaxLimitReachedException extends RuntimeException {

    public MaxLimitReachedException(String message) {
        super(message);
    }

    public MaxLimitReachedException() {
        super("Maximum appointment limit reached");
    }

    public MaxLimitReachedException(String message, Throwable cause) {
        super(message, cause);
    }
}
