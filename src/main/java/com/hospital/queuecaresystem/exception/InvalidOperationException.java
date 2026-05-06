package com.hospital.queuecaresystem.exception;

/**
 * Exception thrown when an invalid operation is attempted
 */
public class InvalidOperationException extends RuntimeException {
    
    public InvalidOperationException(String message) {
        super(message);
    }

    public InvalidOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
