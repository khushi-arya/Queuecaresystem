package com.hospital.queuecaresystem.repository;

import com.hospital.queuecaresystem.entity.DoctorToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DoctorTokenRepository extends JpaRepository<DoctorToken, Long> {
    
    /**
     * Find the latest token for a doctor on a specific date with PESSIMISTIC_WRITE lock.
     * This prevents race conditions by acquiring a database-level write lock.
     * 
     * @param doctorId the doctor's ID
     * @param generationDate the date of token generation
     * @return Optional containing the latest token for this doctor on this date
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(value = "SELECT t FROM DoctorToken t " +
           "WHERE t.doctorId = :doctorId " +
           "AND t.generationDate = :generationDate " +
           "ORDER BY t.sequenceNumber DESC LIMIT 1")
    Optional<DoctorToken> findLatestTokenForDoctorOnDate(
        @Param("doctorId") Long doctorId,
        @Param("generationDate") LocalDate generationDate
    );
    
    /**
     * Alternative: Find by doctor and date (without lock, for read-only operations)
     */
    Optional<DoctorToken> findByDoctorIdAndGenerationDate(
        Long doctorId,
        LocalDate generationDate
    );
    
    /**
     * Check if token already exists (for duplicate prevention)
     */
    boolean existsByTokenValue(String tokenValue);
}
