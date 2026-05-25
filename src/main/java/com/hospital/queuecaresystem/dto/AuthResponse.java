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
public class AuthResponse {

    private String token;
    private UserResponse user;
    private String message;

    public AuthResponse(String token, Long userId, String email, Role role) {
        this.token = token;
        this.user = new UserResponse(userId, email, role);
        this.message = "Login successful";
    }

    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
        this.message = "Login successful";
    }
}
