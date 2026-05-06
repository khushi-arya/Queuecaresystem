package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.dto.QueueStatsResponse;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

/**
 * Service interface for doctor queue management
 * Handles FIFO queue operations and state transitions
 */
public interface DoctorQueueService {

    /**
     * Get today's queue for a doctor without pagination
     * @param doctorId Doctor ID
     * @return List of queue items ordered by position
     */
    List<DoctorQueueResponse> getTodayQueue(Long doctorId);

    /**
     * Get today's queue for a doctor with pagination
     * @param doctorId Doctor ID
     * @param pageable Pagination parameters
     * @return Page of queue items ordered by position
     */
    Page<DoctorQueueResponse> getTodayQueue(Long doctorId, Pageable pageable);

    /**
     * Get queue for a specific date without pagination
     * @param doctorId Doctor ID
     * @param date Queue date
     * @return List of queue items
     */
    List<DoctorQueueResponse> getQueueByDate(Long doctorId, LocalDate date);

    /**
     * Get queue for a specific date with pagination
     * @param doctorId Doctor ID
     * @param date Queue date
     * @param pageable Pagination parameters
     * @return Page of queue items
     */
    Page<DoctorQueueResponse> getQueueByDate(Long doctorId, LocalDate date, Pageable pageable);

    /**
     * Call next patient in FIFO order
     * Transitions WAITING -> IN_PROGRESS
     * @param doctorId Doctor ID
     * @return Next patient queue response
     */
    DoctorQueueResponse callNextPatient(Long doctorId);

    /**
     * Update queue status with state transition validation
     * Valid transitions:
     * - WAITING -> IN_PROGRESS (doctor calls patient)
     * - IN_PROGRESS -> DONE (consultation completed)
     * - IN_PROGRESS -> MISSED (patient no-show)
     * - WAITING -> MISSED (cancel from queue)
     * @param queueId Queue ID
     * @param newStatus New status
     * @return Updated queue response
     */
    DoctorQueueResponse updateQueueStatus(Long queueId, QueueStatus newStatus);

    /**
     * Get queue statistics for a doctor on today
     * @param doctorId Doctor ID
     * @return Queue statistics
     */
    QueueStatsResponse getQueueStats(Long doctorId);

    /**
     * Get queue statistics for specific date
     * @param doctorId Doctor ID
     * @param date Date
     * @return Queue statistics
     */
    QueueStatsResponse getQueueStatsByDate(Long doctorId, LocalDate date);

    /**
     * Add patient to queue after appointment booking
     * @param appointmentId Appointment ID
     */
    void addPatientToQueue(Long appointmentId);

    /**
     * Remove patient from queue
     * @param appointmentId Appointment ID
     */
    void removePatientFromQueue(Long appointmentId);

    /**
     * Get current in-progress appointment for doctor
     * @param doctorId Doctor ID
     * @return Current consultation or null
     */
    DoctorQueueResponse getCurrentConsultation(Long doctorId);

    /**
     * Validate state transition
     * @param currentStatus Current status
     * @param newStatus Target status
     * @return true if transition is valid
     */
    boolean isValidStateTransition(QueueStatus currentStatus, QueueStatus newStatus);

    /**
     * Get detailed queue tracking information for a patient
     * Includes queue position, patients ahead, and estimated wait time
     * @param queueId Queue ID
     * @return Queue tracking information
     */
    DoctorQueueResponse getQueueTrackingInfo(Long queueId);
}
