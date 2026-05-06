package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.DoctorRequest;
import com.hospital.queuecaresystem.dto.DoctorResponse;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import com.hospital.queuecaresystem.service.DoctorService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


/**
 * REST Controller for Doctor management
 * 
 * All request body parameters are validated using @Valid annotation.
 * Validation errors return HTTP 400 (BAD_REQUEST) with structured error details.
 * 
 * @Validated enables method-level validation for path variables and request parameters
 */
@RestController
@RequestMapping("/api/doctors")
@AllArgsConstructor
@Validated
public class DoctorController {

    private final DoctorService doctorService;

    /**
     * Create a new doctor profile for a user
     * POST /api/doctors/{userId}
     */
    @PostMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponse> createDoctor(
            @PathVariable Long userId,
            @Valid @RequestBody DoctorRequest doctorRequest) {
        DoctorResponse response = doctorService.createDoctor(userId, doctorRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get doctor by ID
     * GET /api/doctors/{doctorId}
     */
    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long doctorId) {
        DoctorResponse response = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get doctor profile by user ID
     * GET /api/doctors/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<DoctorResponse> getDoctorByUserId(@PathVariable Long userId) {
        DoctorResponse response = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update doctor information
     * PUT /api/doctors/{doctorId}
     */
    @PutMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOwnerOrAdmin(#doctorId, 'doctor')")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorRequest doctorRequest) {
        DoctorResponse response = doctorService.updateDoctor(doctorId, doctorRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete doctor profile
     * DELETE /api/doctors/{doctorId}
     */
    @DeleteMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long doctorId) {
        doctorService.deleteDoctor(doctorId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all doctors with pagination
     * GET /api/doctors?page=0&size=20&sort=name,asc
     * 
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    @GetMapping
    public ResponseEntity<Page<DoctorResponse>> getAllDoctors(
            @ParameterObject Pageable pageable) {
        Page<DoctorResponse> response = doctorService.getAllDoctors(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get doctors by specialization with pagination
     * GET /api/doctors/specialization/{specialization}?page=0&size=20
     * 
     * @param specialization Doctor specialization
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<Page<DoctorResponse>> getDoctorsBySpecialization(
            @PathVariable String specialization,
            @ParameterObject Pageable pageable) {
        Page<DoctorResponse> response = doctorService.getDoctorsBySpecialization(specialization, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get doctors by status with pagination
     * GET /api/doctors/status/{status}?page=0&size=20
     * 
     * @param status Doctor status
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DoctorResponse>> getDoctorsByStatus(
            @PathVariable DoctorStatus status,
            @ParameterObject Pageable pageable) {
        Page<DoctorResponse> response = doctorService.getDoctorsByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get active doctors by specialization with pagination
     * GET /api/doctors/active/{specialization}?page=0&size=20
     * 
     * @param specialization Doctor specialization (uses composite index idx_doctor_spec_status)
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    @GetMapping("/active/{specialization}")
    public ResponseEntity<Page<DoctorResponse>> getActiveDoctorsBySpecialization(
            @PathVariable String specialization,
            @ParameterObject Pageable pageable) {
        Page<DoctorResponse> response = doctorService.getActiveDoctorsBySpecialization(specialization, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Update doctor status
     * PATCH /api/doctors/{doctorId}/status/{status}
     */
    @PatchMapping("/{doctorId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponse> updateDoctorStatus(
            @PathVariable Long doctorId,
            @PathVariable DoctorStatus status) {
        DoctorResponse response = doctorService.updateDoctorStatus(doctorId, status);
        return ResponseEntity.ok(response);
    }
}
