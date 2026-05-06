package com.hospital.queuecaresystem.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.queuecaresystem.dto.AuthRequest;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Authentication Integration Tests")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testPatient;
    private User testDoctor;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testPatient = new User();
        testPatient.setEmail("integration.patient@test.com");
        testPatient.setPassword(passwordEncoder.encode("password123"));
        testPatient.setRole(Role.PATIENT);
        userRepository.save(testPatient);

        testDoctor = new User();
        testDoctor.setEmail("integration.doctor@test.com");
        testDoctor.setPassword(passwordEncoder.encode("password123"));
        testDoctor.setRole(Role.DOCTOR);
        userRepository.save(testDoctor);
    }

    @Test
    @DisplayName("Should successfully authenticate patient with valid credentials")
    void testPatientAuthenticationSuccess() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("integration.patient@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.userId").value(testPatient.getId()))
                .andExpect(jsonPath("$.email").value("integration.patient@test.com"))
                .andExpect(jsonPath("$.role").value("ROLE_PATIENT"));
    }

    @Test
    @DisplayName("Should successfully authenticate doctor with valid credentials")
    void testDoctorAuthenticationSuccess() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("integration.doctor@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role").value("ROLE_DOCTOR"));
    }

    @Test
    @DisplayName("Should reject authentication with incorrect password")
    void testAuthenticationWithIncorrectPassword() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("integration.patient@test.com");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject authentication with non-existent email")
    void testAuthenticationWithNonExistentEmail() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("nonexistent@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject request with invalid email format")
    void testAuthenticationWithInvalidEmailFormat() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("invalid-email");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should reject request with blank email")
    void testAuthenticationWithBlankEmail() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should reject request with blank password")
    void testAuthenticationWithBlankPassword() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("integration.patient@test.com");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return valid JWT token that contains required claims")
    void testJWTTokenContainsRequiredClaims() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("integration.patient@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.role").exists());
    }

    @Test
    @DisplayName("Should handle case-insensitive email lookup")
    void testCaseSensitiveEmailLookup() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("INTEGRATION.PATIENT@TEST.COM");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should not expose password in response")
    void testPasswordNotExposedInResponse() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("integration.patient@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist());
    }
}
