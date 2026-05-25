package com.hospital.queuecaresystem.dto;

import com.hospital.queuecaresystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response for user disable/deactivate operation
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDisableResponse {

    private Long id;
    private String email;
    private Role role;
    private Boolean isActive;
    private String message;
}
