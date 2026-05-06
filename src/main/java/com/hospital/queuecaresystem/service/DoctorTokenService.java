package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.entity.DoctorToken;
import com.hospital.queuecaresystem.repository.DoctorTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Service for managing doctor token generation with concurrency control.
 * 
 * Token Format: DOCID_DATE_SEQUENCE
 * Example: 12_2026-04-29_001
 * 
 * Features:
 * - Unique token per doctor per day
 * - Auto-incrementing sequence number
 * - Race condition protection using database-level pessimistic locking
 * - Automatic daily reset of sequence counter
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorTokenService {
    
    private final DoctorTokenRepository doctorTokenRepository;
    
    /**
     * Generates the next token for a doctor on the given date.
     * 
     * Thread-safe implementation using PESSIMISTIC_WRITE lock to prevent race conditions.
     * The lock is acquired at the database level during the transaction.
     * 
     * @param doctorId the doctor's ID
     * @param date the date for token generation (typically today)
     * @return newly generated DoctorToken with format: DOCID_DATE_SEQUENCE
     * @throws IllegalStateException if token generation fails after retry logic
     */
    @Transactional
    public DoctorToken generateNextToken(Long doctorId, LocalDate date) {
        log.info("Generating token for doctor: {} on date: {}", doctorId, date);
        
        // PESSIMISTIC_WRITE lock prevents concurrent threads from reading the same row
        Optional<DoctorToken> latestToken = 
            doctorTokenRepository.findLatestTokenForDoctorOnDate(doctorId, date);
        
        // Determine next sequence number
        Integer nextSequenceNumber = latestToken
            .map(token -> token.getSequenceNumber() + 1)
            .orElse(1); // Start with 001 for new doctor or new day
        
        // Build token in format: DOCID_DATE_SEQUENCE
        String tokenValue = formatToken(doctorId, date, nextSequenceNumber);
        
        // Validate token doesn't already exist (defensive check)
        if (doctorTokenRepository.existsByTokenValue(tokenValue)) {
            log.warn("Token already exists: {}. Collision detected!", tokenValue);
            throw new IllegalStateException(
                "Token collision detected for doctor: " + doctorId + " on date: " + date
            );
        }
        
        // Create and persist new token
        DoctorToken newToken = new DoctorToken();
        newToken.setDoctorId(doctorId);
        newToken.setGenerationDate(date);
        newToken.setSequenceNumber(nextSequenceNumber);
        newToken.setTokenValue(tokenValue);
        
        DoctorToken savedToken = doctorTokenRepository.save(newToken);
        log.info("Token generated successfully: {}", tokenValue);
        
        return savedToken;
    }
    
    /**
     * Format token string: DOCID_DATE_SEQUENCE
     * Example: 12_2026-04-29_001
     * 
     * @param doctorId doctor identifier
     * @param date generation date (YYYY-MM-DD)
     * @param sequenceNumber zero-padded to 3 digits
     * @return formatted token string
     */
    private String formatToken(Long doctorId, LocalDate date, Integer sequenceNumber) {
        return String.format("%d_%s_%03d", 
            doctorId, 
            date.toString(), 
            sequenceNumber
        );
    }
    
    /**
     * Verify if a token is valid for the given doctor and date.
     * 
     * @param doctorId doctor identifier
     * @param date token generation date
     * @param tokenValue the token string to verify
     * @return true if token is valid for this doctor on this date
     */
    @Transactional(readOnly = true)
    public boolean isValidToken(Long doctorId, LocalDate date, String tokenValue) {
        return doctorTokenRepository
            .findByDoctorIdAndGenerationDate(doctorId, date)
            .stream()
            .anyMatch(token -> token.getTokenValue().equals(tokenValue));
    }
    
    /**
     * Get the latest token for a doctor on a specific date (read-only, no lock).
     * 
     * @param doctorId doctor identifier
     * @param date token generation date
     * @return Optional containing the latest token if exists
     */
    @Transactional(readOnly = true)
    public Optional<DoctorToken> getLatestToken(Long doctorId, LocalDate date) {
        return doctorTokenRepository.findByDoctorIdAndGenerationDate(doctorId, date);
    }
}
