package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.entity.DoctorToken;
import com.hospital.queuecaresystem.service.DoctorTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for doctor token generation.
 * 
 * Endpoints:
 * - POST /api/tokens/generate - Generate next token for a doctor
 * - GET /api/tokens/verify - Verify if a token is valid
 */
@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
public class TokenController {
    
    private final DoctorTokenService doctorTokenService;
    
    /**
     * Generate the next token for a doctor.
     * Tokens are unique per doctor per day and auto-increment.
     * 
     * @param doctorId the doctor's ID
     * @return generated token response
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateToken(@RequestParam Long doctorId) {
        try {
            DoctorToken token = doctorTokenService.generateNextToken(doctorId, LocalDate.now());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token.getTokenValue());
            response.put("doctorId", token.getDoctorId());
            response.put("date", token.getGenerationDate());
            response.put("sequence", token.getSequenceNumber());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }
    
    /**
     * Verify if a token is valid for a specific doctor and date.
     * 
     * @param doctorId doctor identifier
     * @param tokenValue token string to verify
     * @return verification result
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(
            @RequestParam Long doctorId,
            @RequestParam String tokenValue) {
        
        LocalDate today = LocalDate.now();
        boolean isValid = doctorTokenService.isValidToken(doctorId, today, tokenValue);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("doctorId", doctorId);
        response.put("token", tokenValue);
        response.put("date", today);
        
        return ResponseEntity.ok(response);
    }
}
