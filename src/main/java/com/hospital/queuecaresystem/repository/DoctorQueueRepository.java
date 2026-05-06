package com.hospital.queuecaresystem.repository;

import com.hospital.queuecaresystem.entity.DoctorQueue;
import com.hospital.queuecaresystem.entity.DoctorQueue.QueueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for DoctorQueue entity with FIFO queue operations
 *
 * Performance Optimization:
 * - Composite index on (doctor_id, queue_date, queue_position)
 * - EntityGraph prevents N+1 queries
 * - Pagination support for large queues
 */
@Repository
public interface DoctorQueueRepository extends JpaRepository<DoctorQueue, Long> {

    /**
     * Get today's queue for a doctor (FIFO order)
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    @Query("SELECT dq FROM DoctorQueue dq WHERE dq.doctor.id = :doctorId " +
           "AND dq.queueDate = :queueDate ORDER BY dq.queuePosition ASC")
    List<DoctorQueue> getTodayQueueForDoctor(@Param("doctorId") Long doctorId,
                                             @Param("queueDate") LocalDate queueDate);

    /**
     * Get today's queue with pagination
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    @Query("SELECT dq FROM DoctorQueue dq WHERE dq.doctor.id = :doctorId " +
           "AND dq.queueDate = :queueDate ORDER BY dq.queuePosition ASC")
    Page<DoctorQueue> getTodayQueueForDoctorPaginated(@Param("doctorId") Long doctorId,
                                                      @Param("queueDate") LocalDate queueDate,
                                                      Pageable pageable);

    /**
     * Get next waiting patient (FIFO)
     * Replaced JPQL LIMIT with Spring Data derived query
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    Optional<DoctorQueue> findFirstByDoctorIdAndQueueDateAndStatusOrderByQueuePositionAsc(
            Long doctorId,
            LocalDate queueDate,
            QueueStatus status
    );

    /**
     * Get queue items by status with pagination
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    Page<DoctorQueue> findByDoctorIdAndStatusAndQueueDate(
            Long doctorId,
            QueueStatus status,
            LocalDate queueDate,
            Pageable pageable
    );

    /**
     * Legacy method (avoid using)
     */
    @Deprecated(forRemoval = true)
    List<DoctorQueue> findByDoctorIdAndStatusAndQueueDate(
            Long doctorId,
            QueueStatus status,
            LocalDate queueDate
    );

    /**
     * Count patients by status
     */
    @Query("SELECT COUNT(dq) FROM DoctorQueue dq WHERE dq.doctor.id = :doctorId " +
           "AND dq.status = :status AND dq.queueDate = :queueDate")
    long countByDoctorAndStatusAndDate(@Param("doctorId") Long doctorId,
                                       @Param("status") QueueStatus status,
                                       @Param("queueDate") LocalDate queueDate);

    /**
     * Get current in-progress queue item
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    @Query("SELECT dq FROM DoctorQueue dq WHERE dq.doctor.id = :doctorId " +
           "AND dq.status = 'IN_PROGRESS' AND dq.queueDate = :queueDate")
    Optional<DoctorQueue> getCurrentInProgressQueue(@Param("doctorId") Long doctorId,
                                                    @Param("queueDate") LocalDate queueDate);

    /**
     * Get active queue (WAITING, IN_PROGRESS, DONE)
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    @Query("SELECT dq FROM DoctorQueue dq WHERE dq.doctor.id = :doctorId " +
           "AND dq.queueDate = :queueDate AND dq.status IN ('WAITING', 'IN_PROGRESS', 'DONE') " +
           "ORDER BY dq.queuePosition ASC")
    List<DoctorQueue> getActiveQueueForDate(@Param("doctorId") Long doctorId,
                                            @Param("queueDate") LocalDate queueDate);

    /**
     * Get active queue with pagination
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    @Query("SELECT dq FROM DoctorQueue dq WHERE dq.doctor.id = :doctorId " +
           "AND dq.queueDate = :queueDate AND dq.status IN ('WAITING', 'IN_PROGRESS', 'DONE') " +
           "ORDER BY dq.queuePosition ASC")
    Page<DoctorQueue> getActiveQueueForDatePaginated(@Param("doctorId") Long doctorId,
                                                     @Param("queueDate") LocalDate queueDate,
                                                     Pageable pageable);

    /**
     * Check if appointment exists in queue
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    Optional<DoctorQueue> findByAppointmentId(Long appointmentId);

    /**
     * Get queue stats for a date
     */
    @EntityGraph(attributePaths = {"doctor", "appointment"})
    @Query("SELECT dq FROM DoctorQueue dq WHERE dq.doctor.id = :doctorId " +
           "AND dq.queueDate = :queueDate ORDER BY dq.queuePosition ASC")
    List<DoctorQueue> getQueueStatsForDate(@Param("doctorId") Long doctorId,
                                           @Param("queueDate") LocalDate queueDate);
}