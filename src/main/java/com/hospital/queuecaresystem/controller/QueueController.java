package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.DoctorQueueResponse;
import com.hospital.queuecaresystem.dto.QueueStatsResponse;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import com.hospital.queuecaresystem.service.DoctorQueueService;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


/**
 * REST Controller for Doctor Queue Management
 * Handles queue operations: FIFO patient calling, status transitions, queue viewing
 */
@RestController
@RequestMapping("/api/queue")
@AllArgsConstructor
@Slf4j
public class QueueController {

    private final DoctorQueueService doctorQueueService;

    /**
     * Get today's queue for the current doctor with pagination
     * GET /api/queue/today?page=0&size=20&sort=queuePosition,asc
     * Shows all patients in queue with their current status
     * 
     * @param doctorId Doctor ID
     * @param pageable Pagination parameters
     * @return Page of queue items for today
     */
    @GetMapping("/today")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Page<DoctorQueueResponse>> getTodayQueue(
            @RequestParam Long doctorId,
            @ParameterObject Pageable pageable) {
        log.info("Fetching today's queue for doctor: {} with pagination", doctorId);
        Page<DoctorQueueResponse> queue = doctorQueueService.getTodayQueue(doctorId, pageable);
        return ResponseEntity.ok(queue);
    }

    /**
     * Get queue for a specific date with pagination
     * GET /api/queue/date?doctorId=1&date=2026-05-05&page=0&size=20&sort=queuePosition,asc
     * 
     * @param doctorId Doctor ID
     * @param date Queue date
     * @param pageable Pagination parameters
     * @return Page of queue items for the specified date
     */
    @GetMapping("/date")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Page<DoctorQueueResponse>> getQueueByDate(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @ParameterObject Pageable pageable) {
        log.info("Fetching queue for doctor: {} on date: {} with pagination", doctorId, date);
        Page<DoctorQueueResponse> queue = doctorQueueService.getQueueByDate(doctorId, date, pageable);
        return ResponseEntity.ok(queue);
    }

    /**
     * Call next patient in FIFO order
     * POST /api/queue/next
     * Transitions the next waiting patient to IN_PROGRESS status
     * Only one patient can be in progress at a time
     * 
     * @param doctorId Doctor ID
     * @return Queue item of the called patient
     */
    @PostMapping("/next")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorQueueResponse> callNextPatient(
            @RequestParam Long doctorId) {
        log.info("Doctor {} calling next patient", doctorId);
        DoctorQueueResponse nextPatient = doctorQueueService.callNextPatient(doctorId);
        return ResponseEntity.ok(nextPatient);
    }

    /**
     * Get current patient in consultation
     * GET /api/queue/current
     * 
     * @param doctorId Doctor ID
     * @return Current patient in consultation or null if none
     */
    @GetMapping("/current")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorQueueResponse> getCurrentConsultation(
            @RequestParam Long doctorId) {
        log.info("Fetching current consultation for doctor: {}", doctorId);
        DoctorQueueResponse current = doctorQueueService.getCurrentConsultation(doctorId);
        return ResponseEntity.ok(current);
    }

    /**
     * Update queue item status
     * PUT /api/queue/{queueId}/status
     * 
     * Valid state transitions:
     * - WAITING → IN_PROGRESS (doctor calls patient)
     * - IN_PROGRESS → DONE (consultation completed)
     * - IN_PROGRESS → MISSED (patient no-show)
     * - WAITING → MISSED (cancel from queue)
     * 
     * @param queueId Queue item ID
     * @param status New status
     * @return Updated queue response
     */
    @PutMapping("/{queueId}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorQueueResponse> updateQueueStatus(
            @PathVariable Long queueId,
            @RequestParam @NotNull(message = "Status is required") QueueStatus status) {
        log.info("Updating queue {} status to: {}", queueId, status);
        DoctorQueueResponse updated = doctorQueueService.updateQueueStatus(queueId, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get queue statistics for today
     * GET /api/queue/stats
     * Shows queue metrics: waiting count, in-progress, completed, missed, average consultation time
     * 
     * @param doctorId Doctor ID
     * @return Queue statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<QueueStatsResponse> getQueueStats(
            @RequestParam Long doctorId) {
        log.info("Fetching queue statistics for doctor: {}", doctorId);
        QueueStatsResponse stats = doctorQueueService.getQueueStats(doctorId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get queue statistics for a specific date
     * GET /api/queue/stats/date
     * 
     * @param doctorId Doctor ID
     * @param date Statistics date
     * @return Queue statistics
     */
    @GetMapping("/stats/date")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<QueueStatsResponse> getQueueStatsByDate(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching queue statistics for doctor: {} on date: {}", doctorId, date);
        QueueStatsResponse stats = doctorQueueService.getQueueStatsByDate(doctorId, date);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get queue tracking information for a patient
     * GET /api/queue/tracking/{queueId}
     * Returns queue position, patients ahead, and estimated wait time
     * 
     * @param queueId Queue ID
     * @return Queue tracking information with metrics
     */
    @GetMapping("/tracking/{queueId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<DoctorQueueResponse> getQueueTrackingInfo(
            @PathVariable Long queueId) {
        log.info("Fetching queue tracking info for queue: {}", queueId);
        DoctorQueueResponse tracking = doctorQueueService.getQueueTrackingInfo(queueId);
        return ResponseEntity.ok(tracking);
    }
}
