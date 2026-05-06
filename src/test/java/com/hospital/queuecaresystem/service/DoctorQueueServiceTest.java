package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.dto.QueueStatsResponse;
import com.hospital.queuecaresystem.entity.*;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import com.hospital.queuecaresystem.exception.InvalidOperationException;
import com.hospital.queuecaresystem.exception.ResourceNotFoundException;
import com.hospital.queuecaresystem.repository.DoctorQueueRepository;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.repository.AppointmentRepository;
import com.hospital.queuecaresystem.service.impl.DoctorQueueServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DoctorQueueService
 * Tests FIFO queue operations and state transitions
 */
@ExtendWith(MockitoExtension.class)
class DoctorQueueServiceTest {

    @Mock
    private DoctorQueueRepository doctorQueueRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private DoctorQueueServiceImpl doctorQueueService;

    private Doctor doctor;
    private Patient patient;
    private Appointment appointment;
    private DoctorQueue queueItem;

    @BeforeEach
    void setUp() {
        // Setup test data
        doctor = new Doctor();
        doctor.setId(1L);
        doctor.setName("Dr. Smith");
        doctor.setSpecialization("Cardiology");
        doctor.setShiftStartTime(LocalTime.of(9, 0));
        doctor.setShiftEndTime(LocalTime.of(17, 0));

        patient = new Patient();
        patient.setId(1L);
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setPhoneNumber("1234567890");

        appointment = new Appointment();
        appointment.setId(1L);
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(LocalDateTime.now().plusHours(1));
        appointment.setTokenNumber(1);
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);

