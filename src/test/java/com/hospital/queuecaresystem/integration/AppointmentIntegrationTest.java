package com.hospital.queuecaresystem.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.queuecaresystem.dto.AppointmentRequest;
import com.hospital.queuecaresystem.entity.*;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.repository.AppointmentRepository;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.repository.PatientRepository;
import com.hospital.queuecaresystem.repository.UserRepository;
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

import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Appointment Integration Tests")
class AppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    private Patient patient;
    private Doctor doctor;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        patientRepository.deleteAll();
        doctorRepository.deleteAll();

        User patientUser = new User();
        patientUser.setEmail("patient@test.com");
        patientUser.setPassword("password");
        patientUser.setRole(Role.PATIENT);
        patientUser = userRepository.save(patientUser);

        patient = new Patient();
        patient.setUser(patientUser);
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient = patientRepository.save(patient);

        User doctorUser = new User();
        doctorUser.setEmail("doctor@test.com");
        doctorUser.setPassword("password");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser = userRepository.save(doctorUser);

        doctor = new Doctor();
        doctor.setUser(doctorUser);
        doctor.setName("Dr. Jane Smith");
        doctor.setStatus(Doctor.DoctorStatus.ACTIVE);
        doctor.setShiftStartTime(LocalTime.of(9, 0));
        doctor.setShiftEndTime(LocalTime.of(17, 0));
        doctor.setMaxPatientsPerDay(20);
        doctor = doctorRepository.save(doctor);

        appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        appointment.setTokenNumber(1);
        appointment = appointmentRepository.save(appointment);
    }

    @Test
    @DisplayName("Should book appointment successfully with valid data")
    @WithMockUser(roles = "PATIENT")
    void testBookAppointmentSuccess() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patient.getId());
        request.setDoctorId(doctor.getId());
        request.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));
        request.setNotes("Regular checkup");

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.patientId").value(patient.getId()))
                .andExpect(jsonPath("$.doctorId").value(doctor.getId()))
                .andExpect(jsonPath("$.status").value("SCHEDULED"));
    }

    @Test
    @DisplayName("Should fail to book appointment with non-existent patient")
    @WithMockUser(roles = "PATIENT")
    void testBookAppointmentWithInvalidPatient() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(9999L);
        request.setDoctorId(doctor.getId());
        request.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should fail to book appointment with non-existent doctor")
    @WithMockUser(roles = "PATIENT")
    void testBookAppointmentWithInvalidDoctor() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patient.getId());
        request.setDoctorId(9999L);
        request.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should retrieve appointment by ID")
    @WithMockUser(roles = "PATIENT")
    void testGetAppointmentById() throws Exception {
        mockMvc.perform(get("/api/appointments/{appointmentId}", appointment.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointment.getId()))
                .andExpect(jsonPath("$.patientId").value(patient.getId()))
                .andExpect(jsonPath("$.doctorId").value(doctor.getId()));
    }

    @Test
    @DisplayName("Should return 404 for non-existent appointment")
    @WithMockUser(roles = "PATIENT")
    void testGetAppointmentByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/appointments/{appointmentId}", 9999L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should retrieve appointments by patient with pagination")
    @WithMockUser(roles = "PATIENT")
    void testGetAppointmentsByPatient() throws Exception {
        mockMvc.perform(get("/api/appointments/patient/{patientId}", patient.getId())
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.totalElements").value(greaterThan(0)));
    }

    @Test
    @DisplayName("Should retrieve appointments by doctor with pagination")
    @WithMockUser(roles = "DOCTOR")
    void testGetAppointmentsByDoctor() throws Exception {
        mockMvc.perform(get("/api/appointments/doctor/{doctorId}", doctor.getId())
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("Should update appointment status to COMPLETED")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateAppointmentStatus() throws Exception {
        mockMvc.perform(patch("/api/appointments/{appointmentId}/status", appointment.getId())
                .param("status", "COMPLETED")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        Appointment updated = appointmentRepository.findById(appointment.getId()).orElse(null);
        assert updated != null;
        assert updated.getStatus() == Appointment.AppointmentStatus.COMPLETED;
    }

    @Test
    @DisplayName("Should cancel appointment")
    @WithMockUser(roles = "PATIENT")
    void testCancelAppointment() throws Exception {
        mockMvc.perform(delete("/api/appointments/{appointmentId}", appointment.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        Appointment cancelled = appointmentRepository.findById(appointment.getId()).orElse(null);
        assert cancelled != null;
        assert cancelled.getStatus() == Appointment.AppointmentStatus.CANCELLED;
    }

    @Test
    @DisplayName("Should retrieve appointments by status with ADMIN role")
    @WithMockUser(roles = "ADMIN")
    void testGetAppointmentsByStatus() throws Exception {
        mockMvc.perform(get("/api/appointments/status/{status}", "SCHEDULED")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("Should deny appointment booking without authentication")
    void testBookAppointmentUnauthenticated() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patient.getId());
        request.setDoctorId(doctor.getId());
        request.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should validate missing required fields")
    @WithMockUser(roles = "PATIENT")
    void testBookAppointmentValidation() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(null);
        request.setDoctorId(doctor.getId());
        request.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
