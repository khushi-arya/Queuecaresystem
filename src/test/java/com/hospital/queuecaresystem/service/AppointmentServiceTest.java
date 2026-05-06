package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.AppointmentRequest;
import com.hospital.queuecaresystem.dto.AppointmentResponse;
import com.hospital.queuecaresystem.entity.Appointment;
import com.hospital.queuecaresystem.entity.Appointment.AppointmentStatus;
import com.hospital.queuecaresystem.entity.Doctor;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import com.hospital.queuecaresystem.entity.Patient;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.repository.AppointmentRepository;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.repository.PatientRepository;
import com.hospital.queuecaresystem.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentService Unit Tests")
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorQueueService doctorQueueService;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Patient patient;
    private Doctor doctor;
    private Appointment appointment;
    private AppointmentRequest appointmentRequest;

    @BeforeEach
    void setUp() {
        User patientUser = new User();
        patientUser.setEmail("patient@test.com");
        patientUser.setRole(Role.PATIENT);
        patient = new Patient();
        patient.setId(1L);
        patient.setUser(patientUser);

        User doctorUser = new User();
        doctorUser.setEmail("doctor@test.com");
        doctorUser.setRole(Role.DOCTOR);
        doctor = new Doctor();
        doctor.setId(2L);
        doctor.setUser(doctorUser);
        doctor.setStatus(Doctor.DoctorStatus.ACTIVE);
        doctor.setShiftStartTime(LocalTime.of(9, 0));
        doctor.setShiftEndTime(LocalTime.of(17, 0));

        appointment = new Appointment();
        appointment.setId(1L);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setTokenNumber(1);

        appointmentRequest = new AppointmentRequest();
        appointmentRequest.setPatientId(1L);
        appointmentRequest.setDoctorId(2L);
        appointmentRequest.setAppointmentDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        appointmentRequest.setNotes("Regular checkup");
    }

    @Test
    @DisplayName("Should book appointment successfully")
    void testBookAppointmentSuccess() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.bookAppointment(appointmentRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(patientRepository, times(1)).findById(1L);
        verify(doctorRepository, times(1)).findById(2L);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should throw exception when patient not found")
    void testBookAppointmentPatientNotFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest));
        
        verify(patientRepository, times(1)).findById(1L);
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when doctor not found")
    void testBookAppointmentDoctorNotFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, 
                () -> appointmentService.bookAppointment(appointmentRequest));
        
        verify(patientRepository, times(1)).findById(1L);
        verify(doctorRepository, times(1)).findById(2L);
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get appointment by ID")
    void testGetAppointmentById() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        AppointmentResponse response = appointmentService.getAppointmentById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(appointmentRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when appointment not found")
    void testGetAppointmentByIdNotFound() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, 
                () -> appointmentService.getAppointmentById(1L));
        
        verify(appointmentRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should get appointments by patient with pagination")
    void testGetAppointmentsByPatient() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Appointment> appointmentPage = new PageImpl<>(Arrays.asList(appointment), pageable, 1);

        when(appointmentRepository.findByPatientId(1L, pageable)).thenReturn(appointmentPage);

        Page<AppointmentResponse> responses = appointmentService.getAppointmentsByPatient(1L, pageable);

        assertNotNull(responses);
        assertEquals(1, responses.getTotalElements());
        verify(appointmentRepository, times(1)).findByPatientId(1L, pageable);
    }

    @Test
    @DisplayName("Should get appointments by doctor with pagination")
    void testGetAppointmentsByDoctor() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Appointment> appointmentPage = new PageImpl<>(Arrays.asList(appointment), pageable, 1);

        when(appointmentRepository.findByDoctorId(2L, pageable)).thenReturn(appointmentPage);

        Page<AppointmentResponse> responses = appointmentService.getAppointmentsByDoctor(2L, pageable);

        assertNotNull(responses);
        assertEquals(1, responses.getTotalElements());
        verify(appointmentRepository, times(1)).findByDoctorId(2L, pageable);
    }

    @Test
    @DisplayName("Should update appointment status")
    void testUpdateAppointmentStatus() {
        appointment.setStatus(AppointmentStatus.COMPLETED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.updateAppointmentStatus(1L, "COMPLETED");

        assertNotNull(response);
        verify(appointmentRepository, times(1)).findById(1L);
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should cancel appointment")
    void testCancelAppointment() {
        appointment.setStatus(AppointmentStatus.CANCELLED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.cancelAppointment(1L);

        assertNotNull(response);
        verify(appointmentRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should delete appointment")
    void testDeleteAppointment() {
        appointmentService.deleteAppointment(1L);

        verify(appointmentRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should check time slot availability")
    void testIsTimeSlotAvailable() {
        LocalDateTime appointmentTime = LocalDateTime.now().plusDays(1).withHour(14).withMinute(0);
        when(appointmentRepository.countAppointmentsByDoctorAndDate(2L, appointmentTime))
                .thenReturn(0L);

        boolean available = appointmentService.isTimeSlotAvailable(2L, appointmentTime);

        assertTrue(available);
        verify(appointmentRepository, times(1)).countAppointmentsByDoctorAndDate(2L, appointmentTime);
    }

    @Test
    @DisplayName("Should return unavailable for occupied slot")
    void testIsTimeSlotNotAvailable() {
        LocalDateTime appointmentTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        when(appointmentRepository.countAppointmentsByDoctorAndDate(2L, appointmentTime))
                .thenReturn(1L);

        boolean available = appointmentService.isTimeSlotAvailable(2L, appointmentTime);

        assertFalse(available);
    }
}
