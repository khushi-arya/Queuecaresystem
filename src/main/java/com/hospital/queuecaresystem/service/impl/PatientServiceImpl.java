package com.hospital.queuecaresystem.service.impl;

import com.hospital.queuecaresystem.dto.PatientRequest;
import com.hospital.queuecaresystem.dto.PatientResponse;
import com.hospital.queuecaresystem.entity.Patient;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.repository.PatientRepository;
import com.hospital.queuecaresystem.repository.UserRepository;
import com.hospital.queuecaresystem.service.PatientService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Override
    public PatientResponse createPatient(Long userId, PatientRequest patientRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (patientRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("Patient profile already exists for this user");
        }

        // Check if phone number is already used
        if (patientRepository.findByPhoneNumber(patientRequest.getPhoneNumber()).isPresent()) {
            throw new IllegalArgumentException("Phone number is already registered");
        }

        Patient patient = new Patient();
        patient.setUser(user);
        patient.setFirstName(patientRequest.getFirstName());
        patient.setLastName(patientRequest.getLastName());
        patient.setPhoneNumber(patientRequest.getPhoneNumber());

        Patient savedPatient = patientRepository.save(patient);
        return mapToResponse(savedPatient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new UserNotFoundException("Patient not found with ID: " + patientId));
        return mapToResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("Patient profile not found for user ID: " + userId));
        return mapToResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientByPhoneNumber(String phoneNumber) {
        Patient patient = patientRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UserNotFoundException("Patient not found with phone number: " + phoneNumber));
        return mapToResponse(patient);
    }

    @Override
    public PatientResponse updatePatient(Long patientId, PatientRequest patientRequest) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new UserNotFoundException("Patient not found with ID: " + patientId));

        // Check if new phone number is already used by another patient
        if (!patient.getPhoneNumber().equals(patientRequest.getPhoneNumber())) {
            if (patientRepository.findByPhoneNumber(patientRequest.getPhoneNumber()).isPresent()) {
                throw new IllegalArgumentException("Phone number is already registered");
            }
        }

        patient.setFirstName(patientRequest.getFirstName());
        patient.setLastName(patientRequest.getLastName());
        patient.setPhoneNumber(patientRequest.getPhoneNumber());

        Patient updatedPatient = patientRepository.save(patient);
        return mapToResponse(updatedPatient);
    }

    @Override
    public void deletePatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new UserNotFoundException("Patient not found with ID: " + patientId);
        }
        patientRepository.deleteById(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getPatientsByFirstName(String firstName, Pageable pageable) {
        return patientRepository.findByFirstNameIgnoreCase(firstName, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getPatientsByLastName(String lastName, Pageable pageable) {
        return patientRepository.findByLastNameIgnoreCase(lastName, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getPatientsByFullName(String firstName, String lastName, Pageable pageable) {
        return patientRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(firstName, lastName, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Map Patient entity to PatientResponse DTO
     */
    private PatientResponse mapToResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getUser().getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhoneNumber(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
        );
    }
}
