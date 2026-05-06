package com.hospital.queuecaresystem.exception;

/**
 * Exception thrown when attempting to promote a user who is already a DOCTOR
 */
public class UserAlreadyDoctorException extends RuntimeException {
    
    public UserAlreadyDoctorException(String message) {
        super(message);
    }

    public UserAlreadyDoctorException(String message, Throwable cause) {
        super(message, cause);
    }
}
