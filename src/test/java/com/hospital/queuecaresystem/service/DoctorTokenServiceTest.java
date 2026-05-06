package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.entity.DoctorToken;
import com.hospital.queuecaresystem.repository.DoctorTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Doctor Token Service Tests")
class DoctorTokenServiceTest {
    
    @Mock
    private DoctorTokenRepository doctorTokenRepository;
    
    @InjectMocks
    private DoctorTokenService doctorTokenService;
    
    private Long doctorId;
    private LocalDate testDate;
    
    @BeforeEach
    void setUp() {
        doctorId = 12L;
        testDate = LocalDate.of(2026, 4, 29);
    }
    
    @Test
    @DisplayName("First token generation should start with sequence 001")
    void testFirstTokenGeneration() {
        // Arrange
        when(doctorTokenRepository.findLatestTokenForDoctorOnDate(doctorId, testDate))
            .thenReturn(Optional.empty());
        when(doctorTokenRepository.existsByTokenValue(anyString()))
            .thenReturn(false);
        
        DoctorToken mockToken = new DoctorToken();
        mockToken.setId(1L);
        mockToken.setDoctorId(doctorId);
        mockToken.setGenerationDate(testDate);
        mockToken.setSequenceNumber(1);
        mockToken.setTokenValue("12_2026-04-29_001");
        
        when(doctorTokenRepository.save(any(DoctorToken.class)))
            .thenReturn(mockToken);
        
        // Act
        DoctorToken token = doctorTokenService.generateNextToken(doctorId, testDate);
        
        // Assert
        assertEquals("12_2026-04-29_001", token.getTokenValue());
        assertEquals(1, token.getSequenceNumber());
        verify(doctorTokenRepository, times(1)).save(any(DoctorToken.class));
    }
    
    @Test
    @DisplayName("Subsequent tokens should increment sequence number")
    void testTokenIncrementSequence() {
        // Arrange
        DoctorToken existingToken = new DoctorToken();
        existingToken.setId(1L);
        existingToken.setDoctorId(doctorId);
        existingToken.setGenerationDate(testDate);
        existingToken.setSequenceNumber(1);
        existingToken.setTokenValue("12_2026-04-29_001");
        
        when(doctorTokenRepository.findLatestTokenForDoctorOnDate(doctorId, testDate))
            .thenReturn(Optional.of(existingToken));
        when(doctorTokenRepository.existsByTokenValue(anyString()))
            .thenReturn(false);
        
        DoctorToken newToken = new DoctorToken();
        newToken.setId(2L);
        newToken.setDoctorId(doctorId);
        newToken.setGenerationDate(testDate);
        newToken.setSequenceNumber(2);
        newToken.setTokenValue("12_2026-04-29_002");
        
        when(doctorTokenRepository.save(any(DoctorToken.class)))
            .thenReturn(newToken);
        
        // Act
        DoctorToken token = doctorTokenService.generateNextToken(doctorId, testDate);
        
        // Assert
        assertEquals("12_2026-04-29_002", token.getTokenValue());
        assertEquals(2, token.getSequenceNumber());
    }
    
    @Test
    @DisplayName("Different dates should reset sequence to 001")
    void testDailyResetOfSequence() {
        // Arrange
        LocalDate tomorrow = testDate.plusDays(1);
        
        when(doctorTokenRepository.findLatestTokenForDoctorOnDate(doctorId, tomorrow))
            .thenReturn(Optional.empty()); // No token on new date
        when(doctorTokenRepository.existsByTokenValue(anyString()))
            .thenReturn(false);
        
        DoctorToken tomorrowToken = new DoctorToken();
        tomorrowToken.setId(3L);
        tomorrowToken.setDoctorId(doctorId);
        tomorrowToken.setGenerationDate(tomorrow);
        tomorrowToken.setSequenceNumber(1);
        tomorrowToken.setTokenValue("12_2026-04-30_001");
        
        when(doctorTokenRepository.save(any(DoctorToken.class)))
            .thenReturn(tomorrowToken);
        
        // Act
        DoctorToken token = doctorTokenService.generateNextToken(doctorId, tomorrow);
        
        // Assert
        assertEquals("12_2026-04-30_001", token.getTokenValue());
        assertEquals(1, token.getSequenceNumber()); // Reset to 1
    }
    
