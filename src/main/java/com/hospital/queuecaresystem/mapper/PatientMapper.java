package com.hospital.queuecaresystem.mapper;

import com.hospital.queuecaresystem.dto.PatientRequest;
import com.hospital.queuecaresystem.dto.PatientResponse;
import com.hospital.queuecaresystem.entity.Patient;
import org.springframework.stereotype.Component;

/**
 * Mapper component for converting between Patient DTOs and Patient entities.
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
public class PatientMapper {

    /**
     * Convert PatientRequest DTO to Patient entity.
     * Used when creating or updating patients from API requests.
     * 
     * Note: This method does NOT set user relationship or timestamps.
     * The service layer is responsible for:
     * - Associating the Patient with a User entity
     * - Setting createdAt/updatedAt timestamps
     * 
     * @param request PatientRequest DTO from API
     * @return Patient entity ready for persistence
     */
    public Patient toEntity(PatientRequest request) {
        if (request == null) {
            return null;
        }

        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhoneNumber(request.getPhoneNumber());

        return patient;
    }

    /**
     * Convert Patient entity to PatientResponse DTO.
     * Used when returning patient data in API responses.
     * 
     * Does NOT include sensitive information like password or security details.
     * Does NOT include the full User relationship - only userId if needed.
     * 
     * @param patient Patient entity from database
     * @return PatientResponse DTO for API response
     */
    public PatientResponse toResponse(Patient patient) {
        if (patient == null) {
            return null;
        }

        PatientResponse response = new PatientResponse();
        response.setId(patient.getId());
        response.setFirstName(patient.getFirstName());
        response.setLastName(patient.getLastName());
        response.setPhoneNumber(patient.getPhoneNumber());
        response.setCreatedAt(patient.getCreatedAt());
        response.setUpdatedAt(patient.getUpdatedAt());

        // Include userId if user relationship is loaded
        if (patient.getUser() != null) {
            response.setUserId(patient.getUser().getId());
        }

        return response;
    }

    /**
     * Update an existing Patient entity from a PatientRequest DTO.
     * Used for PATCH/PUT operations.
     * 
     * Note: This method only updates patient-specific fields.
     * The service layer is responsible for:
     * - Updating the updatedAt timestamp
     * - Validation of business rules (e.g., duplicate phone numbers)
     * 
     * @param request PatientRequest DTO from API
     * @param patient Existing Patient entity to be updated
     */
    public void updateEntity(PatientRequest request, Patient patient) {
        if (request == null || patient == null) {
            return;
        }

        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhoneNumber(request.getPhoneNumber());
    }
}
