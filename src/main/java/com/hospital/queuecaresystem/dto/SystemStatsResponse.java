package com.hospital.queuecaresystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * System-wide statistics response for admin dashboard
 * Provides overall metrics about the system
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatsResponse {

    private Long totalUsers;
    private Long totalAppointments;
    private Long totalDoctors;
    private Long completedAppointments;
    private Long cancelledAppointments;
    private Double completionRatio;
    private Long activeUsers;
}
