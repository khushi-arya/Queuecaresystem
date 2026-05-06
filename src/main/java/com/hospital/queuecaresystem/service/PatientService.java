package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.PatientRequest;
import com.hospital.queuecaresystem.dto.PatientResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * Service interface for Patient operations
 */
public interface PatientService {

    /**
     * Create a new patient
     * @param userId User ID to link with patient
     * @param patientRequest Request DTO
     * @return PatientResponse
     */
    PatientResponse createPatient(Long userId, PatientRequest patientRequest);

    /**
     * Get patient by ID
     * @param patientId Patient ID
     * @return PatientResponse
     */
    PatientResponse getPatientById(Long patientId);

    /**
     * Get patient by user ID
     * @param userId User ID
     * @return PatientResponse
     */
    PatientResponse getPatientByUserId(Long userId);

    /**
     * Get patient by phone number
     * @param phoneNumber Phone number
     * @return PatientResponse
     */
    PatientResponse getPatientByPhoneNumber(String phoneNumber);

    /**
     * Update patient information
     * @param patientId Patient ID
     * @param patientRequest Request DTO
     * @return PatientResponse
     */
    PatientResponse updatePatient(Long patientId, PatientRequest patientRequest);

    /**
     * Delete patient
     * @param patientId Patient ID
     */
    void deletePatient(Long patientId);

    /**
     * Get all patients with pagination
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    Page<PatientResponse> getAllPatients(Pageable pageable);

    /**
     * Get patients by first name with pagination
     * @param firstName First name
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    Page<PatientResponse> getPatientsByFirstName(String firstName, Pageable pageable);

    /**
     * Get patients by last name with pagination
     * @param lastName Last name
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    Page<PatientResponse> getPatientsByLastName(String lastName, Pageable pageable);

    /**
     * Get patients by first and last name with pagination
     * @param firstName First name
     * @param lastName Last name
     * @param pageable Pagination parameters
     * @return Page of PatientResponse
     */
    Page<PatientResponse> getPatientsByFullName(String firstName, String lastName, Pageable pageable);
}
