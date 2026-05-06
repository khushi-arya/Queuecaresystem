package com.hospital.queuecaresystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_tokens", 
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"doctor_id", "generation_date"},
            name = "uk_doctor_date_token"
        )
    },
    indexes = {
        @Index(name = "idx_doctor_date", columnList = "doctor_id,generation_date"),
        @Index(name = "idx_token_value", columnList = "token_value")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;
    
    @Column(name = "generation_date", nullable = false)
    private LocalDate generationDate;
    
    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;
    
    @Column(name = "token_value", nullable = false, unique = true, length = 50)
    private String tokenValue;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Version
    private Long version;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
