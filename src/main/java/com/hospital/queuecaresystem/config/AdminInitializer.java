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
 * Initializes the default admin user at application startup.
 * Creates admin@hospital.com if it doesn't already exist.
 */
@Component
@AllArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@hospital.com";
    private static final String ADMIN_PASSWORD = "admin123";

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting admin user initialization...");

        try {
            // Check if admin user already exists
            if (userRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
                log.info("Admin user with email {} already exists. Skipping creation.", ADMIN_EMAIL);
                return;
            }

            // Create new admin user
            User adminUser = new User();
            adminUser.setEmail(ADMIN_EMAIL);
            adminUser.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            adminUser.setRole(Role.ADMIN);

            // Save to database
            User savedAdmin = userRepository.save(adminUser);
            log.info("Admin user successfully created. User ID: {}, Email: {}", savedAdmin.getId(), savedAdmin.getEmail());

        } catch (Exception e) {
            log.error("Error during admin user initialization", e);
            throw e;
        }
    }
}
