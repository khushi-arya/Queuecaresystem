package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.dto.QueueStatsResponse;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import com.hospital.queuecaresystem.service.DoctorQueueService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("QueueController Integration Tests")
class QueueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorQueueService doctorQueueService;

    private DoctorQueueResponse queueResponse;
    private QueueStatsResponse statsResponse;

    @BeforeEach
    void setUp() {
        queueResponse = new DoctorQueueResponse();
        queueResponse.setId(1L);
        queueResponse.setPatientId(1L);
        queueResponse.setDoctorId(2L);
        queueResponse.setStatus(QueueStatus.WAITING);
        queueResponse.setQueuePosition(1);
        queueResponse.setQueueDate(LocalDate.now());

        statsResponse = new QueueStatsResponse();
        statsResponse.setDoctorId(2L);
        statsResponse.setWaitingCount(5L);
        statsResponse.setInProgressCount(1L);
        statsResponse.setCompletedCount(10L);
        statsResponse.setMissedCount(0L);
    }

    @Test
    @DisplayName("Should get today's queue with pagination")
    @WithMockUser(roles = "DOCTOR")
    void testGetTodayQueue() throws Exception {
        Page<DoctorQueueResponse> page = new PageImpl<>(
                Arrays.asList(queueResponse),
                PageRequest.of(0, 20),
                1
        );

        when(doctorQueueService.getTodayQueue(2L, PageRequest.of(0, 20)))
                .thenReturn(page);

        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", "2")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].queuePosition").value(1));

        verify(doctorQueueService, times(1)).getTodayQueue(eq(2L), any());
    }

    @Test
    @DisplayName("Should get queue by date with pagination")
    @WithMockUser(roles = "DOCTOR")
    void testGetQueueByDate() throws Exception {
        LocalDate date = LocalDate.now();
        Page<DoctorQueueResponse> page = new PageImpl<>(
                Arrays.asList(queueResponse),
                PageRequest.of(0, 20),
                1
        );

        when(doctorQueueService.getQueueByDate(2L, date, PageRequest.of(0, 20)))
                .thenReturn(page);

        mockMvc.perform(get("/api/queue/date")
                .param("doctorId", "2")
                .param("date", date.toString())
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        verify(doctorQueueService, times(1)).getQueueByDate(eq(2L), eq(date), any());
    }

    @Test
    @DisplayName("Should call next patient")
    @WithMockUser(roles = "DOCTOR")
    void testCallNextPatient() throws Exception {
        queueResponse.setStatus(QueueStatus.IN_PROGRESS);
        when(doctorQueueService.callNextPatient(2L))
                .thenReturn(queueResponse);

        mockMvc.perform(post("/api/queue/next")
                .param("doctorId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(doctorQueueService, times(1)).callNextPatient(2L);
    }

    @Test
    @DisplayName("Should get current consultation")
    @WithMockUser(roles = "DOCTOR")
    void testGetCurrentConsultation() throws Exception {
        queueResponse.setStatus(QueueStatus.IN_PROGRESS);
        when(doctorQueueService.getCurrentConsultation(2L))
                .thenReturn(queueResponse);

        mockMvc.perform(get("/api/queue/current")
                .param("doctorId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(doctorQueueService, times(1)).getCurrentConsultation(2L);
    }

    @Test
    @DisplayName("Should return null when no current consultation")
    @WithMockUser(roles = "DOCTOR")
    void testGetCurrentConsultationNull() throws Exception {
        when(doctorQueueService.getCurrentConsultation(2L))
                .thenReturn(null);

        mockMvc.perform(get("/api/queue/current")
                .param("doctorId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(doctorQueueService, times(1)).getCurrentConsultation(2L);
    }

    @Test
    @DisplayName("Should update queue status to DONE")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateQueueStatusDone() throws Exception {
        queueResponse.setStatus(QueueStatus.DONE);
        when(doctorQueueService.updateQueueStatus(1L, QueueStatus.DONE))
                .thenReturn(queueResponse);

        mockMvc.perform(put("/api/queue/{queueId}/status", 1L)
                .param("status", "DONE")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));

        verify(doctorQueueService, times(1)).updateQueueStatus(1L, QueueStatus.DONE);
    }

    @Test
    @DisplayName("Should update queue status to MISSED")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateQueueStatusMissed() throws Exception {
        queueResponse.setStatus(QueueStatus.MISSED);
        when(doctorQueueService.updateQueueStatus(1L, QueueStatus.MISSED))
                .thenReturn(queueResponse);

        mockMvc.perform(put("/api/queue/{queueId}/status", 1L)
                .param("status", "MISSED")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MISSED"));

        verify(doctorQueueService, times(1)).updateQueueStatus(1L, QueueStatus.MISSED);
    }

    @Test
    @DisplayName("Should return 400 when status parameter is missing")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateQueueStatusMissingParameter() throws Exception {
        mockMvc.perform(put("/api/queue/{queueId}/status", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should get queue statistics")
    @WithMockUser(roles = "DOCTOR")
    void testGetQueueStats() throws Exception {
        when(doctorQueueService.getQueueStats(2L))
                .thenReturn(statsResponse);

        mockMvc.perform(get("/api/queue/stats")
                .param("doctorId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.waitingCount").value(5))
                .andExpect(jsonPath("$.inProgressCount").value(1))
                .andExpect(jsonPath("$.completedCount").value(10))
                .andExpect(jsonPath("$.missedCount").value(0));

        verify(doctorQueueService, times(1)).getQueueStats(2L);
    }

    @Test
    @DisplayName("Should deny access without authentication")
    void testAccessDeniedWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should deny access with non-DOCTOR role")
    @WithMockUser(roles = "PATIENT")
    void testAccessDeniedWithPatientRole() throws Exception {
        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should allow access with DOCTOR role")
    @WithMockUser(roles = "DOCTOR")
    void testAccessAllowedWithDoctorRole() throws Exception {
        Page<DoctorQueueResponse> page = new PageImpl<>(
                Arrays.asList(queueResponse),
                PageRequest.of(0, 20),
                1
        );

        when(doctorQueueService.getTodayQueue(eq(2L), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", "2")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
