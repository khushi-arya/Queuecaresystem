package com.hospital.queuecaresystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * User breakdown statistics by role
 * Provides counts of users in each role category
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {

    private Long patientCount;
    private Long doctorCount;
    private Long adminCount;
    private Long totalUsers;
}
