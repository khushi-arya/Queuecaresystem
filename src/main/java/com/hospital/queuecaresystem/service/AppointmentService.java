package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.AppointmentRequest;
import com.hospital.queuecaresystem.dto.AppointmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for Appointment operations
 */
public interface AppointmentService {

    /**
     * Book a new appointment with complete validation
     * @param appointmentRequest Request DTO
     * @return AppointmentResponse
     * @throws AppointmentException if validation fails
     */
    AppointmentResponse bookAppointment(AppointmentRequest appointmentRequest);

    /**
     * Get appointment by ID
     * @param appointmentId Appointment ID
     * @return AppointmentResponse
     */
    AppointmentResponse getAppointmentById(Long appointmentId);

    /**
     * Get all appointments for a patient with pagination
     * @param patientId Patient ID
     * @param pageable Pagination parameters
     * @return Page of AppointmentResponse
     */
    Page<AppointmentResponse> getAppointmentsByPatient(Long patientId, Pageable pageable);

    /**
     * Get all appointments for a doctor with pagination
     * @param doctorId Doctor ID
     * @param pageable Pagination parameters
     * @return Page of AppointmentResponse
     */
    Page<AppointmentResponse> getAppointmentsByDoctor(Long doctorId, Pageable pageable);

    /**
     * Get all appointments with a specific status with pagination
     * @param status Appointment status
     * @param pageable Pagination parameters
     * @return Page of AppointmentResponse
     */
    Page<AppointmentResponse> getAppointmentsByStatus(String status, Pageable pageable);

    /**
     * Update appointment status
     * @param appointmentId Appointment ID
     * @param status New status
     * @return AppointmentResponse
     */
    AppointmentResponse updateAppointmentStatus(Long appointmentId, String status);

    /**
     * Cancel an appointment
     * @param appointmentId Appointment ID
     * @return AppointmentResponse
     */
    AppointmentResponse cancelAppointment(Long appointmentId);

    /**
     * Get available time slots for a doctor on a specific date
     * @param doctorId Doctor ID
     * @param date Appointment date
     * @return List of available time slots
     */
    List<LocalDateTime> getAvailableTimeSlots(Long doctorId, LocalDateTime date);

    /**
     * Check if a time slot is available
     * @param doctorId Doctor ID
     * @param appointmentDateTime Appointment date/time
     * @return true if available, false otherwise
     */
    boolean isTimeSlotAvailable(Long doctorId, LocalDateTime appointmentDateTime);

    /**
     * Delete an appointment
     * @param appointmentId Appointment ID
     */
    void deleteAppointment(Long appointmentId);
}
