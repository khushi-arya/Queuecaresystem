package com.hospital.queuecaresystem.controller;

import com.hospital.queuecaresystem.dto.PromotionResponse;
import com.hospital.queuecaresystem.entity.User;
import com.hospital.queuecaresystem.exception.UserAlreadyDoctorException;
import com.hospital.queuecaresystem.exception.UserNotFoundException;
import com.hospital.queuecaresystem.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
@Slf4j
public class AdminController {

    private final UserService userService;

    /**
     * Promote a user from PATIENT to DOCTOR role
     * Only accessible by ADMIN users
     *
     * @param userId The ID of the user to promote
     * @return PromotionResponse with promotion details
     */
    @PutMapping("/promote/{userId}")
    public ResponseEntity<?> promoteUserToDoctor(@PathVariable Long userId) {
        log.info("Admin promotion request for user ID: {}", userId);

        try {
            User promotedUser = userService.promoteToDoctor(userId);
            
            PromotionResponse response = new PromotionResponse(
                    promotedUser.getId(),
                    promotedUser.getEmail(),
                    null,  // Previous role will be PATIENT, but we don't have it here
                    promotedUser.getRole()
            );

            log.info("User {} successfully promoted to DOCTOR by admin", userId);
            return ResponseEntity.ok(response);

        } catch (UserNotFoundException e) {
            log.warn("Promotion failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new PromotionResponse() {{
                        setMessage("User not found with id: " + userId);
                    }});

        } catch (UserAlreadyDoctorException e) {
            log.warn("Promotion failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new PromotionResponse() {{
                        setMessage("User is already promoted to DOCTOR role");
                    }});

        } catch (Exception e) {
            log.error("Unexpected error during promotion for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PromotionResponse() {{
                        setMessage("An unexpected error occurred during promotion");
                    }});
        }
    }
}
