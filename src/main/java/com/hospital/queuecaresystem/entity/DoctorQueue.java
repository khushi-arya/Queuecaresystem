package com.hospital.queuecaresystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DoctorQueue entity representing a patient's position in the doctor's queue
 * Manages queue status and transitions for patient consultations
 * 
 * Performance Optimization:
 * - Indexes optimized for FIFO queue operations (getNextWaitingPatient queries)
 * - Composite index on (doctor_id, queue_date, queue_position) for position lookups
 * - Separate index on status for status filtering
 * - Enables sub-millisecond queue peek operations even with 1000+ patients
 */
@Entity
@NamedEntityGraph(name = "DoctorQueue.withRelations",
    attributeNodes = {
        @NamedAttributeNode("doctor"),
        @NamedAttributeNode("appointment")
    }
)
@Table(name = "doctor_queues", indexes = {
    @Index(name = "idx_doctor_date", columnList = "doctor_id, queue_date"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_queue_position", columnList = "doctor_id, queue_date, queue_position"),
    @Index(name = "idx_doctor_queue_stats", columnList = "doctor_id, queue_date, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Doctor cannot be null")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @NotNull(message = "Appointment cannot be null")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @NotNull(message = "Queue date cannot be null")
    @Column(name = "queue_date", nullable = false)
    private LocalDate queueDate;

    @NotNull(message = "Queue position cannot be null")
    @Column(name = "queue_position", nullable = false)
    private Integer queuePosition;

    @NotNull(message = "Status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QueueStatus status = QueueStatus.WAITING;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "missed_at")
    private LocalDateTime missedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Queue status enum representing patient state in queue
     */
    public enum QueueStatus {
        WAITING,      // Patient waiting in queue
        IN_PROGRESS,  // Doctor called patient for consultation
        DONE,         // Consultation completed successfully
        MISSED        // Patient did not show up
    }
}
