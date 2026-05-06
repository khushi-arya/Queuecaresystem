package com.hospital.queuecaresystem.exception;

/**
 * Exception thrown when a user is not found
 */
public class UserNotFoundException extends RuntimeException {
    
    public UserNotFoundException(String message) {
        super(message);
    }

    public UserNotFoundException() {
        super("User not found");
    }

    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
