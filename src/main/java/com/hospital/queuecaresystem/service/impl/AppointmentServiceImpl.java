package com.hospital.queuecaresystem.service.impl;

import com.hospital.queuecaresystem.dto.AppointmentRequest;
import com.hospital.queuecaresystem.dto.AppointmentResponse;
import com.hospital.queuecaresystem.entity.Appointment;
import com.hospital.queuecaresystem.entity.Appointment.AppointmentStatus;
import com.hospital.queuecaresystem.entity.Doctor;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import com.hospital.queuecaresystem.entity.Patient;
import com.hospital.queuecaresystem.exception.AppointmentException;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.repository.AppointmentRepository;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.repository.PatientRepository;
import com.hospital.queuecaresystem.service.AppointmentService;
import com.hospital.queuecaresystem.service.DoctorQueueService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service implementation for Appointment operations
 */
@Service
@AllArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorQueueService doctorQueueService;

    private static final int APPOINTMENT_DURATION_MINUTES = 30;

    @Override
    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest appointmentRequest) {
        log.info("Booking appointment for patient: {} with doctor: {}",
                 appointmentRequest.getPatientId(), appointmentRequest.getDoctorId());

        // Fetch entities
        Patient patient = patientRepository.findById(appointmentRequest.getPatientId())
                .orElseThrow(() -> new UserNotFoundException("Patient not found"));
        
        Doctor doctor = doctorRepository.findById(appointmentRequest.getDoctorId())
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));

        LocalDateTime appointmentDateTime = appointmentRequest.getAppointmentDate();

        // Validation 1: Doctor must be AVAILABLE
        validateDoctorAvailable(doctor);

        // Validation 2: Appointment must be within doctor's shift timing
        validateWithinShiftTiming(doctor, appointmentDateTime);

        // Validation 3: Appointment must not be during doctor's break
        validateNotDuringBreak(doctor, appointmentDateTime);

        // Validation 4: Check max patients per day limit
        validateMaxPatientsPerDay(doctor, appointmentDateTime);

        // Validation 5: No duplicate booking (same patient, same doctor, same date)
        validateNoDuplicateBooking(patient.getId(), doctor.getId(), appointmentDateTime);

        // Generate token number
        int tokenNumber = generateTokenNumber(doctor, appointmentDateTime);

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(appointmentDateTime);
        appointment.setTokenNumber(tokenNumber);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setNotes(appointmentRequest.getNotes());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Appointment booked successfully with ID: {}", savedAppointment.getId());

        // Add patient to doctor's queue
        doctorQueueService.addPatientToQueue(savedAppointment.getId());

        return mapToResponse(savedAppointment);
    }

    @Override
    public AppointmentResponse getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new UserNotFoundException("Appointment not found"));
        return mapToResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointmentsByPatient(Long patientId, Pageable pageable) {
        log.info("Fetching appointments for patient: {} with pagination: page={}, size={}", 
                 patientId, pageable.getPageNumber(), pageable.getPageSize());
        return appointmentRepository.findByPatientId(patientId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointmentsByDoctor(Long doctorId, Pageable pageable) {
        log.info("Fetching appointments for doctor: {} with pagination: page={}, size={}", 
                 doctorId, pageable.getPageNumber(), pageable.getPageSize());
        return appointmentRepository.findByDoctorId(doctorId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointmentsByStatus(String status, Pageable pageable) {
        try {
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            log.info("Fetching appointments with status: {} and pagination: page={}, size={}", 
                     status, pageable.getPageNumber(), pageable.getPageSize());
            return appointmentRepository.findByStatus(appointmentStatus, pageable)
                    .map(this::mapToResponse);
        } catch (IllegalArgumentException e) {
            throw new AppointmentException("Invalid status: " + status);
        }
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new UserNotFoundException("Appointment not found"));

        try {
            AppointmentStatus newStatus = AppointmentStatus.valueOf(status.toUpperCase());
            appointment.setStatus(newStatus);
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            log.info("Appointment {} status updated to {}", appointmentId, newStatus);
            return mapToResponse(updatedAppointment);
        } catch (IllegalArgumentException e) {
            throw new AppointmentException("Invalid status: " + status);
        }
    }

    @Override
    @Transactional
    public AppointmentResponse cancelAppointment(Long appointmentId) {
        log.info("Cancelling appointment: {}", appointmentId);
        
        // Remove from queue if exists
        try {
            doctorQueueService.removePatientFromQueue(appointmentId);
        } catch (Exception e) {
            log.warn("Could not remove appointment from queue: {}", e.getMessage());
        }
        
        return updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED.toString());
    }

    @Override
    public List<LocalDateTime> getAvailableTimeSlots(Long doctorId, LocalDateTime date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));

        List<Appointment> appointments = appointmentRepository
                .findAppointmentsByDoctorAndDate(doctorId, date);

        List<LocalDateTime> bookedSlots = appointments.stream()
                .map(Appointment::getAppointmentDate)
                .collect(Collectors.toList());

        // Generate all possible slots for the day
        List<LocalDateTime> availableSlots = generateDaySlots(doctor, date);
        
        // Remove booked slots
        availableSlots.removeAll(bookedSlots);

        return availableSlots;
    }

    @Override
    public boolean isTimeSlotAvailable(Long doctorId, LocalDateTime appointmentDateTime) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));

        // Check all validations
        try {
            validateDoctorAvailable(doctor);
            validateWithinShiftTiming(doctor, appointmentDateTime);
            validateNotDuringBreak(doctor, appointmentDateTime);
            
            // Check if slot is already booked
            long count = appointmentRepository.countAppointmentsByDoctorAndDate(
                    doctorId, appointmentDateTime);
            return count == 0;
        } catch (AppointmentException e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void deleteAppointment(Long appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new UserNotFoundException("Appointment not found");
        }
        appointmentRepository.deleteById(appointmentId);
        log.info("Appointment {} deleted", appointmentId);
    }

    // ==================== VALIDATION METHODS ====================

    /**
     * Validation 1: Doctor must be AVAILABLE
     * 
     * Logs:
     * - WARN: Doctor is not available with status detail
     * - DEBUG: Doctor availability validation passed
     */
    private void validateDoctorAvailable(Doctor doctor) {
        if (doctor.getStatus() != DoctorStatus.ACTIVE) {
            log.warn("Appointment booking validation failed - Doctor {} is not available. Current status: {}", 
                    doctor.getId(), doctor.getStatus());
            throw new AppointmentException("Doctor is not available. Current status: " + doctor.getStatus());
        }
        log.debug("Doctor {} availability validation passed - Status: ACTIVE", doctor.getId());
    }

    /**
     * Validation 2: Appointment must be within doctor's shift timing
     * 
     * Logs:
     * - WARN: Appointment time outside shift hours
     * - DEBUG: Shift timing validation passed
     */
    private void validateWithinShiftTiming(Doctor doctor, LocalDateTime appointmentDateTime) {
        LocalTime appointmentTime = appointmentDateTime.toLocalTime();
        LocalTime shiftStart = doctor.getShiftStartTime();
        LocalTime shiftEnd = doctor.getShiftEndTime();

        if (appointmentTime.isBefore(shiftStart) || appointmentTime.isAfter(shiftEnd)) {
            log.warn("Appointment booking validation failed - Doctor {} appointment time {} is outside shift hours ({} to {})", 
                    doctor.getId(), appointmentTime, shiftStart, shiftEnd);
            throw new AppointmentException(
                String.format("Appointment time must be within shift hours: %s to %s", 
                    shiftStart, shiftEnd));
        }
        log.debug("Doctor {} shift timing validation passed - Appointment time: {} (within {} to {})", 
                doctor.getId(), appointmentTime, shiftStart, shiftEnd);
    }

    /**
     * Validation 3: Appointment must not be during doctor's break
     * 
     * Logs:
     * - WARN: Appointment falls during doctor's break time
     * - DEBUG: Break time validation passed
     */
    private void validateNotDuringBreak(Doctor doctor, LocalDateTime appointmentDateTime) {
        if (doctor.getBreakStartTime() != null && doctor.getBreakEndTime() != null) {
            LocalTime appointmentTime = appointmentDateTime.toLocalTime();
            LocalTime breakStart = doctor.getBreakStartTime();
            LocalTime breakEnd = doctor.getBreakEndTime();

            if (!appointmentTime.isBefore(breakStart) && !appointmentTime.isAfter(breakEnd)) {
                log.warn("Appointment booking validation failed - Doctor {} appointment time {} falls during break time ({} to {})", 
                        doctor.getId(), appointmentTime, breakStart, breakEnd);
                throw new AppointmentException(
                    String.format("Appointment cannot be booked during break time: %s to %s", 
                        breakStart, breakEnd));
            }
        }
        log.debug("Doctor {} break time validation passed - Appointment time is not during break", doctor.getId());
    }

    /**
     * Validation 4: Check max patients per day limit
     */
    private void validateMaxPatientsPerDay(Doctor doctor, LocalDateTime appointmentDateTime) {
        long appointmentCount = appointmentRepository.countAppointmentsByDoctorAndDate(
                doctor.getId(), appointmentDateTime);

        if (appointmentCount >= doctor.getMaxPatientsPerDay()) {
            throw new AppointmentException(
                String.format("Doctor has reached maximum patients limit (%d) for this day",
                    doctor.getMaxPatientsPerDay()));
        }
    }

    /**
     * Validation 5: No duplicate booking (same patient, same doctor, same date)
     */
    private void validateNoDuplicateBooking(Long patientId, Long doctorId, 
                                           LocalDateTime appointmentDateTime) {
        Optional<Appointment> existingAppointment = 
                appointmentRepository.findByPatientIdAndDoctorIdAndAppointmentDate(
                    patientId, doctorId, appointmentDateTime);

        if (existingAppointment.isPresent()) {
            throw new AppointmentException(
                "Patient already has an appointment with this doctor at the specified date/time");
        }
    }

    /**
     * Generate token number for the appointment (sequential based on day)
     */
    private int generateTokenNumber(Doctor doctor, LocalDateTime appointmentDateTime) {
        Optional<Integer> maxToken = appointmentRepository
                .findMaxTokenNumberByDoctorAndDate(doctor.getId(), appointmentDateTime);

        return maxToken.map(token -> token + 1).orElse(1);
    }

    /**
     * Generate all available time slots for a doctor on a specific date
     */
    private List<LocalDateTime> generateDaySlots(Doctor doctor, LocalDateTime date) {
        List<LocalDateTime> slots = new java.util.ArrayList<>();
        LocalTime currentTime = doctor.getShiftStartTime();
        LocalTime shiftEnd = doctor.getShiftEndTime();
        LocalTime breakStart = doctor.getBreakStartTime();
        LocalTime breakEnd = doctor.getBreakEndTime();

        while (currentTime.isBefore(shiftEnd)) {
            // Skip break time if configured
            if (breakStart != null && breakEnd != null) {
                if (!currentTime.isBefore(breakStart) && currentTime.isBefore(breakEnd)) {
                    currentTime = breakEnd;
                    continue;
                }
            }

            LocalDateTime slotDateTime = date.withHour(currentTime.getHour())
                    .withMinute(currentTime.getMinute())
                    .withSecond(0)
                    .withNano(0);
            slots.add(slotDateTime);

            currentTime = currentTime.plusMinutes(APPOINTMENT_DURATION_MINUTES);
        }

        return slots;
    }

    // ==================== MAPPER METHOD ====================

    /**
     * Map Appointment entity to AppointmentResponse DTO
     */
    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setTokenNumber(appointment.getTokenNumber());
        response.setStatus(appointment.getStatus().toString());
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());

        // Set nested objects (lazy loaded)
        if (appointment.getPatient() != null) {
            AppointmentResponse.PatientInfo patientInfo = new AppointmentResponse.PatientInfo();
            patientInfo.setId(appointment.getPatient().getId());
            patientInfo.setFirstName(appointment.getPatient().getFirstName());
            patientInfo.setLastName(appointment.getPatient().getLastName());
            patientInfo.setPhoneNumber(appointment.getPatient().getPhoneNumber());
            response.setPatient(patientInfo);
        }

        if (appointment.getDoctor() != null) {
            AppointmentResponse.DoctorInfo doctorInfo = new AppointmentResponse.DoctorInfo();
            doctorInfo.setId(appointment.getDoctor().getId());
            doctorInfo.setName(appointment.getDoctor().getName());
            doctorInfo.setSpecialization(appointment.getDoctor().getSpecialization());
            response.setDoctor(doctorInfo);
        }

        return response;
    }
}
