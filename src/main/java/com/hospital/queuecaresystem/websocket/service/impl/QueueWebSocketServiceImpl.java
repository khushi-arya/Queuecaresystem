package com.hospital.queuecaresystem.websocket.service.impl;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.websocket.dto.PatientNotificationMessage;
import com.hospital.queuecaresystem.websocket.dto.QueueUpdateMessage;
import com.hospital.queuecaresystem.websocket.service.QueueWebSocketService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation of QueueWebSocketService
 * 
 * Handles real-time broadcasting of queue updates and personal notifications
 * using Spring's STOMP message broker.
 * 
 * Thread-safe: SimpMessagingTemplate is designed for concurrent use.
 * 
 * @author QueueCare System
 */
@Service
@AllArgsConstructor
@Slf4j
public class QueueWebSocketServiceImpl implements QueueWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast queue update to all subscribed clients
     * 
     * Destination: /topic/queue/{doctorId}
     * 
     * Thread-safe: Uses SimpMessagingTemplate (thread-safe)
     * Error handling: Wrapped in try-catch to prevent exception propagation
     */
    @Override
    public void broadcastQueueUpdate(
            Long doctorId,
            List<DoctorQueueResponse> queue,
            QueueUpdateMessage.QueueUpdateType updateType,
            Long patientId) {

        log.info("Broadcasting queue update - Doctor: {}, Type: {}, Patient: {}", 
                 doctorId, updateType, patientId);

        try {
            // Calculate statistics
            long waitingCount = queue.stream()
                .filter(q -> q.getStatus().name().equals("WAITING"))
                .count();
            
            long inProgressCount = queue.stream()
                .filter(q -> q.getStatus().name().equals("IN_PROGRESS"))
                .count();

            // Build message
            QueueUpdateMessage message = QueueUpdateMessage.builder()
                .doctorId(doctorId)
                .queue(queue)
                .updateType(updateType)
                .patientId(patientId)
                .timestamp(LocalDateTime.now())
                .totalWaiting((int) waitingCount)
                .totalInProgress((int) inProgressCount)
                .build();

            // Broadcast to topic
            String destination = "/topic/queue/" + doctorId;
            @SuppressWarnings("unchecked")
            Object msg = (Object) message;
            messagingTemplate.convertAndSend(destination, msg);

            log.debug("Queue update message sent to: {} at {}", destination, message.getTimestamp());
            
        } catch (Exception e) {
            log.error("Failed to broadcast queue update for doctor: {} - {}", doctorId, e.getMessage(), e);
            // Don't re-throw: queue operation should complete even if broadcast fails
            // Client will retry connection and fetch updated queue
        }
    }

    /**
     * Send personal notification to patient
     * 
     * Destination: /user/{patientId}/queue-updates
     * 
     * Thread-safe: Uses SimpMessagingTemplate (thread-safe)
     * Error handling: Wrapped in try-catch to prevent exception propagation
     */
    @Override
    public void notifyPatient(
            Long patientId,
            Long queueId,
            Long doctorId,
            String doctorName,
            PatientNotificationMessage.NotificationType notificationType,
            Integer currentPosition,
            Integer patientsAhead,
            Long estimatedWaitTimeMinutes,
            String message) {

        log.info("Sending notification to patient: {} - Type: {}, Position: {}", 
                 patientId, notificationType, currentPosition);

        try {
            PatientNotificationMessage notification = PatientNotificationMessage.builder()
                .patientId(patientId)
                .queueId(queueId)
                .doctorId(doctorId)
                .doctorName(doctorName)
                .notificationType(notificationType)
                .currentPosition(currentPosition)
                .patientsAhead(patientsAhead)
                .estimatedWaitTimeMinutes(estimatedWaitTimeMinutes)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();

            // Send to user's personal queue
            @SuppressWarnings("unchecked")
            Object notif = (Object) notification;
            messagingTemplate.convertAndSendToUser(
                patientId.toString(),
                "/queue-updates",
                notif
            );

            log.debug("Notification sent to patient: {} via: /user/{}/queue-updates", 
                      patientId, patientId);
            
        } catch (Exception e) {
            log.error("Failed to send notification to patient: {} - {}", patientId, e.getMessage(), e);
            // Don't re-throw: queue operation should complete even if notification fails
            // Client will retrieve updates when reconnecting
        }
    }

    /**
     * Notify patient when turn is near (position <= 2)
     */
    @Override
    public void notifyPatientTurnNear(
            Long patientId,
            Long queueId,
            Long doctorId,
            String doctorName,
            Integer currentPosition,
            Integer patientsAhead,
            Long estimatedWaitTimeMinutes) {

        log.info("Notifying patient {} - Turn is near! Position: {}", patientId, currentPosition);

        String message = String.format(
            "Your turn is coming soon! You are at position %d. Estimated wait time: %d minutes.",
            currentPosition,
            estimatedWaitTimeMinutes != null ? estimatedWaitTimeMinutes : 0
        );

        notifyPatient(
            patientId,
            queueId,
            doctorId,
            doctorName,
            PatientNotificationMessage.NotificationType.TURN_NEAR,
            currentPosition,
            patientsAhead,
            estimatedWaitTimeMinutes,
            message
        );
    }

    /**
     * Notify patient that they've been called
     */
    @Override
    public void notifyPatientCalled(
            Long patientId,
            Long queueId,
            Long doctorId,
            String doctorName) {

        log.info("Notifying patient {} - Called to consultation with Dr. {}", patientId, doctorName);

        String message = String.format(
            "Dr. %s is ready to see you. Please proceed to the consultation room.",
            doctorName
        );

        notifyPatient(
            patientId,
            queueId,
            doctorId,
            doctorName,
            PatientNotificationMessage.NotificationType.CALLED,
            0,
            0,
            0L,
            message
        );
    }

    /**
     * Notify patient about queue position change
     */
    @Override
    public void notifyPositionUpdate(
            Long patientId,
            Long queueId,
            Long doctorId,
            String doctorName,
            Integer currentPosition,
            Integer patientsAhead,
            Long estimatedWaitTimeMinutes) {

        log.info("Notifying patient {} - Position updated to: {}", patientId, currentPosition);

        String message = String.format(
            "Your queue position has been updated. You are now at position %d with %d patient(s) ahead.",
            currentPosition,
            patientsAhead
        );

        notifyPatient(
            patientId,
            queueId,
            doctorId,
            doctorName,
            PatientNotificationMessage.NotificationType.POSITION_UPDATE,
            currentPosition,
            patientsAhead,
            estimatedWaitTimeMinutes,
            message
        );
    }

    /**
     * Notify patient about removal from queue
     */
    @Override
    public void notifyPatientRemoved(
            Long patientId,
            Long doctorId,
            String doctorName,
            PatientNotificationMessage.NotificationType reason) {

        log.info("Notifying patient {} - Removed from queue. Reason: {}", patientId, reason);

        String message = reason == PatientNotificationMessage.NotificationType.MISSED ?
            "You have been marked as no-show for your appointment." :
            "Your appointment has been cancelled.";

        notifyPatient(
            patientId,
            null,
            doctorId,
            doctorName,
            reason,
            null,
            null,
            null,
            message
        );
    }
}
