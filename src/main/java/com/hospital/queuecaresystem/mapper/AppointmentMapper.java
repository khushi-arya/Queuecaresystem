package com.hospital.queuecaresystem.mapper;

import com.hospital.queuecaresystem.dto.AppointmentRequest;
import com.hospital.queuecaresystem.dto.AppointmentResponse;
import com.hospital.queuecaresystem.entity.Appointment;
import com.hospital.queuecaresystem.entity.Doctor;
import com.hospital.queuecaresystem.entity.Patient;
import org.springframework.stereotype.Component;

/**
 * Mapper component for converting between Appointment DTOs and Appointment entities.
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
public class AppointmentMapper {

    /**
     * Convert AppointmentRequest DTO to Appointment entity.
     * Used when booking appointments from API requests.
     * 
     * Note: This method does NOT set:
     * - Patient and Doctor relationships (only IDs are in DTO)
     * - Token number
     * - Status (defaults to SCHEDULED)
     * - Timestamps (createdAt/updatedAt)
     * 
     * The service layer is responsible for:
     * - Loading and validating Patient and Doctor entities
     * - Generating token number
     * - Setting timestamps
     * - Validating business rules (shift hours, breaks, max patients, duplicates)
     * 
     * @param request AppointmentRequest DTO from API
     * @return Appointment entity ready for persistence (incomplete, needs service layer setup)
     */
    public Appointment toEntity(AppointmentRequest request) {
        if (request == null) {
            return null;
        }

        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setNotes(request.getNotes());
        
        // Status defaults to SCHEDULED
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        
        // Patient and Doctor must be set by service layer
        // since we only have IDs in the DTO

        return appointment;
    }

    /**
     * Set Patient and Doctor on an Appointment entity.
     * Separated into a utility method since DTOs contain IDs, not full entities.
     * 
     * @param appointment Appointment entity
     * @param patient Patient entity (loaded from database)
     * @param doctor Doctor entity (loaded from database)
     */
    public void setPatientAndDoctor(Appointment appointment, Patient patient, Doctor doctor) {
        if (appointment != null) {
            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
        }
    }

    /**
     * Convert Appointment entity to AppointmentResponse DTO.
     * Used when returning appointment data in API responses.
     * 
     * Extracts nested patient and doctor information to prevent exposing
     * full JPA entities in API responses.
     * 
     * @param appointment Appointment entity from database
     * @return AppointmentResponse DTO for API response
     */
    public AppointmentResponse toResponse(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setTokenNumber(appointment.getTokenNumber());
        response.setStatus(appointment.getStatus().name());
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());

        // Map patient info if loaded
        if (appointment.getPatient() != null) {
            Patient patient = appointment.getPatient();
            AppointmentResponse.PatientInfo patientInfo = new AppointmentResponse.PatientInfo(
                    patient.getId(),
                    patient.getFirstName(),
                    patient.getLastName(),
                    patient.getPhoneNumber()
            );
            response.setPatient(patientInfo);
        }

        // Map doctor info if loaded
        if (appointment.getDoctor() != null) {
            Doctor doctor = appointment.getDoctor();
            AppointmentResponse.DoctorInfo doctorInfo = new AppointmentResponse.DoctorInfo(
                    doctor.getId(),
                    doctor.getName(),
                    doctor.getSpecialization()
            );
            response.setDoctor(doctorInfo);
        }

        return response;
    }

    /**
     * Convert list of Appointment entities to list of AppointmentResponse DTOs.
     * Helper method for batch conversions.
     * 
     * @param appointments List of Appointment entities
     * @return List of AppointmentResponse DTOs
     */
    public java.util.List<AppointmentResponse> toResponseList(java.util.List<Appointment> appointments) {
        if (appointments == null) {
            return null;
        }
        return appointments.stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}
