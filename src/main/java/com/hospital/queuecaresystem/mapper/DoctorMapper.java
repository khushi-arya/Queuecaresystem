package com.hospital.queuecaresystem.mapper;

import com.hospital.queuecaresystem.dto.DoctorRequest;
import com.hospital.queuecaresystem.dto.DoctorResponse;
import com.hospital.queuecaresystem.entity.Doctor;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import org.springframework.stereotype.Component;

/**
 * Mapper component for converting between Doctor DTOs and Doctor entities.
 * 
 * Separation of concerns:
 * - DTOs are used for API boundaries (requests/responses)
 * - Entities are used for database operations (JPA)
 * - Mappers provide the translation layer
 * 
 * This prevents JPA entities from being exposed in API responses and ensures
 * data validation happens at the API layer through DTOs.
 */
@Component
public class DoctorMapper {

    /**
     * Convert DoctorRequest DTO to Doctor entity.
     * Used when creating or updating doctors from API requests.
     * 
     * Note: This method does NOT set user relationship.
     * The service layer is responsible for:
     * - Associating the Doctor with a User entity
     * - Setting createdAt/updatedAt timestamps
     * 
     * @param request DoctorRequest DTO from API
     * @return Doctor entity ready for persistence
     */
    public Doctor toEntity(DoctorRequest request) {
        if (request == null) {
            return null;
        }

        Doctor doctor = new Doctor();
        doctor.setName(request.getName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setShiftStartTime(request.getShiftStartTime());
        doctor.setShiftEndTime(request.getShiftEndTime());
        doctor.setBreakStartTime(request.getBreakStartTime());
        doctor.setBreakEndTime(request.getBreakEndTime());
        doctor.setMaxPatientsPerDay(request.getMaxPatientsPerDay());
        doctor.setBio(request.getBio());
        doctor.setExperience(request.getExperience());
        doctor.setHospitalAffiliation(request.getHospitalAffiliation());
        
        // Set status, default to ACTIVE if not provided
        doctor.setStatus(request.getStatus() != null ? request.getStatus() : DoctorStatus.ACTIVE);

        return doctor;
    }

    /**
     * Convert Doctor entity to DoctorResponse DTO.
     * Used when returning doctor data in API responses.
     * 
     * Does NOT include sensitive information or full User relationship.
     * Only includes userId if user relationship is loaded.
     * 
     * @param doctor Doctor entity from database
     * @return DoctorResponse DTO for API response
     */
    public DoctorResponse toResponse(Doctor doctor) {
        if (doctor == null) {
            return null;
        }

        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setName(doctor.getName());
        response.setSpecialization(doctor.getSpecialization());
        response.setShiftStartTime(doctor.getShiftStartTime());
        response.setShiftEndTime(doctor.getShiftEndTime());
        response.setBreakStartTime(doctor.getBreakStartTime());
        response.setBreakEndTime(doctor.getBreakEndTime());
        response.setMaxPatientsPerDay(doctor.getMaxPatientsPerDay());
        response.setStatus(doctor.getStatus());
        response.setBio(doctor.getBio());
        response.setExperience(doctor.getExperience());
        response.setHospitalAffiliation(doctor.getHospitalAffiliation());
        response.setCreatedAt(doctor.getCreatedAt());
        response.setUpdatedAt(doctor.getUpdatedAt());

        // Include userId if user relationship is loaded
        if (doctor.getUser() != null) {
            response.setUserId(doctor.getUser().getId());
        }

        return response;
    }

    /**
     * Update an existing Doctor entity from a DoctorRequest DTO.
     * Used for PATCH/PUT operations.
     * 
     * Note: This method only updates doctor-specific fields.
     * The service layer is responsible for:
     * - Updating the updatedAt timestamp
     * - Validation of business rules (e.g., shift time validation)
     * 
     * @param request DoctorRequest DTO from API
     * @param doctor Existing Doctor entity to be updated
     */
    public void updateEntity(DoctorRequest request, Doctor doctor) {
        if (request == null || doctor == null) {
            return;
        }

        doctor.setName(request.getName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setShiftStartTime(request.getShiftStartTime());
        doctor.setShiftEndTime(request.getShiftEndTime());
        doctor.setBreakStartTime(request.getBreakStartTime());
        doctor.setBreakEndTime(request.getBreakEndTime());
        doctor.setMaxPatientsPerDay(request.getMaxPatientsPerDay());
        doctor.setBio(request.getBio());
        doctor.setExperience(request.getExperience());
        doctor.setHospitalAffiliation(request.getHospitalAffiliation());
        
        if (request.getStatus() != null) {
            doctor.setStatus(request.getStatus());
        }
    }
}
