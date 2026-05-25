package com.hospital.queuecaresystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Appointment statistics for a date range
 * Provides detailed metrics about appointments
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentStatsResponse {

    private Long totalAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Long scheduledAppointments;
    private Long noShowAppointments;
    private Double completionRatio;
    private Double cancellationRatio;
    private String startDate;
    private String endDate;
}
