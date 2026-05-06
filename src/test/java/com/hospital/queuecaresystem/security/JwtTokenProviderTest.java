package com.hospital.queuecaresystem.security;

import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("JwtTokenProvider Unit Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", 
                "QueueCareSecretKeyForJWTTokenGenerationAndValidationWithMinimumLengthOfThirtyTwoCharactersForHS256Algorithm");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 86400000L);
        jwtTokenProvider.init();

        // Create mock user details
        User testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@email.com");
        testUser.setPassword("hashedPassword");
        testUser.setRole(Role.PATIENT);
        userDetails = new CustomUserDetails(testUser);
    }

    @Test
    @DisplayName("Should generate valid JWT token")
    void testGenerateToken() {
        String token = jwtTokenProvider.generateToken(userDetails);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.contains("."));
    }

    @Test
    @DisplayName("Should extract email from token")
    void testGetEmailFromToken() {
        String token = jwtTokenProvider.generateToken(userDetails);
        String email = jwtTokenProvider.getEmailFromToken(token);
        
        assertEquals("test@email.com", email);
    }

    @Test
    @DisplayName("Should extract userId from token")
    void testGetUserIdFromToken() {
        String token = jwtTokenProvider.generateToken(userDetails);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        
        assertEquals(1L, userId);
    }

    @Test
    @DisplayName("Should extract role from token")
    void testGetRoleFromToken() {
        String token = jwtTokenProvider.generateToken(userDetails);
        String role = jwtTokenProvider.getRoleFromToken(token);
        
        assertEquals("ROLE_PATIENT", role);
    }

    @Test
    @DisplayName("Should validate correct token")
    void testValidateToken() {
        String token = jwtTokenProvider.generateToken(userDetails);
        boolean isValid = jwtTokenProvider.validateToken(token);
        
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Should reject invalid token")
    void testValidateInvalidToken() {
        String invalidToken = "invalid.token.here";
        boolean isValid = jwtTokenProvider.validateToken(invalidToken);
        
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject malformed token")
    void testValidateMalformedToken() {
        String malformedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
        boolean isValid = jwtTokenProvider.validateToken(malformedToken);
        
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should handle expired token gracefully")
    void testExpiredToken() {
        // Set expiration to past
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", -1000L);
        jwtTokenProvider.init();
        
        String token = jwtTokenProvider.generateToken(userDetails);
        boolean isValid = jwtTokenProvider.validateToken(token);
        
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should generate different tokens for each call")
    void testGenerateDifferentTokens() {
        String token1 = jwtTokenProvider.generateToken(userDetails);
        String token2 = jwtTokenProvider.generateToken(userDetails);
        
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("Should extract claims correctly")
    void testExtractMultipleClaims() {
        String token = jwtTokenProvider.generateToken(userDetails);
        
        assertEquals("test@email.com", jwtTokenProvider.getEmailFromToken(token));
        assertEquals(1L, jwtTokenProvider.getUserIdFromToken(token));
        assertEquals("ROLE_PATIENT", jwtTokenProvider.getRoleFromToken(token));
    }
}
