package com.hospital.queuecaresystem.websocket.controller;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.service.DoctorQueueService;
import com.hospital.queuecaresystem.websocket.dto.PatientNotificationMessage;
import com.hospital.queuecaresystem.websocket.service.QueueWebSocketService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * WebSocket Test Controller
 * 
 * Provides endpoints to test and simulate WebSocket queue updates
 * Useful for frontend development and testing without full appointment flow
 * 
 * @author QueueCare System
 */
@RestController
@RequestMapping("/api/websocket/test")
@AllArgsConstructor
@Slf4j
public class WebSocketTestController {

    private final DoctorQueueService doctorQueueService;
    private final QueueWebSocketService queueWebSocketService;

    /**
     * Test endpoint: Broadcast a queue update
     * 
     * POST /api/websocket/test/broadcast-queue-update/{doctorId}
     * 
     * Simulates a queue update without making actual database changes
     * Useful for testing WebSocket client implementations
     * 
     * @param doctorId Doctor whose queue to broadcast
     * @return Confirmation message
     */
    @PostMapping("/broadcast-queue-update/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<String> testBroadcastQueueUpdate(
            @PathVariable Long doctorId) {
        
        log.info("TEST: Broadcasting queue update for doctor: {}", doctorId);
        
        try {
            // Get current queue
            List<DoctorQueueResponse> queue = doctorQueueService.getTodayQueue(doctorId);
            
            if (queue.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("No queue found for doctor " + doctorId);
            }
            
            // Broadcast update
            queueWebSocketService.broadcastQueueUpdate(
                doctorId,
                queue,
                com.hospital.queuecaresystem.websocket.dto.QueueUpdateMessage.QueueUpdateType.UPDATE,
                null
            );
            
            return ResponseEntity.ok("Queue update broadcasted to " + queue.size() + " patients");
            
        } catch (Exception e) {
            log.error("Error broadcasting queue update", e);
            return ResponseEntity.internalServerError()
                .body("Error: " + e.getMessage());
        }
    }

    /**
     * Test endpoint: Send notification to patient
     * 
     * POST /api/websocket/test/notify-patient
     * 
     * @param patientId Patient ID to notify
     * @param queueId Queue ID
     * @param doctorId Doctor ID
     * @param doctorName Doctor name
     * @return Confirmation message
     */
    @PostMapping("/notify-patient")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<String> testNotifyPatient(
            @RequestParam Long patientId,
            @RequestParam Long queueId,
            @RequestParam Long doctorId,
            @RequestParam String doctorName) {
        
        log.info("TEST: Sending notification to patient: {}", patientId);
        
        try {
            queueWebSocketService.notifyPatient(
                patientId,
                queueId,
                doctorId,
                doctorName,
                PatientNotificationMessage.NotificationType.TURN_NEAR,
                2,
                1,
                5L,
                "Test notification: Your turn is coming soon!"
            );
            
            return ResponseEntity.ok("Notification sent to patient " + patientId);
            
        } catch (Exception e) {
            log.error("Error sending notification", e);
            return ResponseEntity.internalServerError()
                .body("Error: " + e.getMessage());
        }
    }

    /**
     * Test endpoint: Notify patient called
     * 
     * POST /api/websocket/test/notify-called/{patientId}/{queueId}/{doctorId}
     * 
     * @param patientId Patient ID
     * @param queueId Queue ID
     * @param doctorId Doctor ID
     * @return Confirmation message
     */
    @PostMapping("/notify-called/{patientId}/{queueId}/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<String> testNotifyPatientCalled(
            @PathVariable Long patientId,
            @PathVariable Long queueId,
            @PathVariable Long doctorId,
            @RequestParam String doctorName) {
        
        log.info("TEST: Notifying patient {} that they've been called", patientId);
        
        try {
            queueWebSocketService.notifyPatientCalled(
                patientId,
                queueId,
                doctorId,
                doctorName
            );
            
            return ResponseEntity.ok("Patient " + patientId + " notified");
            
        } catch (Exception e) {
            log.error("Error notifying patient", e);
            return ResponseEntity.internalServerError()
                .body("Error: " + e.getMessage());
        }
    }

    /**
     * Test endpoint: Notify turn near
     * 
     * POST /api/websocket/test/notify-turn-near/{patientId}
     * 
     * @param patientId Patient ID
     * @param queueId Queue ID
     * @param doctorId Doctor ID
     * @param doctorName Doctor name
     * @return Confirmation message
     */
    @PostMapping("/notify-turn-near/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<String> testNotifyTurnNear(
            @PathVariable Long patientId,
            @RequestParam Long queueId,
            @RequestParam Long doctorId,
            @RequestParam String doctorName) {
        
        log.info("TEST: Notifying patient {} - turn is near", patientId);
        
        try {
            queueWebSocketService.notifyPatientTurnNear(
                patientId,
                queueId,
                doctorId,
                doctorName,
                2,
                1,
                5L
            );
            
            return ResponseEntity.ok("Turn near notification sent to patient " + patientId);
            
        } catch (Exception e) {
            log.error("Error sending turn near notification", e);
            return ResponseEntity.internalServerError()
                .body("Error: " + e.getMessage());
        }
    }

    /**
     * Health check for WebSocket service
     * 
     * GET /api/websocket/test/health
     * 
     * @return Health status
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("WebSocket service is running");
    }
}
