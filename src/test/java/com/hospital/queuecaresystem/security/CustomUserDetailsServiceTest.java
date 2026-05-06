package com.hospital.queuecaresystem.security;

import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomUserDetailsService Unit Tests")
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("patient@test.com");
        testUser.setPassword("hashedPassword");
        testUser.setRole(Role.PATIENT);
    }

    @Test
    @DisplayName("Should load user by email successfully")
    void testLoadUserByUsername() {
        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("patient@test.com");

        assertNotNull(userDetails);
        assertEquals("patient@test.com", userDetails.getUsername());
        verify(userRepository, times(1)).findByEmail("patient@test.com");
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException for non-existent user")
    void testLoadUserByUsernameNotFound() {
        when(userRepository.findByEmail("notfound@test.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, 
                () -> customUserDetailsService.loadUserByUsername("notfound@test.com"));
        
        verify(userRepository, times(1)).findByEmail("notfound@test.com");
    }

    @Test
    @DisplayName("Should return CustomUserDetails with correct role")
    void testLoadUserWithCorrectRole() {
        testUser.setRole(Role.DOCTOR);
        when(userRepository.findByEmail("doctor@test.com")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("doctor@test.com");

        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_DOCTOR")));
        verify(userRepository, times(1)).findByEmail("doctor@test.com");
    }

    @Test
    @DisplayName("Should return CustomUserDetails with correct user ID")
    void testLoadUserWithCorrectId() {
        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("patient@test.com");
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;

        assertEquals(1L, customUserDetails.getId());
        verify(userRepository, times(1)).findByEmail("patient@test.com");
    }

    @Test
    @DisplayName("Should handle multiple user loads")
    void testMultipleUserLoads() {
        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(testUser));

        UserDetails userDetails1 = customUserDetailsService.loadUserByUsername("patient@test.com");
        UserDetails userDetails2 = customUserDetailsService.loadUserByUsername("patient@test.com");

        assertNotNull(userDetails1);
        assertNotNull(userDetails2);
        verify(userRepository, times(2)).findByEmail("patient@test.com");
    }

    @Test
    @DisplayName("Should load admin user successfully")
    void testLoadAdminUser() {
        testUser.setRole(Role.ADMIN);
        testUser.setEmail("admin@test.com");
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("admin@test.com");

        assertNotNull(userDetails);
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
        verify(userRepository, times(1)).findByEmail("admin@test.com");
    }
}
