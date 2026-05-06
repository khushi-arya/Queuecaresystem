package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.PatientRequest;
import com.hospital.queuecaresystem.dto.PatientResponse;
import com.hospital.queuecaresystem.service.PatientService;
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
 * REST Controller for Patient management
 * 
 * All request body parameters are validated using @Valid annotation.
 * Validation errors return HTTP 400 (BAD_REQUEST) with structured error details.
 * 
 * @Validated enables method-level validation for path variables and request parameters
 */
@RestController
@RequestMapping("/api/patients")
@AllArgsConstructor
@Validated
public class PatientController {

    private final PatientService patientService;

    /**
     * Create a new patient profile for a user
     * POST /api/patients/{userId}
     */
    @PostMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOwner(#userId)")
    public ResponseEntity<PatientResponse> createPatient(
            @PathVariable Long userId,
            @Valid @RequestBody PatientRequest patientRequest) {
        PatientResponse response = patientService.createPatient(userId, patientRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get patient by ID
     * GET /api/patients/{patientId}
     */
    @GetMapping("/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or @securityService.isPatientOwner(#patientId)")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long patientId) {
        PatientResponse response = patientService.getPatientById(patientId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get patient profile by user ID
     * GET /api/patients/user/{userId}
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOwner(#userId)")
    public ResponseEntity<PatientResponse> getPatientByUserId(@PathVariable Long userId) {
        PatientResponse response = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get patient by phone number
     * GET /api/patients/phone/{phoneNumber}
     */
    @GetMapping("/phone/{phoneNumber}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<PatientResponse> getPatientByPhoneNumber(@PathVariable String phoneNumber) {
        PatientResponse response = patientService.getPatientByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(response);
    }

    /**
     * Update patient information
     * PUT /api/patients/{patientId}
     */
    @PutMapping("/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isPatientOwner(#patientId)")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientRequest patientRequest) {
        PatientResponse response = patientService.updatePatient(patientId, patientRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete patient profile
     * DELETE /api/patients/{patientId}
     */
    @DeleteMapping("/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isPatientOwner(#patientId)")
    public ResponseEntity<Void> deletePatient(@PathVariable Long patientId) {
        patientService.deletePatient(patientId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all patients with pagination
     * GET /api/patients?page=0&size=20&sort=firstName,asc
     * 
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Page<PatientResponse>> getAllPatients(
            @ParameterObject Pageable pageable) {
        Page<PatientResponse> response = patientService.getAllPatients(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get patients by first name with pagination
     * GET /api/patients/search/firstname/{firstName}?page=0&size=20
     * 
     * @param firstName Patient first name
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    @GetMapping("/search/firstname/{firstName}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Page<PatientResponse>> getPatientsByFirstName(
            @PathVariable String firstName,
            @ParameterObject Pageable pageable) {
        Page<PatientResponse> response = patientService.getPatientsByFirstName(firstName, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get patients by last name with pagination
     * GET /api/patients/search/lastname/{lastName}?page=0&size=20
     * 
     * @param lastName Patient last name
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    @GetMapping("/search/lastname/{lastName}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Page<PatientResponse>> getPatientsByLastName(
            @PathVariable String lastName,
            @ParameterObject Pageable pageable) {
        Page<PatientResponse> response = patientService.getPatientsByLastName(lastName, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get patients by full name with pagination
     * GET /api/patients/search/fullname?firstName=John&lastName=Doe&page=0&size=20
     * Uses composite index idx_patient_name (first_name, last_name) for optimized search
     * 
     * @param firstName Patient first name
     * @param lastName Patient last name
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    @GetMapping("/search/fullname")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<Page<PatientResponse>> getPatientsByFullName(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @ParameterObject Pageable pageable) {
        Page<PatientResponse> response = patientService.getPatientsByFullName(firstName, lastName, pageable);
        return ResponseEntity.ok(response);
    }
}