        queueItem = new DoctorQueue();
        queueItem.setId(1L);
        queueItem.setDoctor(doctor);
        queueItem.setAppointment(appointment);
        queueItem.setQueueDate(LocalDate.now());
        queueItem.setQueuePosition(1);
        queueItem.setStatus(QueueStatus.WAITING);
    }

    @Test
    void testGetTodayQueue_Success() {
        // Arrange
        List<DoctorQueue> queueList = List.of(queueItem);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorQueueRepository.getTodayQueueForDoctor(1L, LocalDate.now()))
            .thenReturn(queueList);

        // Act
        List<DoctorQueueResponse> result = doctorQueueService.getTodayQueue(1L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQueuePosition()).isEqualTo(1);
        verify(doctorRepository).findById(1L);
        verify(doctorQueueRepository).getTodayQueueForDoctor(1L, LocalDate.now());
    }

    @Test
    void testGetTodayQueue_DoctorNotFound() {
        // Arrange
        when(doctorRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> doctorQueueService.getTodayQueue(999L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("Doctor not found with id: 999");
    }

    @Test
    void testCallNextPatient_Success() {
        // Arrange
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorQueueRepository.getCurrentInProgressQueue(1L, LocalDate.now()))
            .thenReturn(Optional.empty());
        when(doctorQueueRepository.findFirstByDoctorIdAndQueueDateAndStatusOrderByQueuePositionAsc(1L, LocalDate.now(), QueueStatus.WAITING))
            .thenReturn(Optional.of(queueItem));
        when(doctorQueueRepository.save(any(DoctorQueue.class)))
            .thenAnswer(invocation -> {
                DoctorQueue q = invocation.getArgument(0);
                q.setCalledAt(LocalDateTime.now());
                return q;
            });

        // Act
        DoctorQueueResponse result = doctorQueueService.callNextPatient(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(QueueStatus.IN_PROGRESS);
        assertThat(result.getCalledAt()).isNotNull();
        verify(doctorQueueRepository).save(any(DoctorQueue.class));
    }

    @Test
    void testCallNextPatient_AlreadyInProgress() {
        // Arrange
        DoctorQueue inProgressQueue = new DoctorQueue();
        inProgressQueue.setStatus(QueueStatus.IN_PROGRESS);
        
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorQueueRepository.getCurrentInProgressQueue(1L, LocalDate.now()))
            .thenReturn(Optional.of(inProgressQueue));

        // Act & Assert
        assertThatThrownBy(() -> doctorQueueService.callNextPatient(1L))
            .isInstanceOf(InvalidOperationException.class)
            .hasMessage("Doctor already has a patient in consultation. Complete or mark as missed first.");
    }

    @Test
    void testCallNextPatient_NoWaitingPatients() {
        // Arrange
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorQueueRepository.getCurrentInProgressQueue(1L, LocalDate.now()))
            .thenReturn(Optional.empty());
        when(doctorQueueRepository.findFirstByDoctorIdAndQueueDateAndStatusOrderByQueuePositionAsc(1L, LocalDate.now(), QueueStatus.WAITING))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> doctorQueueService.callNextPatient(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessage("No waiting patients in queue for doctor: 1");
    }

    @Test
    void testUpdateQueueStatus_WaitingToInProgress() {
        // Arrange
        when(doctorQueueRepository.findById(1L)).thenReturn(Optional.of(queueItem));
        when(doctorQueueRepository.save(any(DoctorQueue.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        DoctorQueueResponse result = doctorQueueService.updateQueueStatus(1L, QueueStatus.IN_PROGRESS);

        // Assert
        assertThat(result.getStatus()).isEqualTo(QueueStatus.IN_PROGRESS);
        verify(doctorQueueRepository).save(any(DoctorQueue.class));
    }

    @Test
    void testUpdateQueueStatus_InProgressToDone() {
        // Arrange
        queueItem.setStatus(QueueStatus.IN_PROGRESS);
        queueItem.setCalledAt(LocalDateTime.now());
        
        when(doctorQueueRepository.findById(1L)).thenReturn(Optional.of(queueItem));
        when(doctorQueueRepository.save(any(DoctorQueue.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        DoctorQueueResponse result = doctorQueueService.updateQueueStatus(1L, QueueStatus.DONE);

        // Assert
        assertThat(result.getStatus()).isEqualTo(QueueStatus.DONE);
        assertThat(result.getCompletedAt()).isNotNull();
        verify(doctorQueueRepository).save(any(DoctorQueue.class));
    }

    @Test
    void testUpdateQueueStatus_InProgressToMissed() {
        // Arrange
        queueItem.setStatus(QueueStatus.IN_PROGRESS);
        
        when(doctorQueueRepository.findById(1L)).thenReturn(Optional.of(queueItem));
        when(doctorQueueRepository.save(any(DoctorQueue.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        DoctorQueueResponse result = doctorQueueService.updateQueueStatus(1L, QueueStatus.MISSED);

        // Assert
        assertThat(result.getStatus()).isEqualTo(QueueStatus.MISSED);
        assertThat(result.getMissedAt()).isNotNull();
        verify(doctorQueueRepository).save(any(DoctorQueue.class));
    }

    @Test
    void testUpdateQueueStatus_InvalidTransition() {
        // Arrange
        queueItem.setStatus(QueueStatus.DONE); // Terminal state
        when(doctorQueueRepository.findById(1L)).thenReturn(Optional.of(queueItem));

        // Act & Assert
        assertThatThrownBy(() -> doctorQueueService.updateQueueStatus(1L, QueueStatus.WAITING))
            .isInstanceOf(InvalidOperationException.class)
            .hasMessage("Invalid state transition from DONE to WAITING");
    }

    @Test
    void testIsValidStateTransition() {
        // WAITING -> IN_PROGRESS
        assertThat(doctorQueueService.isValidStateTransition(QueueStatus.WAITING, QueueStatus.IN_PROGRESS))
            .isTrue();

        // WAITING -> MISSED
        assertThat(doctorQueueService.isValidStateTransition(QueueStatus.WAITING, QueueStatus.MISSED))
            .isTrue();

        // IN_PROGRESS -> DONE
        assertThat(doctorQueueService.isValidStateTransition(QueueStatus.IN_PROGRESS, QueueStatus.DONE))
            .isTrue();

        // IN_PROGRESS -> MISSED
        assertThat(doctorQueueService.isValidStateTransition(QueueStatus.IN_PROGRESS, QueueStatus.MISSED))
            .isTrue();

        // DONE -> WAITING (invalid)
        assertThat(doctorQueueService.isValidStateTransition(QueueStatus.DONE, QueueStatus.WAITING))
            .isFalse();

        // MISSED -> WAITING (invalid)
        assertThat(doctorQueueService.isValidStateTransition(QueueStatus.MISSED, QueueStatus.WAITING))
            .isFalse();

        // Same status
        assertThat(doctorQueueService.isValidStateTransition(QueueStatus.WAITING, QueueStatus.WAITING))
            .isFalse();
    }

    @Test
    void testGetQueueStats_Success() {
        // Arrange
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorQueueRepository.countByDoctorAndStatusAndDate(1L, QueueStatus.WAITING, LocalDate.now()))
            .thenReturn(3L);
        when(doctorQueueRepository.countByDoctorAndStatusAndDate(1L, QueueStatus.IN_PROGRESS, LocalDate.now()))
            .thenReturn(1L);
        when(doctorQueueRepository.countByDoctorAndStatusAndDate(1L, QueueStatus.DONE, LocalDate.now()))
            .thenReturn(5L);
        when(doctorQueueRepository.countByDoctorAndStatusAndDate(1L, QueueStatus.MISSED, LocalDate.now()))
            .thenReturn(1L);
        when(doctorQueueRepository.findByDoctorIdAndStatusAndQueueDate(1L, QueueStatus.DONE, LocalDate.now()))
            .thenReturn(new ArrayList<>());

        // Act
        QueueStatsResponse result = doctorQueueService.getQueueStats(1L);

        // Assert
        assertThat(result.getDoctorId()).isEqualTo(1L);
        assertThat(result.getTotalPatients()).isEqualTo(10L);
        assertThat(result.getWaitingCount()).isEqualTo(3L);
        assertThat(result.getInProgressCount()).isEqualTo(1L);
        assertThat(result.getCompletedCount()).isEqualTo(5L);
        assertThat(result.getMissedCount()).isEqualTo(1L);
    }

    @Test
    void testAddPatientToQueue_Success() {
        // Arrange
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(doctorQueueRepository.findByAppointmentId(1L)).thenReturn(Optional.empty());
        when(doctorQueueRepository.getTodayQueueForDoctor(1L, LocalDate.now()))
            .thenReturn(new ArrayList<>());
        when(doctorQueueRepository.save(any(DoctorQueue.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        doctorQueueService.addPatientToQueue(1L);

        // Assert
        verify(doctorQueueRepository).save(any(DoctorQueue.class));
    }

    @Test
    void testRemovePatientFromQueue_Success() {
        // Arrange
        when(doctorQueueRepository.findByAppointmentId(1L)).thenReturn(Optional.of(queueItem));

        // Act
        doctorQueueService.removePatientFromQueue(1L);

        // Assert
        verify(doctorQueueRepository).delete(queueItem);
    }

    @Test
    void testRemovePatientFromQueue_NotFound() {
        // Arrange
        when(doctorQueueRepository.findByAppointmentId(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> doctorQueueService.removePatientFromQueue(999L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testGetCurrentConsultation_HasCurrent() {
        // Arrange
        queueItem.setStatus(QueueStatus.IN_PROGRESS);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorQueueRepository.getCurrentInProgressQueue(1L, LocalDate.now()))
            .thenReturn(Optional.of(queueItem));

        // Act
        DoctorQueueResponse result = doctorQueueService.getCurrentConsultation(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(QueueStatus.IN_PROGRESS);
    }

    @Test
    void testGetCurrentConsultation_NoCurrentConsultation() {
        // Arrange
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorQueueRepository.getCurrentInProgressQueue(1L, LocalDate.now()))
            .thenReturn(Optional.empty());

        // Act
        DoctorQueueResponse result = doctorQueueService.getCurrentConsultation(1L);

        // Assert
        assertThat(result).isNull();
    }
}
