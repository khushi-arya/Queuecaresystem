package com.hospital.queuecaresystem.dto;

import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for queue information response
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorQueueResponse {

    private Long id;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private LocalDate queueDate;
    private Integer queuePosition;
    private Integer patientsAhead;
    private Long estimatedWaitTimeMinutes;
    private QueueStatus status;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private LocalDateTime missedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
