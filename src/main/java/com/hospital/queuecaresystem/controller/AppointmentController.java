package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.AppointmentRequest;
import com.hospital.queuecaresystem.dto.AppointmentResponse;
import com.hospital.queuecaresystem.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for Appointment management
 * Handles appointment booking, retrieval, and status updates
 * 
 * All request body parameters are validated using @Valid annotation.
 * Validation errors return HTTP 400 (BAD_REQUEST) with structured error details.
 * 
 * @Validated enables method-level validation for path variables and request parameters
 */
@RestController
@RequestMapping("/api/appointments")
@AllArgsConstructor
@Slf4j
@Validated
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Book a new appointment
     * POST /api/appointments
     * 
     * @param appointmentRequest Appointment booking request
     * @return Created AppointmentResponse with 201 status
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentRequest appointmentRequest) {
        log.info("Booking appointment for patient: {}, doctor: {}", 
                 appointmentRequest.getPatientId(), appointmentRequest.getDoctorId());
        
        AppointmentResponse response = appointmentService.bookAppointment(appointmentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get appointment by ID
     * GET /api/appointments/{appointmentId}
     * 
     * @param appointmentId Appointment ID
     * @return AppointmentResponse
     */
    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable Long appointmentId) {
        log.info("Fetching appointment: {}", appointmentId);
        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all appointments for a patient with pagination
     * GET /api/appointments/patient/{patientId}?page=0&size=20&sort=appointmentDate,desc
     * 
     * @param patientId Patient ID
     * @param pageable Pagination parameters
     * @return Page of AppointmentResponse
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @ParameterObject Pageable pageable) {
        log.info("Fetching appointments for patient: {} with pagination", patientId);
        Page<AppointmentResponse> responses = appointmentService.getAppointmentsByPatient(patientId, pageable);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all appointments for a doctor with pagination
     * GET /api/appointments/doctor/{doctorId}?page=0&size=20&sort=appointmentDate,desc
     * 
     * @param doctorId Doctor ID
     * @param pageable Pagination parameters
     * @return Page of AppointmentResponse
     */
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByDoctor(
            @PathVariable Long doctorId,
            @ParameterObject Pageable pageable) {
        log.info("Fetching appointments for doctor: {} with pagination", doctorId);
        Page<AppointmentResponse> responses = appointmentService.getAppointmentsByDoctor(doctorId, pageable);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get appointments by status with pagination
     * GET /api/appointments/status/{status}?page=0&size=20&sort=appointmentDate,asc
     * 
     * Valid statuses: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
     * 
     * @param status Appointment status
     * @param pageable Pagination parameters
     * @return Page of AppointmentResponse
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByStatus(
            @PathVariable String status,
            @ParameterObject Pageable pageable) {
        log.info("Fetching appointments with status: {} with pagination", status);
        Page<AppointmentResponse> responses = appointmentService.getAppointmentsByStatus(status, pageable);
        return ResponseEntity.ok(responses);
    }

    /**
     * Update appointment status
     * PATCH /api/appointments/{appointmentId}/status
     * 
     * @param appointmentId Appointment ID
     * @param status New status
     * @return Updated AppointmentResponse
     */
    @PatchMapping("/{appointmentId}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestParam String status) {
        log.info("Updating appointment {} status to: {}", appointmentId, status);
        AppointmentResponse response = appointmentService.updateAppointmentStatus(appointmentId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel an appointment
     * DELETE /api/appointments/{appointmentId}
     * 
     * @param appointmentId Appointment ID
     * @return Updated AppointmentResponse with CANCELLED status
     */
    @DeleteMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable Long appointmentId) {
        log.info("Cancelling appointment: {}", appointmentId);
        AppointmentResponse response = appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get available time slots for a doctor on a specific date
     * GET /api/appointments/doctor/{doctorId}/available-slots
     * 
     * @param doctorId Doctor ID
     * @param date Appointment date (format: 2024-01-15T00:00:00)
     * @return List of available LocalDateTime slots
     */
    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<List<LocalDateTime>> getAvailableTimeSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        log.info("Fetching available slots for doctor {} on date: {}", doctorId, date);
        List<LocalDateTime> slots = appointmentService.getAvailableTimeSlots(doctorId, date);
        return ResponseEntity.ok(slots);
    }

    /**
     * Check if a specific time slot is available for a doctor
     * GET /api/appointments/doctor/{doctorId}/check-availability
     * 
     * @param doctorId Doctor ID
     * @param appointmentDateTime Appointment date/time (format: 2024-01-15T10:00:00)
     * @return Boolean indicating if slot is available
     */
    @GetMapping("/doctor/{doctorId}/check-availability")
    public ResponseEntity<Boolean> checkTimeSlotAvailability(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime appointmentDateTime) {
        log.info("Checking availability for doctor {} at: {}", doctorId, appointmentDateTime);
        boolean available = appointmentService.isTimeSlotAvailable(doctorId, appointmentDateTime);
        return ResponseEntity.ok(available);
    }

    /**
     * Delete an appointment (admin only)
     * DELETE /api/appointments/{appointmentId}/delete
     * 
     * @param appointmentId Appointment ID
     * @return No content
     */
    @DeleteMapping("/{appointmentId}/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long appointmentId) {
        log.info("Deleting appointment: {}", appointmentId);
        appointmentService.deleteAppointment(appointmentId);
        return ResponseEntity.noContent().build();
    }
}
