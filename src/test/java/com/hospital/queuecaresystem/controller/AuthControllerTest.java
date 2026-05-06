package com.hospital.queuecaresystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.queuecaresystem.dto.AuthRequest;
import com.hospital.queuecaresystem.dto.AuthResponse;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.security.CustomUserDetails;
import com.hospital.queuecaresystem.security.JwtTokenProvider;
import com.hospital.queuecaresystem.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.entity.Role;

import java.util.Arrays;

import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserService userService;

    private AuthRequest authRequest;
    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        authRequest = new AuthRequest();
        authRequest.setEmail("test@email.com");
        authRequest.setPassword("password");

        User testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@email.com");
        testUser.setPassword("hashedPassword");
        testUser.setRole(Role.PATIENT);
        userDetails = new CustomUserDetails(testUser);
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() throws Exception {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(userDetails))
                .thenReturn("valid.jwt.token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@email.com"));

        verify(authenticationManager, times(1)).authenticate(any());
        verify(jwtTokenProvider, times(1)).generateToken(userDetails);
    }

    @Test
    @DisplayName("Should return 401 for invalid credentials")
    void testLoginFailureInvalidCredentials() throws Exception {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isUnauthorized());

        verify(authenticationManager, times(1)).authenticate(any());
    }

    @Test
    @DisplayName("Should return 400 for missing email")
    void testLoginValidationMissingEmail() throws Exception {
        authRequest.setEmail(null);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 for invalid email format")
    void testLoginValidationInvalidEmail() throws Exception {
        authRequest.setEmail("invalid-email");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 for missing password")
    void testLoginValidationMissingPassword() throws Exception {
        authRequest.setPassword(null);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return correct response structure")
    void testLoginResponseStructure() throws Exception {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(userDetails))
                .thenReturn("test.jwt.token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test.jwt.token"))
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@email.com"))
                .andExpect(jsonPath("$.role").value("ROLE_PATIENT"));

        verify(jwtTokenProvider, times(1)).generateToken(userDetails);
    }

    @Test
    @DisplayName("Should handle DOCTOR role login")
    void testLoginDoctorRole() throws Exception {
        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setEmail("doctor@test.com");
        doctorUser.setPassword("hashedPassword");
        doctorUser.setRole(Role.DOCTOR);
        CustomUserDetails doctorDetails = new CustomUserDetails(doctorUser);

        authRequest.setEmail("doctor@test.com");
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                doctorDetails, null, doctorDetails.getAuthorities());

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(doctorDetails))
                .thenReturn("doctor.jwt.token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_DOCTOR"));
    }
}
