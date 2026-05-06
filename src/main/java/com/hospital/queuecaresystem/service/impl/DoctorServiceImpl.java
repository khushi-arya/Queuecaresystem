package com.hospital.queuecaresystem.service.impl;

import com.hospital.queuecaresystem.dto.DoctorRequest;
import com.hospital.queuecaresystem.dto.DoctorResponse;
import com.hospital.queuecaresystem.entity.Doctor;
import com.hospital.queuecaresystem.entity.Doctor.DoctorStatus;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.repository.DoctorRepository;
import com.hospital.queuecaresystem.repository.UserRepository;
import com.hospital.queuecaresystem.service.DoctorService;
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
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    @Override
    public DoctorResponse createDoctor(Long userId, DoctorRequest doctorRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (doctorRepository.existsByUserId(userId)) {
            throw new IllegalArgumentException("Doctor profile already exists for this user");
        }

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setName(doctorRequest.getName());
        doctor.setSpecialization(doctorRequest.getSpecialization());
        doctor.setShiftStartTime(doctorRequest.getShiftStartTime());
        doctor.setShiftEndTime(doctorRequest.getShiftEndTime());
        doctor.setBreakStartTime(doctorRequest.getBreakStartTime());
        doctor.setBreakEndTime(doctorRequest.getBreakEndTime());
        doctor.setMaxPatientsPerDay(doctorRequest.getMaxPatientsPerDay());
        doctor.setStatus(doctorRequest.getStatus() != null ? doctorRequest.getStatus() : DoctorStatus.ACTIVE);

        Doctor savedDoctor = doctorRepository.save(doctor);
        return mapToResponse(savedDoctor);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found with ID: " + doctorId));
        return mapToResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("Doctor profile not found for user ID: " + userId));
        return mapToResponse(doctor);
    }

    @Override
    public DoctorResponse updateDoctor(Long doctorId, DoctorRequest doctorRequest) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found with ID: " + doctorId));

        doctor.setName(doctorRequest.getName());
        doctor.setSpecialization(doctorRequest.getSpecialization());
        doctor.setShiftStartTime(doctorRequest.getShiftStartTime());
        doctor.setShiftEndTime(doctorRequest.getShiftEndTime());
        doctor.setBreakStartTime(doctorRequest.getBreakStartTime());
        doctor.setBreakEndTime(doctorRequest.getBreakEndTime());
        doctor.setMaxPatientsPerDay(doctorRequest.getMaxPatientsPerDay());
        if (doctorRequest.getStatus() != null) {
            doctor.setStatus(doctorRequest.getStatus());
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return mapToResponse(updatedDoctor);
    }

    @Override
    public void deleteDoctor(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new UserNotFoundException("Doctor not found with ID: " + doctorId);
        }
        doctorRepository.deleteById(doctorId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctorsBySpecialization(String specialization, Pageable pageable) {
        return doctorRepository.findBySpecialization(specialization, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctorsByStatus(DoctorStatus status, Pageable pageable) {
        return doctorRepository.findByStatus(status, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getActiveDoctorsBySpecialization(String specialization, Pageable pageable) {
        return doctorRepository.findBySpecializationAndStatus(specialization, DoctorStatus.ACTIVE, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public DoctorResponse updateDoctorStatus(Long doctorId, DoctorStatus status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found with ID: " + doctorId));
        doctor.setStatus(status);
        Doctor updatedDoctor = doctorRepository.save(doctor);
        return mapToResponse(updatedDoctor);
    }

    /**
     * Map Doctor entity to DoctorResponse DTO
     */
    private DoctorResponse mapToResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getShiftStartTime(),
                doctor.getShiftEndTime(),
                doctor.getBreakStartTime(),
                doctor.getBreakEndTime(),
                doctor.getMaxPatientsPerDay(),
                doctor.getStatus(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        );
    }
}
