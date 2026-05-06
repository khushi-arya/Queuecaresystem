package com.hospital.queuecaresystem.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * WebSocket message for personal notifications to patients
 * 
 * Sent to: /user/{patientId}/queue-updates
 * 
 * Used for:
 * - Notifying when turn is near (position <= 2)
 * - Notifying when called for consultation
 * - Queue position updates
 * 
 * @author QueueCare System
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientNotificationMessage {

    /**
     * Patient ID receiving the notification
     */
    private Long patientId;

    /**
     * Queue ID in the doctor's queue
     */
    private Long queueId;

    /**
     * Doctor ID for this patient's appointment
     */
    private Long doctorId;

    /**
     * Doctor name for patient reference
     */
    private String doctorName;

    /**
     * Notification type: TURN_NEAR, CALLED, POSITION_UPDATE, CANCELLED
     */
    private NotificationType notificationType;

    /**
     * Current queue position (1-based)
     */
    private Integer currentPosition;

    /**
     * Number of patients ahead
     */
    private Integer patientsAhead;

    /**
     * Estimated wait time in minutes
     */
    private Long estimatedWaitTimeMinutes;

    /**
     * Human-readable message for display
     */
    private String message;

    /**
     * Server timestamp of the notification
     */
    private LocalDateTime timestamp;

    /**
     * Notification type enumeration
     */
    public enum NotificationType {
        TURN_NEAR,          // Patient is 2 positions away from being called
        CALLED,             // Doctor called this patient (status: IN_PROGRESS)
        POSITION_UPDATE,    // Queue position changed (another patient removed/added)
        APPOINTMENT_START,  // Appointment booking confirmed
        CANCELLED,          // Patient removed from queue
        MISSED,             // Patient marked as missed (no-show)
        DOCTOR_DELAYED      // Doctor is running behind schedule
    }
}
