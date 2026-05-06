package com.hospital.queuecaresystem.websocket.dto;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * WebSocket message for broadcasting queue updates to all clients
 * 
 * Sent to: /topic/queue/{doctorId}
 * 
 * @author QueueCare System
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueUpdateMessage {

    /**
     * Doctor ID whose queue was updated
     */
    private Long doctorId;

    /**
     * Doctor name for client reference
     */
    private String doctorName;

    /**
     * Current complete queue list
     */
    private List<DoctorQueueResponse> queue;

    /**
     * Type of update: ADD, UPDATE, REMOVE, REPOSITION
     */
    private QueueUpdateType updateType;

    /**
     * ID of the patient affected by this update
     */
    private Long patientId;

    /**
     * Server timestamp of the update
     */
    private LocalDateTime timestamp;

    /**
     * Total patients waiting
     */
    private Integer totalWaiting;

    /**
     * Total patients in progress
     */
    private Integer totalInProgress;

    /**
     * Queue update type enumeration
     */
    public enum QueueUpdateType {
        ADD,        // Patient added to queue
        UPDATE,     // Patient status updated
        REMOVE,     // Patient removed from queue
        REPOSITION, // Queue positions recalculated
        CALL,       // Patient called (moved to IN_PROGRESS)
        COMPLETE,   // Patient consultation completed
        MISS        // Patient marked as missed
    }
}
