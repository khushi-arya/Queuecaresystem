package com.hospital.queuecaresystem.dto;

import com.hospital.queuecaresystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {

    private Long userId;
    private String email;
    private Role previousRole;
    private Role newRole;
    private String message;

    public PromotionResponse(Long userId, String email, Role previousRole, Role newRole) {
        this.userId = userId;
        this.email = email;
        this.previousRole = previousRole;
        this.newRole = newRole;
        this.message = "User promoted successfully";
    }
}
