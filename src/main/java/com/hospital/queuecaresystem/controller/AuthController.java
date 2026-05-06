package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.AuthRequest;
import com.hospital.queuecaresystem.dto.AuthResponse;
import com.hospital.queuecaresystem.dto.UserRegisterRequest;
import com.hospital.queuecaresystem.dto.UserResponse;
import com.hospital.queuecaresystem.security.CustomUserDetails;
import com.hospital.queuecaresystem.security.JwtTokenProvider;
import com.hospital.queuecaresystem.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    /**
     * Login endpoint - works for all roles (PATIENT, DOCTOR)
     * Logs authentication attempts, successes, and failures.
     * 
     * Logging:
     * - INFO: Login attempt and successful login
     * - WARN: Failed login attempt
     * - DEBUG: Authentication context setup
     * - NOTE: Passwords are NEVER logged
     * 
     * @param authRequest Email and password (password NOT logged)
     * @return JWT token with user details
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        // Log login attempt (INFO level) - include email but NOT password
        log.info("Login attempt initiated - Email: {}", authRequest.getEmail());

        try {
            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Debug level: authentication context established
            log.debug("Authentication successful in security context - Email: {}", 
                    authRequest.getEmail());

            // Generate JWT token
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);

            // Prepare response (note: token is not logged for security)
            AuthResponse response = new AuthResponse(
                    token,
                    userDetails.getId(),
                    userDetails.getEmail(),
                    userDetails.getRole()
            );

            // Log successful login (INFO level) - include email, userId, and role
            log.info("Login successful - Email: {}, UserId: {}, Role: {}", 
                    authRequest.getEmail(), 
                    userDetails.getId(), 
                    userDetails.getRole());
            
            return ResponseEntity.ok(response);
            
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // Log failed login with invalid credentials (WARN level)
            log.warn("Login failed - Invalid credentials for email: {}", 
                    authRequest.getEmail());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null) {{ 
                        setMessage("Invalid email or password"); 
                    }});
                    
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            // Log user not found (WARN level)
            log.warn("Login failed - User not found for email: {}", 
                    authRequest.getEmail());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null) {{ 
                        setMessage("Invalid email or password"); 
                    }});
                    
        } catch (Exception e) {
            // Log unexpected authentication errors (ERROR level with stack trace)
            log.error("Unexpected error during authentication for email: {}", 
                    authRequest.getEmail(), e);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null) {{ 
                        setMessage("Authentication error. Please try again."); 
                    }});
        }
    }

    /**
     * Register endpoint - creates new user with role assignment
     * Logs registration attempts, successes, and failures.
     * 
     * Logging:
     * - INFO: Registration attempt and successful registration
     * - WARN: Failed registration (duplicate email, validation errors)
     * - ERROR: Unexpected registration errors
     * - NOTE: Passwords are NEVER logged
     * 
     * @param registerRequest Email and password (password NOT logged)
     * @return User details (without password)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody UserRegisterRequest registerRequest) {
        
        // Log registration attempt (INFO level) - include email but NOT password
        log.info("User registration initiated - Email: {}", registerRequest.getEmail());

        try {
            // Register user via service
            UserResponse userResponse = userService.registerUser(registerRequest);
            
            // Prepare response
            AuthResponse response = new AuthResponse();
            response.setUserId(userResponse.getId());
            response.setEmail(userResponse.getEmail());
            response.setRole(userResponse.getRole());
            response.setMessage("User registered successfully. Please login to get token.");

            // Log successful registration (INFO level)
            log.info("User registration successful - Email: {}, UserId: {}, Role: {}", 
                    registerRequest.getEmail(), 
                    userResponse.getId(), 
                    userResponse.getRole());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            // Log validation failures (WARN level)
            log.warn("User registration failed - Validation error for email: {} - Reason: {}", 
                    registerRequest.getEmail(), 
                    e.getMessage());
            
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(null, null, null, null) {{ 
                        setMessage(e.getMessage()); 
                    }});
                    
        } catch (Exception e) {
            // Log unexpected registration errors (ERROR level with stack trace)
            log.error("Unexpected error during user registration for email: {}", 
                    registerRequest.getEmail(), e);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(null, null, null, null) {{ 
                        setMessage("Registration failed. Please try again."); 
                    }});
        }
    }

    /**
     * Get current authenticated user details
     * @return User details from SecurityContext
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Unauthorized attempt to access /me endpoint");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        log.debug("Retrieving user details for: {}", userDetails.getEmail());

        AuthResponse response = new AuthResponse(
                null,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getRole()
        );
        response.setMessage("Current user details");

        return ResponseEntity.ok(response);
    }
}
