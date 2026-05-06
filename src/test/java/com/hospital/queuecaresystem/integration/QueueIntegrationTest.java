package com.hospital.queuecaresystem.integration;

import com.hospital.queuecaresystem.entity.*;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Queue Integration Tests")
class QueueIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DoctorQueueRepository queueRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    private Doctor doctor;
    private Patient patient;
    private Appointment appointment;
    private DoctorQueue queueItem;

    @BeforeEach
    void setUp() {
        queueRepository.deleteAll();
        appointmentRepository.deleteAll();
        patientRepository.deleteAll();
        doctorRepository.deleteAll();
        userRepository.deleteAll();

        // Create doctor user
        User doctorUser = new User();
        doctorUser.setEmail("doctor@test.com");
        doctorUser.setPassword("password");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser = userRepository.save(doctorUser);

        doctor = new Doctor();
        doctor.setUser(doctorUser);
        doctor.setName("Dr. Jane Smith");
        doctor.setSpecialization("Cardiology");
        doctor.setShiftStartTime(LocalTime.of(9, 0));
        doctor.setShiftEndTime(LocalTime.of(17, 0));
        doctor.setMaxPatientsPerDay(50);
        doctor.setStatus(DoctorStatus.ACTIVE);
        doctor = doctorRepository.save(doctor);

        // Create patient user
        User patientUser = new User();
        patientUser.setEmail("patient@test.com");
        patientUser.setPassword("password");
        patientUser.setRole(Role.PATIENT);
        patientUser = userRepository.save(patientUser);

        patient = new Patient();
        patient.setUser(patientUser);
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setPhoneNumber("1234567890");
        patient = patientRepository.save(patient);

        appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(LocalDateTime.now().withHour(10).withMinute(0));
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        appointment.setTokenNumber(1);
        appointment = appointmentRepository.save(appointment);

        queueItem = new DoctorQueue();
        queueItem.setDoctor(doctor);
        queueItem.setAppointment(appointment);
        queueItem.setQueueDate(LocalDate.now());
        queueItem.setStatus(QueueStatus.WAITING);
        queueItem.setQueuePosition(1);
        queueItem = queueRepository.save(queueItem);
    }

    @Test
    @DisplayName("Should retrieve today's queue with pagination")
    @WithMockUser(roles = "DOCTOR")
    void testGetTodayQueue() throws Exception {
        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", doctor.getId().toString())
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.content[0].patientId").value(patient.getId()))
                .andExpect(jsonPath("$.content[0].status").value("WAITING"));
    }

    @Test
    @DisplayName("Should retrieve queue by specific date")
    @WithMockUser(roles = "DOCTOR")
    void testGetQueueByDate() throws Exception {
        mockMvc.perform(get("/api/queue/date")
                .param("doctorId", doctor.getId().toString())
                .param("date", LocalDate.now().toString())
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("Should call next patient and update status to IN_PROGRESS")
    @WithMockUser(roles = "DOCTOR")
    void testCallNextPatient() throws Exception {
        mockMvc.perform(post("/api/queue/next")
                .param("doctorId", doctor.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.patientId").value(patient.getId()));

        DoctorQueue updated = queueRepository.findById(queueItem.getId()).orElse(null);
        assert updated != null;
        assert updated.getStatus() == QueueStatus.IN_PROGRESS;
    }

    @Test
    @DisplayName("Should get current consultation")
    @WithMockUser(roles = "DOCTOR")
    void testGetCurrentConsultation() throws Exception {
        queueItem.setStatus(QueueStatus.IN_PROGRESS);
        queueRepository.save(queueItem);

        mockMvc.perform(get("/api/queue/current")
                .param("doctorId", doctor.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.patientId").value(patient.getId()));
    }

    @Test
    @DisplayName("Should update queue status to DONE")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateQueueStatusToDone() throws Exception {
        queueItem.setStatus(QueueStatus.IN_PROGRESS);
        queueRepository.save(queueItem);

        mockMvc.perform(put("/api/queue/{queueId}/status", queueItem.getId())
                .param("status", "DONE")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));

        DoctorQueue updated = queueRepository.findById(queueItem.getId()).orElse(null);
        assert updated != null;
        assert updated.getStatus() == QueueStatus.DONE;
    }

    @Test
    @DisplayName("Should update queue status to MISSED")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateQueueStatusToMissed() throws Exception {
        queueItem.setStatus(QueueStatus.WAITING);
        queueRepository.save(queueItem);

        mockMvc.perform(put("/api/queue/{queueId}/status", queueItem.getId())
                .param("status", "MISSED")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MISSED"));

        DoctorQueue updated = queueRepository.findById(queueItem.getId()).orElse(null);
        assert updated != null;
        assert updated.getStatus() == QueueStatus.MISSED;
    }

    @Test
    @DisplayName("Should retrieve queue statistics")
    @WithMockUser(roles = "DOCTOR")
    void testGetQueueStats() throws Exception {
        mockMvc.perform(get("/api/queue/stats")
                .param("doctorId", doctor.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.doctorId").value(doctor.getId()))
                .andExpect(jsonPath("$.waitingCount").exists())
                .andExpect(jsonPath("$.inProgressCount").exists())
                .andExpect(jsonPath("$.completedCount").exists())
                .andExpect(jsonPath("$.missedCount").exists());
    }

    @Test
    @DisplayName("Should deny queue access without authentication")
    void testQueueAccessUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", doctor.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should deny queue access with non-DOCTOR role")
    @WithMockUser(roles = "PATIENT")
    void testQueueAccessForbidden() throws Exception {
        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", doctor.getId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should require status parameter for queue update")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateQueueStatusMissingParameter() throws Exception {
        mockMvc.perform(put("/api/queue/{queueId}/status", queueItem.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should handle non-existent queue item gracefully")
    @WithMockUser(roles = "DOCTOR")
    void testGetNonExistentQueue() throws Exception {
        mockMvc.perform(put("/api/queue/{queueId}/status", 9999L)
                .param("status", "DONE")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should allow ADMIN role to access queue operations")
    @WithMockUser(roles = "ADMIN")
    void testQueueAccessWithAdminRole() throws Exception {
        mockMvc.perform(get("/api/queue/today")
                .param("doctorId", doctor.getId().toString())
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
