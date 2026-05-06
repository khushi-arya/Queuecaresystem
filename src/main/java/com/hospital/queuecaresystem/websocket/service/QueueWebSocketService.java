package com.hospital.queuecaresystem.websocket.service;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import com.hospital.queuecaresystem.websocket.dto.PatientNotificationMessage;
import com.hospital.queuecaresystem.websocket.dto.QueueUpdateMessage;

import java.util.List;

/**
 * Service for managing WebSocket communications for queue updates
 * 
 * Responsibilities:
 * - Broadcasting queue updates to all subscribed clients
 * - Sending personal notifications to patients
 * - Managing real-time queue state synchronization
 * 
 * Thread-safe implementation for concurrent WebSocket operations.
 * 
 * @author QueueCare System
 */
public interface QueueWebSocketService {

    /**
     * Broadcast queue update to all clients listening to a doctor's queue
     * 
     * Sent to: /topic/queue/{doctorId}
     * 
     * @param doctorId Doctor whose queue was updated
     * @param queue Complete current queue list
     * @param updateType Type of update (ADD, UPDATE, REMOVE, etc.)
     * @param patientId Patient affected by this update
     */
    void broadcastQueueUpdate(
        Long doctorId,
        List<DoctorQueueResponse> queue,
        QueueUpdateMessage.QueueUpdateType updateType,
        Long patientId
    );

    /**
     * Send personal notification to a patient about their queue status
     * 
     * Sent to: /user/{patientId}/queue-updates
     * 
     * @param patientId Patient receiving the notification
     * @param queueId Queue ID in doctor's queue
     * @param doctorId Doctor's ID
     * @param doctorName Doctor's name
     * @param notificationType Type of notification
     * @param currentPosition Current position in queue (1-based)
     * @param patientsAhead Number of patients ahead
     * @param estimatedWaitTimeMinutes Estimated wait time
     * @param message Custom message for display
     */
    void notifyPatient(
        Long patientId,
        Long queueId,
        Long doctorId,
        String doctorName,
        PatientNotificationMessage.NotificationType notificationType,
        Integer currentPosition,
        Integer patientsAhead,
        Long estimatedWaitTimeMinutes,
        String message
    );

    /**
     * Notify patient when their turn is near (position <= 2)
     * 
     * @param patientId Patient ID
     * @param queueId Queue ID
     * @param doctorId Doctor ID
     * @param doctorName Doctor name
     * @param currentPosition Current queue position
     * @param patientsAhead Number of patients ahead
     * @param estimatedWaitTimeMinutes Estimated wait time
     */
    void notifyPatientTurnNear(
        Long patientId,
        Long queueId,
        Long doctorId,
        String doctorName,
        Integer currentPosition,
        Integer patientsAhead,
        Long estimatedWaitTimeMinutes
    );

    /**
     * Notify patient that they've been called
     * 
     * @param patientId Patient ID
     * @param queueId Queue ID
     * @param doctorId Doctor ID
     * @param doctorName Doctor name
     */
    void notifyPatientCalled(
        Long patientId,
        Long queueId,
        Long doctorId,
        String doctorName
    );

    /**
     * Notify patient about queue position change
     * 
     * @param patientId Patient ID
     * @param queueId Queue ID
     * @param currentPosition New queue position
     * @param patientsAhead Patients ahead
     * @param estimatedWaitTimeMinutes Estimated wait time
     */
    void notifyPositionUpdate(
        Long patientId,
        Long queueId,
        Long doctorId,
        String doctorName,
        Integer currentPosition,
        Integer patientsAhead,
        Long estimatedWaitTimeMinutes
    );

    /**
     * Notify patient that they've been removed from queue (missed or cancelled)
     * 
     * @param patientId Patient ID
     * @param doctorId Doctor ID
     * @param doctorName Doctor name
     * @param reason Reason for removal: CANCELLED or MISSED
     */
    void notifyPatientRemoved(
        Long patientId,
        Long doctorId,
        String doctorName,
        PatientNotificationMessage.NotificationType reason
    );
}
