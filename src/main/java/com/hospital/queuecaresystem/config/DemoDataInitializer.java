package com.hospital.queuecaresystem.config;

import com.hospital.queuecaresystem.entity.Role;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes demo users for testing purposes.
 * Creates demo patient, doctor, and admin users if they don't already exist.
 */
@Component
@AllArgsConstructor
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEMO_PASSWORD = "password123";

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting demo data initialization...");

        try {
            // Create demo patient user
            createDemoUser("patient@example.com", Role.PATIENT);

            // Create demo doctor user
            createDemoUser("doctor@example.com", Role.DOCTOR);

            // Create demo admin user
            createDemoUser("admin@example.com", Role.ADMIN);

            log.info("Demo data initialization completed successfully.");
        } catch (Exception e) {
            log.error("Error during demo data initialization", e);
            throw e;
        }
    }

    private void createDemoUser(String email, Role role) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            log.debug("User with email {} already exists. Skipping creation.", email);
            return;
        }

        try {
            // Create new user
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            user.setRole(role);

            // Save to database
            User savedUser = userRepository.save(user);
            log.info("Demo {} user successfully created. User ID: {}, Email: {}", 
                    role.name(), savedUser.getId(), savedUser.getEmail());

        } catch (Exception e) {
            log.error("Error creating demo user with email {}", email, e);
            throw e;
        }
    }
}
