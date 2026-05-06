package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.DoctorRequest;
import com.hospital.queuecaresystem.dto.DoctorResponse;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * Service interface for Doctor operations
 */
public interface DoctorService {

    /**
     * Create a new doctor
     * @param userId User ID to link with doctor
     * @param doctorRequest Request DTO
     * @return DoctorResponse
     */
    DoctorResponse createDoctor(Long userId, DoctorRequest doctorRequest);

    /**
     * Get doctor by ID
     * @param doctorId Doctor ID
     * @return DoctorResponse
     */
    DoctorResponse getDoctorById(Long doctorId);

    /**
     * Get doctor by user ID
     * @param userId User ID
     * @return DoctorResponse
     */
    DoctorResponse getDoctorByUserId(Long userId);

    /**
     * Update doctor information
     * @param doctorId Doctor ID
     * @param doctorRequest Request DTO
     * @return DoctorResponse
     */
    DoctorResponse updateDoctor(Long doctorId, DoctorRequest doctorRequest);

    /**
     * Delete doctor
     * @param doctorId Doctor ID
     */
    void deleteDoctor(Long doctorId);

    /**
     * Get all doctors with pagination
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    Page<DoctorResponse> getAllDoctors(Pageable pageable);

    /**
     * Get doctors by specialization with pagination
     * @param specialization Specialization
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    Page<DoctorResponse> getDoctorsBySpecialization(String specialization, Pageable pageable);

    /**
     * Get doctors by status with pagination
     * @param status Doctor status
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    Page<DoctorResponse> getDoctorsByStatus(DoctorStatus status, Pageable pageable);

    /**
     * Get active doctors by specialization with pagination
     * @param specialization Specialization
     * @param pageable Pagination parameters
     * @return Page of DoctorResponse
     */
    Page<DoctorResponse> getActiveDoctorsBySpecialization(String specialization, Pageable pageable);

    /**
     * Update doctor status
     * @param doctorId Doctor ID
     * @param status New status
     * @return DoctorResponse
     */
    DoctorResponse updateDoctorStatus(Long doctorId, DoctorStatus status);
}