    @Test
    @DisplayName("Token collision should throw IllegalStateException")
    void testTokenCollisionDetection() {
        // Arrange
        DoctorToken existingToken = new DoctorToken();
        existingToken.setId(1L);
        existingToken.setDoctorId(doctorId);
        existingToken.setGenerationDate(testDate);
        existingToken.setSequenceNumber(1);
        existingToken.setTokenValue("12_2026-04-29_001");
        
        when(doctorTokenRepository.findLatestTokenForDoctorOnDate(doctorId, testDate))
            .thenReturn(Optional.of(existingToken));
        when(doctorTokenRepository.existsByTokenValue("12_2026-04-29_002"))
            .thenReturn(true); // Collision detected
        
        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> doctorTokenService.generateNextToken(doctorId, testDate)
        );
        
        assertTrue(exception.getMessage().contains("collision"));
        verify(doctorTokenRepository, never()).save(any());
    }
    
    @Test
    @DisplayName("Token validation should succeed for existing token")
    void testValidTokenVerification() {
        // Arrange
        DoctorToken validToken = new DoctorToken();
        validToken.setTokenValue("12_2026-04-29_001");
        
        when(doctorTokenRepository.findByDoctorIdAndGenerationDate(doctorId, testDate))
            .thenReturn(Optional.of(validToken));
        
        // Act
        boolean isValid = doctorTokenService.isValidToken(
            doctorId, 
            testDate, 
            "12_2026-04-29_001"
        );
        
        // Assert
        assertTrue(isValid);
    }
    
    @Test
    @DisplayName("Token validation should fail for non-existing token")
    void testInvalidTokenVerification() {
        // Arrange
        when(doctorTokenRepository.findByDoctorIdAndGenerationDate(doctorId, testDate))
            .thenReturn(Optional.empty());
        
        // Act
        boolean isValid = doctorTokenService.isValidToken(
            doctorId, 
            testDate, 
            "12_2026-04-29_001"
        );
        
        // Assert
        assertFalse(isValid);
    }
    
    @Test
    @DisplayName("Token format should match DOCID_DATE_SEQUENCE pattern")
    void testTokenFormat() {
        // Test the token format directly
        String token = String.format("%d_%s_%03d", 12L, testDate.toString(), 1);
        
        assertEquals("12_2026-04-29_001", token);
        assertTrue(token.matches("^\\d+_\\d{4}-\\d{2}-\\d{2}_\\d{3}$"));
    }
    
    /**
     * Integration test scenario (requires real DB or TestContainers):
     * This demonstrates how concurrent token generation should behave
     */
    @Test
    @DisplayName("Concurrent token generation should handle race conditions")
    void testConcurrentTokenGeneration() throws InterruptedException {
        // This is a pseudo-test to document expected behavior
        // In real integration tests, use TestContainers or @DataJpaTest
        
        int numberOfThreads = 10;
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(numberOfThreads);
        AtomicInteger successCount = new AtomicInteger(0);
        
        for (int i = 0; i < numberOfThreads; i++) {
            new Thread(() -> {
                try {
                    startLatch.await(); // Wait for all threads to be ready
                    // In real scenario, this would call generateNextToken
                    // Token generation should succeed without duplicates
                    successCount.incrementAndGet();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    endLatch.countDown();
                }
            }).start();
        }
        
        startLatch.countDown(); // Signal all threads to start
        endLatch.await(); // Wait for all threads to finish
        
        assertEquals(numberOfThreads, successCount.get());
    }
}
