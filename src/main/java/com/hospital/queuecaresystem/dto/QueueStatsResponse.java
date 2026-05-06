package com.hospital.queuecaresystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

/**
 * DTO for queue statistics
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QueueStatsResponse {

    private Long doctorId;
    private String doctorName;
    private LocalDate date;
    private Long totalPatients;
    private Long waitingCount;
    private Long inProgressCount;
    private Long completedCount;
    private Long missedCount;
    private Long averageConsultationMinutes;
}
