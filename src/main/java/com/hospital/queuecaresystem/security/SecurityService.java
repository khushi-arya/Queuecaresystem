package com.hospital.queuecaresystem.security;

import com.hospital.queuecaresystem.repository.PatientRepository;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.entity.Patient;
import com.hospital.queuecaresystem.entity.Doctor;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service for checking user authorization and ownership
 */
@Service
@AllArgsConstructor
@Slf4j
public class SecurityService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Check if current user owns the resource (userId match)
     * @param userId The user ID to check
     * @return true if current user is the owner
     */
    public boolean isOwner(Long userId) {
        CustomUserDetails userDetails = getCurrentUserDetails();
        if (userDetails == null) {
            log.warn("No authentication found in SecurityContext");
            return false;
        }
        
        boolean isOwner = userDetails.getId().equals(userId);
        log.debug("isOwner check - userId: {}, currentUser: {}, result: {}", 
                userId, userDetails.getId(), isOwner);
        return isOwner;
    }

    /**
     * Check if current user is the patient owner
     * @param patientId The patient ID to check
     * @return true if current user is the patient owner
     */
    public boolean isPatientOwner(Long patientId) {
        CustomUserDetails userDetails = getCurrentUserDetails();
        if (userDetails == null) {
            log.warn("No authentication found in SecurityContext");
            return false;
        }

        Patient patient = patientRepository.findById(patientId).orElse(null);
        if (patient == null) {
            log.warn("Patient not found with id: {}", patientId);
            return false;
        }

        boolean isOwner = patient.getUser().getId().equals(userDetails.getId());
        log.debug("isPatientOwner check - patientId: {}, userId: {}, currentUser: {}, result: {}", 
                patientId, patient.getUser().getId(), userDetails.getId(), isOwner);
        return isOwner;
    }

    /**
     * Check if current user is the doctor owner or admin
     * @param doctorId The doctor ID to check
     * @param type The resource type (currently unused, kept for flexibility)
     * @return true if current user is the doctor owner or is admin
     */
    public boolean isOwnerOrAdmin(Long doctorId, String type) {
        CustomUserDetails userDetails = getCurrentUserDetails();
        if (userDetails == null) {
            log.warn("No authentication found in SecurityContext");
            return false;
        }

        // Check if user is admin
        if ("ADMIN".equals(userDetails.getRole())) {
            log.debug("isOwnerOrAdmin - User is ADMIN");
            return true;
        }

        // Check if user is the owner
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) {
            log.warn("Doctor not found with id: {}", doctorId);
            return false;
        }

        boolean isOwner = doctor.getUser().getId().equals(userDetails.getId());
        log.debug("isOwnerOrAdmin check - doctorId: {}, userId: {}, currentUser: {}, result: {}", 
                doctorId, doctor.getUser().getId(), userDetails.getId(), isOwner);
        return isOwner;
    }

    /**
     * Get current authenticated user details
     * @return CustomUserDetails if authenticated, null otherwise
     */
    private CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            log.debug("User is not authenticated");
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return (CustomUserDetails) principal;
        }

        log.warn("Principal is not CustomUserDetails: {}", principal.getClass().getName());
        return null;
    }
}
