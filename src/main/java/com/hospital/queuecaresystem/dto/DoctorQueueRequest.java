package com.hospital.queuecaresystem.dto;

import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for doctor queue operations
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorQueueRequest {

    @NotNull(message = "Appointment ID cannot be null")
    private Long appointmentId;

    @NotNull(message = "Queue status cannot be null")
    private QueueStatus status;

    private String notes;
}
