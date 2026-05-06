package com.hospital.queuecaresystem.service.impl;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.dto.QueueStatsResponse;
import com.hospital.queuecaresystem.entity.*;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import com.hospital.queuecaresystem.exception.ResourceNotFoundException;
import com.hospital.queuecaresystem.exception.InvalidOperationException;
import com.hospital.queuecaresystem.repository.DoctorQueueRepository;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.repository.AppointmentRepository;
import com.hospital.queuecaresystem.service.DoctorQueueService;
import com.hospital.queuecaresystem.websocket.dto.PatientNotificationMessage;
import com.hospital.queuecaresystem.websocket.dto.QueueUpdateMessage;
import com.hospital.queuecaresystem.websocket.service.QueueWebSocketService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of doctor queue management service
 * Handles FIFO queue operations with proper state transitions
 */
@Service
@AllArgsConstructor
@Slf4j
public class DoctorQueueServiceImpl implements DoctorQueueService {

    private final DoctorQueueRepository doctorQueueRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueWebSocketService queueWebSocketService;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorQueueResponse> getTodayQueue(Long doctorId) {
        log.info("Fetching today's queue for doctor: {}", doctorId);
        
        // Verify doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        LocalDate today = LocalDate.now();
        List<DoctorQueue> queueItems = doctorQueueRepository.getTodayQueueForDoctor(doctorId, today);
        
        log.info("Found {} queue items for doctor {} on {}", 
                 queueItems.size(), doctorId, today);
        return queueItems.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorQueueResponse> getTodayQueue(Long doctorId, Pageable pageable) {
        log.info("Fetching today's queue for doctor: {} with pagination: page={}, size={}", 
                 doctorId, pageable.getPageNumber(), pageable.getPageSize());
        
        // Verify doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        LocalDate today = LocalDate.now();
        Page<DoctorQueue> queueItems = doctorQueueRepository.getTodayQueueForDoctorPaginated(doctorId, today, pageable);
        
        log.info("Found {} queue items for doctor {} on {} (total: {})", 
                 queueItems.getContent().size(), doctorId, today, queueItems.getTotalElements());
        return queueItems.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorQueueResponse> getQueueByDate(Long doctorId, LocalDate date) {
        log.info("Fetching queue for doctor: {} on date: {}", doctorId, date);
        
        // Verify doctor exists
        doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        List<DoctorQueue> queueItems = doctorQueueRepository.getTodayQueueForDoctor(doctorId, date);
        
        log.info("Found {} queue items for doctor {} on {}", 
                 queueItems.size(), doctorId, date);
        return queueItems.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorQueueResponse> getQueueByDate(Long doctorId, LocalDate date, Pageable pageable) {
        log.info("Fetching queue for doctor: {} on date: {} with pagination: page={}, size={}", 
                 doctorId, date, pageable.getPageNumber(), pageable.getPageSize());
        
        // Verify doctor exists
        doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        Page<DoctorQueue> queueItems = doctorQueueRepository.getTodayQueueForDoctorPaginated(doctorId, date, pageable);
        
        log.info("Found {} queue items for doctor {} on {} (total: {})", 
                 queueItems.getContent().size(), doctorId, date, queueItems.getTotalElements());
        return queueItems.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public DoctorQueueResponse callNextPatient(Long doctorId) {
        log.info("Calling next patient for doctor: {}", doctorId);
        
        LocalDate today = LocalDate.now();
        
        // Verify doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        // Check if doctor already has a patient in progress
        var currentInProgress = doctorQueueRepository.getCurrentInProgressQueue(doctorId, today);
        if (currentInProgress.isPresent()) {
            log.warn("Doctor {} already has a patient in progress", doctorId);
            throw new InvalidOperationException(
                "Doctor already has a patient in consultation. Complete or mark as missed first.");
        }
        
        // Get next waiting patient in FIFO order
        DoctorQueue nextQueue = doctorQueueRepository.findFirstByDoctorIdAndQueueDateAndStatusOrderByQueuePositionAsc(doctorId, today, QueueStatus.WAITING)
            .orElseThrow(() -> new ResourceNotFoundException("No waiting patients in queue for doctor: " + doctorId));
        
        // Transition to IN_PROGRESS
        nextQueue.setStatus(QueueStatus.IN_PROGRESS);
        nextQueue.setCalledAt(LocalDateTime.now());
        DoctorQueue updated = doctorQueueRepository.save(nextQueue);
        
        log.info("Called next patient. Queue ID: {}, Patient: {}", 
                 updated.getId(), updated.getAppointment().getPatient().getFirstName());
        
        DoctorQueueResponse response = mapToResponse(updated);
        
        // Broadcast queue update to all clients
        List<DoctorQueueResponse> updatedQueue = getTodayQueue(doctorId);
        queueWebSocketService.broadcastQueueUpdate(
            doctorId,
            updatedQueue,
            QueueUpdateMessage.QueueUpdateType.CALL,
            updated.getAppointment().getPatient().getId()
        );
        
        // Notify patient that they've been called
        queueWebSocketService.notifyPatientCalled(
            updated.getAppointment().getPatient().getId(),
            updated.getId(),
            doctorId,
            doctor.getName()
        );
        
        // 🆕 CRITICAL FIX: Auto-trigger TURN_NEAR notification for next waiting patients (position <= 2)
        updatedQueue.forEach(queueItem -> {
            if (queueItem.getQueuePosition() <= 2 && 
                queueItem.getStatus() == QueueStatus.WAITING &&
                !queueItem.getPatientId().equals(updated.getAppointment().getPatient().getId())) {
                
                log.info("Notifying patient {} - Turn is near (position: {})", 
                         queueItem.getPatientId(), queueItem.getQueuePosition());
                
                queueWebSocketService.notifyPatientTurnNear(
                    queueItem.getPatientId(),
                    queueItem.getId(),
                    doctorId,
                    doctor.getName(),
                    queueItem.getQueuePosition(),
                    queueItem.getPatientsAhead(),
                    queueItem.getEstimatedWaitTimeMinutes()
                );
            }
        });
        
        return response;
    }

    @Override
    @Transactional
    public DoctorQueueResponse updateQueueStatus(Long queueId, QueueStatus newStatus) {
        log.info("Updating queue status for queue ID: {} to status: {}", queueId, newStatus);
        
        DoctorQueue queue = doctorQueueRepository.findById(queueId)
            .orElseThrow(() -> new ResourceNotFoundException("Queue not found with id: " + queueId));
        
        QueueStatus currentStatus = queue.getStatus();
        
        // Validate state transition
        if (!isValidStateTransition(currentStatus, newStatus)) {
            log.warn("Invalid state transition from {} to {} for queue ID: {}", 
                     currentStatus, newStatus, queueId);
            throw new InvalidOperationException(
                String.format("Invalid state transition from %s to %s", currentStatus, newStatus));
        }
        
        // Update status and timestamps
        queue.setStatus(newStatus);
        
        switch (newStatus) {
            case IN_PROGRESS:
                queue.setCalledAt(LocalDateTime.now());
                log.debug("Patient called at: {}", queue.getCalledAt());
                break;
            case DONE:
                queue.setCompletedAt(LocalDateTime.now());
                log.debug("Consultation completed at: {}", queue.getCompletedAt());
                break;
            case MISSED:
                queue.setMissedAt(LocalDateTime.now());
                log.debug("Patient marked as missed at: {}", queue.getMissedAt());
                break;
            default:
                break;
        }
        
        DoctorQueue updated = doctorQueueRepository.save(queue);
        log.info("Queue status updated successfully. New status: {}", newStatus);
        
        DoctorQueueResponse response = mapToResponse(updated);
        
        // Determine notification type and broadcast update
        Patient patient = updated.getAppointment().getPatient();
        Doctor doctor = updated.getDoctor();
        
        switch (newStatus) {
            case DONE:
                // Broadcast completion
                List<DoctorQueueResponse> completedQueue = getQueueByDate(doctor.getId(), updated.getQueueDate());
                queueWebSocketService.broadcastQueueUpdate(
                    doctor.getId(),
                    completedQueue,
                    QueueUpdateMessage.QueueUpdateType.COMPLETE,
                    patient.getId()
                );
                break;
                
            case MISSED:
                // Broadcast missed notification
                List<DoctorQueueResponse> missedQueue = getQueueByDate(doctor.getId(), updated.getQueueDate());
                queueWebSocketService.broadcastQueueUpdate(
                    doctor.getId(),
                    missedQueue,
                    QueueUpdateMessage.QueueUpdateType.MISS,
                    patient.getId()
                );
                // Notify patient
                queueWebSocketService.notifyPatientRemoved(
                    patient.getId(),
                    doctor.getId(),
                    doctor.getName(),
                    PatientNotificationMessage.NotificationType.MISSED
                );
                break;
                
            default:
                break;
        }
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public QueueStatsResponse getQueueStats(Long doctorId) {
        return getQueueStatsByDate(doctorId, LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public QueueStatsResponse getQueueStatsByDate(Long doctorId, LocalDate date) {
        log.info("Fetching queue statistics for doctor: {} on date: {}", doctorId, date);
        
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        long waitingCount = doctorQueueRepository.countByDoctorAndStatusAndDate(
            doctorId, QueueStatus.WAITING, date);
        long inProgressCount = doctorQueueRepository.countByDoctorAndStatusAndDate(
            doctorId, QueueStatus.IN_PROGRESS, date);
        long completedCount = doctorQueueRepository.countByDoctorAndStatusAndDate(
            doctorId, QueueStatus.DONE, date);
        long missedCount = doctorQueueRepository.countByDoctorAndStatusAndDate(
            doctorId, QueueStatus.MISSED, date);
        
        long totalPatients = waitingCount + inProgressCount + completedCount + missedCount;
        
        long avgConsultationMinutes = calculateAverageConsultationTime(doctorId, date);
        
        QueueStatsResponse stats = new QueueStatsResponse();
        stats.setDoctorId(doctorId);
        stats.setDoctorName(doctor.getName());
        stats.setDate(date);
        stats.setTotalPatients(totalPatients);
        stats.setWaitingCount(waitingCount);
        stats.setInProgressCount(inProgressCount);
        stats.setCompletedCount(completedCount);
        stats.setMissedCount(missedCount);
        stats.setAverageConsultationMinutes(avgConsultationMinutes);
        
        log.info("Queue stats - Total: {}, Waiting: {}, InProgress: {}, Done: {}, Missed: {}", 
                 totalPatients, waitingCount, inProgressCount, completedCount, missedCount);
        
        return stats;
    }

    @Override
    @Transactional
    public void addPatientToQueue(Long appointmentId) {
        log.info("Adding patient to queue for appointment: {}", appointmentId);
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        // Check if already in queue
        if (doctorQueueRepository.findByAppointmentId(appointmentId).isPresent()) {
            log.warn("Appointment {} already exists in queue", appointmentId);
            return;
        }
        
        LocalDate queueDate = appointment.getAppointmentDate().toLocalDate();
        Doctor doctor = appointment.getDoctor();
        
        // Get next queue position
        List<DoctorQueue> todayQueue = doctorQueueRepository.getTodayQueueForDoctor(
            doctor.getId(), queueDate);
        Integer nextPosition = todayQueue.isEmpty() ? 1 : 
            todayQueue.stream().mapToInt(DoctorQueue::getQueuePosition).max().orElse(0) + 1;
        
        // Create new queue entry
        DoctorQueue queueEntry = new DoctorQueue();
        queueEntry.setDoctor(doctor);
        queueEntry.setAppointment(appointment);
        queueEntry.setQueueDate(queueDate);
        queueEntry.setQueuePosition(nextPosition);
        queueEntry.setStatus(QueueStatus.WAITING);
        
        DoctorQueue savedEntry = doctorQueueRepository.save(queueEntry);
        log.info("Patient added to queue at position: {} for doctor: {}", nextPosition, doctor.getId());
        
        // Broadcast queue update to all clients
        List<DoctorQueueResponse> updatedQueue = getQueueByDate(doctor.getId(), queueDate);
        queueWebSocketService.broadcastQueueUpdate(
            doctor.getId(),
            updatedQueue,
            QueueUpdateMessage.QueueUpdateType.ADD,
            appointment.getPatient().getId()
        );
        
        // Notify patient about their appointment confirmation
        DoctorQueueResponse patientQueueInfo = mapToResponse(savedEntry);
        queueWebSocketService.notifyPatient(
            appointment.getPatient().getId(),
            savedEntry.getId(),
            doctor.getId(),
            doctor.getName(),
            PatientNotificationMessage.NotificationType.APPOINTMENT_START,
            patientQueueInfo.getQueuePosition(),
            patientQueueInfo.getPatientsAhead(),
            patientQueueInfo.getEstimatedWaitTimeMinutes(),
            "Your appointment has been confirmed. You are at position " + nextPosition + " in the queue."
        );
    }

    @Override
    @Transactional
    public void removePatientFromQueue(Long appointmentId) {
        log.info("Removing patient from queue for appointment: {}", appointmentId);
        
        DoctorQueue queue = doctorQueueRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found for appointment: " + appointmentId));
        
        Doctor doctor = queue.getDoctor();
        Patient patient = queue.getAppointment().getPatient();
        LocalDate queueDate = queue.getQueueDate();
        
        doctorQueueRepository.delete(queue);
        log.info("Patient removed from queue. Queue ID: {}", queue.getId());
        
        // Broadcast queue update
        List<DoctorQueueResponse> updatedQueue = getQueueByDate(doctor.getId(), queueDate);
        queueWebSocketService.broadcastQueueUpdate(
            doctor.getId(),
            updatedQueue,
            QueueUpdateMessage.QueueUpdateType.REMOVE,
            patient.getId()
        );
        
        // Notify patient about cancellation
        queueWebSocketService.notifyPatientRemoved(
            patient.getId(),
            doctor.getId(),
            doctor.getName(),
            PatientNotificationMessage.NotificationType.CANCELLED
        );
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorQueueResponse getCurrentConsultation(Long doctorId) {
        log.info("Fetching current consultation for doctor: {}", doctorId);
        
        doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        LocalDate today = LocalDate.now();
        var currentQueue = doctorQueueRepository.getCurrentInProgressQueue(doctorId, today);
        
        return currentQueue.map(this::mapToResponse).orElse(null);
    }

    @Override
    public boolean isValidStateTransition(QueueStatus currentStatus, QueueStatus newStatus) {
        // No transition to same status
        if (currentStatus == newStatus) {
            return false;
        }
        
        return switch (currentStatus) {
            case WAITING -> newStatus == QueueStatus.IN_PROGRESS || newStatus == QueueStatus.MISSED;
            case IN_PROGRESS -> newStatus == QueueStatus.DONE || newStatus == QueueStatus.MISSED;
            case DONE, MISSED -> false; // Terminal states
        };
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorQueueResponse getQueueTrackingInfo(Long queueId) {
        log.info("Fetching queue tracking info for queue ID: {}", queueId);
        
        DoctorQueue queue = doctorQueueRepository.findById(queueId)
            .orElseThrow(() -> new ResourceNotFoundException("Queue not found with id: " + queueId));
        
        DoctorQueueResponse response = mapToResponse(queue);
        log.info("Queue tracking - Position: {}, Patients ahead: {}, Est. wait time: {} mins",
                 response.getQueuePosition(), response.getPatientsAhead(), response.getEstimatedWaitTimeMinutes());
        
        return response;
    }

    /**
     * Map DoctorQueue entity to response DTO with calculated tracking fields
     */
    private DoctorQueueResponse mapToResponse(DoctorQueue queue) {
        Appointment appointment = queue.getAppointment();
        Patient patient = appointment.getPatient();
        Doctor doctor = queue.getDoctor();
        
        // Calculate queue tracking metrics
        Integer patientsAhead = calculatePatientsAhead(queue);
        long avgConsultationMinutes = calculateAverageConsultationTime(doctor.getId(), queue.getQueueDate());
        Long estimatedWaitTime = calculateEstimatedWaitTime(patientsAhead, avgConsultationMinutes);
        
        DoctorQueueResponse response = new DoctorQueueResponse();
        response.setId(queue.getId());
        response.setDoctorId(doctor.getId());
        response.setDoctorName(doctor.getName());
        response.setAppointmentId(appointment.getId());
        response.setPatientId(patient.getId());
        response.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        response.setPatientPhone(patient.getPhoneNumber());
        response.setQueueDate(queue.getQueueDate());
        response.setQueuePosition(queue.getQueuePosition());
        response.setPatientsAhead(patientsAhead);
        response.setEstimatedWaitTimeMinutes(estimatedWaitTime);
        response.setStatus(queue.getStatus());
        response.setCalledAt(queue.getCalledAt());
        response.setCompletedAt(queue.getCompletedAt());
        response.setMissedAt(queue.getMissedAt());
        response.setCreatedAt(queue.getCreatedAt());
        response.setUpdatedAt(queue.getUpdatedAt());
        
        return response;
    }

    /**
     * Calculate number of patients ahead in the queue
     * Formula: patientsAhead = queuePosition - 1 (for patients still waiting)
     */
    private Integer calculatePatientsAhead(DoctorQueue queue) {
        int position = queue.getQueuePosition();
        // Patients ahead = position - 1, minimum 0
        return Math.max(0, position - 1);
    }

    /**
     * Calculate estimated wait time in minutes
     * Formula: estimatedWaitTime = patientsAhead × avgConsultationTime
     */
    private Long calculateEstimatedWaitTime(Integer patientsAhead, long avgConsultationMinutes) {
        if (patientsAhead == null || avgConsultationMinutes <= 0) {
            return 0L;
        }
        return (long) patientsAhead * avgConsultationMinutes;
    }

    /**
     * Calculate average consultation time in minutes
     */
    private long calculateAverageConsultationTime(Long doctorId, LocalDate date) {
        List<DoctorQueue> completedQueue = doctorQueueRepository.findByDoctorIdAndStatusAndQueueDate(
            doctorId, QueueStatus.DONE, date);
        
        if (completedQueue.isEmpty()) {
            return 0;
        }
        
        long totalMinutes = completedQueue.stream()
            .filter(q -> q.getCalledAt() != null && q.getCompletedAt() != null)
            .mapToLong(q -> java.time.temporal.ChronoUnit.MINUTES.between(q.getCalledAt(), q.getCompletedAt()))
            .sum();
        
        return totalMinutes / completedQueue.size();
    }
}
