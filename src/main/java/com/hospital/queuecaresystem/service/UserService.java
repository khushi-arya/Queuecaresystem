package com.hospital.queuecaresystem.service;

import com.hospital.queuecaresystem.dto.UserRegisterRequest;
import com.hospital.queuecaresystem.dto.UserUpdateRequest;
import com.hospital.queuecaresystem.dto.UserResponse;
import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.exception.UserAlreadyDoctorException;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.util.StringUtils;

@Service
@AllArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Register a new user
     * Logging:
     * - INFO: Registration attempt and successful registration
     * - WARN: Duplicate email or validation failures
     * - ERROR: Unexpected registration errors
     * - NOTE: Password is NEVER logged for security
     * 
     * @param request UserRegisterRequest containing email and password
     * @return UserResponse with user details (no password)
     * @throws IllegalArgumentException if email already exists
     */
    @Transactional
    public UserResponse registerUser(UserRegisterRequest request) {
        // Log registration attempt (INFO level) - include email but NOT password
        log.info("User registration initiated - Email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("User registration failed - Email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        try {
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(com.hospital.queuecaresystem.entity.Role.PATIENT); // Default role

            User savedUser = userRepository.save(user);
            
            // Log successful registration (INFO level)
            log.info("User registration successful - Email: {}, UserId: {}, Role: PATIENT", 
                    request.getEmail(), savedUser.getId());
            
            return convertToResponse(savedUser);
        } catch (Exception e) {
            log.error("Unexpected error during user registration for email: {}", 
                    request.getEmail(), e);
            throw e;
        }
    }

    /**
     * Get user by ID
     * Logging:
     * - DEBUG: User retrieval (read-only operation)
     * - WARN: User not found
     * 
     * @param id User ID
     * @return UserResponse with user details
     * @throws RuntimeException if user not found
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        log.debug("Fetching user by ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User retrieval failed - User not found with ID: {}", id);
                    return new RuntimeException("User not found with id: " + id);
                });
        
        log.debug("User retrieved successfully - ID: {}, Email: {}, Role: {}", 
                id, user.getEmail(), user.getRole());
        return convertToResponse(user);
    }

    /**
     * Get user by email
     * Logging:
     * - DEBUG: User retrieval (read-only operation)
     * - WARN: User not found
     * 
     * @param email User email
     * @return UserResponse with user details
     * @throws RuntimeException if user not found
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User retrieval failed - User not found with email: {}", email);
                    return new RuntimeException("User not found with email: " + email);
                });
        
        log.debug("User retrieved successfully - Email: {}, UserId: {}, Role: {}", 
                email, user.getId(), user.getRole());
        return convertToResponse(user);
    }

    /**
     * Get all users
     * Logging:
     * - DEBUG: List retrieval with count (read-only operation)
     * 
     * @return List of UserResponse objects
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        log.debug("Fetching all users from database");
        
        List<UserResponse> users = userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        log.debug("Successfully retrieved all users - Total count: {}", users.size());
        return users;
    }

    /**
     * Update user information
     * Logging:
     * - INFO: User update initiated and success
     * - WARN: User not found or duplicate email error
     * - DEBUG: Field change details
     * 
     * @param id User ID
     * @param request UserUpdateRequest with email and/or role
     * @return UserResponse with updated user details
     * @throws RuntimeException if user not found
     */
    @Transactional
    public UserResponse updateUser( Long id, UserUpdateRequest request) {
        log.info("User update initiated - UserId: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User update failed - User not found with ID: {}", id);
                    return new RuntimeException("User not found with id: " + id);
                });

       if (StringUtils.hasText(request.getEmail())) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                log.warn("User update failed - Email already exists: {} (UserId: {})", request.getEmail(), id);
                throw new IllegalArgumentException("Email already exists: " + request.getEmail());
            }
            log.debug("Updating user email - UserId: {}, OldEmail: {}, NewEmail: {}", 
                    id, user.getEmail(), request.getEmail());
            user.setEmail(request.getEmail());
        }

        if (request.getRole() != null) {
            Role previousRole = user.getRole();
            log.debug("Updating user role - UserId: {}, OldRole: {}, NewRole: {}", 
                    id, previousRole, request.getRole());
            user.setRole(request.getRole());
        }

        User updatedUser = userRepository.save(user);
        
        log.info("User update successful - UserId: {}, Email: {}, Role: {}", 
                id, updatedUser.getEmail(), updatedUser.getRole());
        
        return convertToResponse(updatedUser);
    }

    /**
     * Delete user by ID
     * Logging:
     * - INFO: User deletion initiated and success
     * - WARN: User not found
     * 
     * @param id User ID
     * @throws RuntimeException if user not found
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("User deletion initiated - UserId: {}", id);
        
        if (!userRepository.existsById(id)) {
            log.warn("User deletion failed - User not found with ID: {}", id);
            throw new RuntimeException("User not found with id: " + id);
        }
        
        userRepository.deleteById(id);
        log.info("User successfully deleted - UserId: {}", id);
    }

    /**
     * Check if user exists by email
     * Logging:
     * - DEBUG: Existence check (read-only operation)
     * 
     * @param email User email
     * @return true if exists, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean userExists(String email) {
        log.debug("Checking if user exists with email: {}", email);
        boolean exists = userRepository.existsByEmail(email);
        log.debug("User existence check completed - Email: {}, Exists: {}", email, exists);
        return exists;
    }

    /**
     * Get user entity by email (for internal use)
     * Logging:
     * - DEBUG: Entity retrieval (read-only operation, internal use)
     * 
     * @param email User email
     * @return User entity or null if not found
     */
    @Transactional(readOnly = true)
    public User getUserEntityByEmail(String email) {
        log.debug("Fetching user entity by email (internal): {}", email);
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null) {
            log.debug("User entity retrieved - Email: {}, UserId: {}", email, user.getId());
        } else {
            log.debug("User entity not found - Email: {}", email);
        }
        
        return user;
    }

    /**
     * Promote a user to DOCTOR role (Admin only)
     * @param userId User ID to promote
     * @return User entity with updated role
     * @throws UserNotFoundException if user not found
     * @throws UserAlreadyDoctorException if user is already a DOCTOR
     */
    @Transactional
    public User promoteToDoctor(Long userId) {
        log.info("Attempting to promote user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Promotion failed: User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with id: " + userId);
                });

        if (user.getRole() == Role.DOCTOR) {
            log.warn("Promotion failed: User {} is already a DOCTOR", userId);
            throw new UserAlreadyDoctorException("User is already promoted to DOCTOR role");
        }

        Role previousRole = user.getRole();
        user.setRole(Role.DOCTOR);
        User promotedUser = userRepository.save(user);
        
        log.info("User {} successfully promoted from {} to DOCTOR", userId, previousRole);
        
        return promotedUser;
    }

    /**
     * Convert User entity to UserResponse DTO
     * @param user User entity
     * @return UserResponse with id, email, and role (no password)
     */
    private UserResponse convertToResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole());
    }
}
