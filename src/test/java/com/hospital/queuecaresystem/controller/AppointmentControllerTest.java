package com.hospital.queuecaresystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.queuecaresystem.dto.AppointmentRequest;
import com.hospital.queuecaresystem.dto.AppointmentResponse;
import com.hospital.queuecaresystem.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AppointmentController Integration Tests")
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    private AppointmentRequest appointmentRequest;
    private AppointmentResponse appointmentResponse;

    @BeforeEach
    void setUp() {
        appointmentRequest = new AppointmentRequest();
        appointmentRequest.setPatientId(1L);
        appointmentRequest.setDoctorId(2L);
        appointmentRequest.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointmentRequest.setNotes("Regular checkup");

        appointmentResponse = new AppointmentResponse();
        appointmentResponse.setId(1L);
        appointmentResponse.setAppointmentDate(LocalDateTime.now().plusDays(1));
        appointmentResponse.setStatus("SCHEDULED");
        appointmentResponse.setTokenNumber(1);
    }

    @Test
    @DisplayName("Should book appointment with PATIENT role")
    @WithMockUser(roles = "PATIENT")
    void testBookAppointment() throws Exception {
        when(appointmentService.bookAppointment(any(AppointmentRequest.class)))
                .thenReturn(appointmentResponse);

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.patientId").value(1L))
                .andExpect(jsonPath("$.status").value("SCHEDULED"));

        verify(appointmentService, times(1)).bookAppointment(any(AppointmentRequest.class));
    }

    @Test
    @DisplayName("Should book appointment with ADMIN role")
    @WithMockUser(roles = "ADMIN")
    void testBookAppointmentAsAdmin() throws Exception {
        when(appointmentService.bookAppointment(any(AppointmentRequest.class)))
                .thenReturn(appointmentResponse);

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));

        verify(appointmentService, times(1)).bookAppointment(any(AppointmentRequest.class));
    }

    @Test
    @DisplayName("Should deny booking with DOCTOR role")
    @WithMockUser(roles = "DOCTOR")
    void testBookAppointmentDoctorForbidden() throws Exception {
        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isForbidden());

        verify(appointmentService, never()).bookAppointment(any());
    }

    @Test
    @DisplayName("Should return 401 when not authenticated")
    void testBookAppointmentUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should get appointment by ID")
    @WithMockUser(roles = "PATIENT")
    void testGetAppointmentById() throws Exception {
        when(appointmentService.getAppointmentById(1L))
                .thenReturn(appointmentResponse);

        mockMvc.perform(get("/api/appointments/{appointmentId}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("SCHEDULED"));

        verify(appointmentService, times(1)).getAppointmentById(1L);
    }

    @Test
    @DisplayName("Should get appointments by patient with pagination")
    @WithMockUser(roles = "PATIENT")
    void testGetAppointmentsByPatient() throws Exception {
        Page<AppointmentResponse> page = new PageImpl<>(
                Arrays.asList(appointmentResponse),
                PageRequest.of(0, 20),
                1
        );

        when(appointmentService.getAppointmentsByPatient(1L, PageRequest.of(0, 20)))
                .thenReturn(page);

        mockMvc.perform(get("/api/appointments/patient/{patientId}", 1L)
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(appointmentService, times(1)).getAppointmentsByPatient(eq(1L), any());
    }

    @Test
    @DisplayName("Should get appointments by doctor with pagination")
    @WithMockUser(roles = "DOCTOR")
    void testGetAppointmentsByDoctor() throws Exception {
        Page<AppointmentResponse> page = new PageImpl<>(
                Arrays.asList(appointmentResponse),
                PageRequest.of(0, 20),
                1
        );

        when(appointmentService.getAppointmentsByDoctor(2L, PageRequest.of(0, 20)))
                .thenReturn(page);

        mockMvc.perform(get("/api/appointments/doctor/{doctorId}", 2L)
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        verify(appointmentService, times(1)).getAppointmentsByDoctor(eq(2L), any());
    }

    @Test
    @DisplayName("Should update appointment status")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateAppointmentStatus() throws Exception {
        appointmentResponse.setStatus("COMPLETED");
        when(appointmentService.updateAppointmentStatus(1L, "COMPLETED"))
                .thenReturn(appointmentResponse);

        mockMvc.perform(patch("/api/appointments/{appointmentId}/status", 1L)
                .param("status", "COMPLETED")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        verify(appointmentService, times(1)).updateAppointmentStatus(1L, "COMPLETED");
    }

    @Test
    @DisplayName("Should cancel appointment")
    @WithMockUser(roles = "PATIENT")
    void testCancelAppointment() throws Exception {
        appointmentResponse.setStatus("CANCELLED");
        when(appointmentService.cancelAppointment(1L))
                .thenReturn(appointmentResponse);

        mockMvc.perform(delete("/api/appointments/{appointmentId}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(appointmentService, times(1)).cancelAppointment(1L);
    }

    @Test
    @DisplayName("Should validate missing patientId")
    @WithMockUser(roles = "PATIENT")
    void testBookAppointmentMissingPatientId() throws Exception {
        appointmentRequest.setPatientId(null);

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should validate missing doctorId")
    @WithMockUser(roles = "PATIENT")
    void testBookAppointmentMissingDoctorId() throws Exception {
        appointmentRequest.setDoctorId(null);

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isBadRequest());
    }
}
