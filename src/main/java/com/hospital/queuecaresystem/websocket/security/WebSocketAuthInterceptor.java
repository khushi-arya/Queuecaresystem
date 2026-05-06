package com.hospital.queuecaresystem.websocket.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket authentication interceptor using JWT tokens
 * 
 * Validates JWT tokens before allowing WebSocket handshake.
 * Extracts user information and stores in WebSocket session attributes.
 * 
 * Token format: Authorization header with "Bearer <token>"
 * 
 * Thread-safe: HandshakeInterceptor is called per-connection
 * 
 * @author QueueCare System
 */
@Component
@Slf4j
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    @Value("${jwt.secret:your-secret-key-change-in-production}")
    private String jwtSecret;

    /**
     * Validate JWT token before WebSocket handshake
     * 
     * Extracts token from Authorization header
     * Validates JWT signature and expiration
     * Stores user info in session attributes for later use
     * 
     * @param request HTTP request with Authorization header
     * @param response HTTP response
     * @param wsHandler WebSocket handler
     * @param attributes Map to store session attributes
     * @return true if handshake should proceed, false to reject
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, 
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler, 
                                   Map<String, Object> attributes) {
        
        log.debug("WebSocket handshake initiated from: {}", request.getRemoteAddress());
        
        try {
            // Extract JWT token from Authorization header
            String token = extractTokenFromRequest(request);
            
            if (token == null || token.isEmpty()) {
                log.warn("WebSocket connection rejected - No JWT token provided");
                return false;
            }
            
            // Validate JWT token
            Claims claims = validateAndParseToken(token);
            
            if (claims == null) {
                log.warn("WebSocket connection rejected - Invalid JWT token");
                return false;
            }
            
            // Extract user information
            String userId = claims.getSubject();
            String userRole = (String) claims.get("role");
            String username = (String) claims.get("username");
            
            // Store in session attributes for use in handlers
            attributes.put("userId", userId);
            attributes.put("userRole", userRole);
            attributes.put("username", username);
            
            log.info("WebSocket connection authenticated for user: {} (ID: {})", username, userId);
            return true;
            
        } catch (Exception e) {
            log.warn("WebSocket authentication error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, 
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler, 
                               Exception exception) {
        
        if (exception == null) {
            log.debug("WebSocket handshake completed successfully");
        } else {
            log.error("WebSocket handshake failed: {}", exception.getMessage());
        }
    }

    /**
     * Extract JWT token from Authorization header
     * 
     * Expected format: "Authorization: Bearer <token>"
     * 
     * @param request HTTP request
     * @return JWT token or null if not found
     */
    private String extractTokenFromRequest(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst("Authorization");
        
        if (authHeader == null || authHeader.isEmpty()) {
            return null;
        }
        
        if (!authHeader.startsWith("Bearer ")) {
            log.warn("Invalid Authorization header format");
            return null;
        }
        
        return authHeader.substring(7); // Remove "Bearer " prefix
    }

    /**
     * Validate and parse JWT token
     * 
     * Checks:
     * - Token signature is valid
     * - Token has not expired
     * - Token is properly formatted
     * 
     * @param token JWT token
     * @return Claims if valid, null if invalid
     */
    private Claims validateAndParseToken(String token) {
        try {
            Claims claims = Jwts.parser()
    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
    .build()
    .parseSignedClaims(token)
    .getPayload();
            
            log.debug("JWT token validated successfully for user: {}", claims.getSubject());
            return claims;
            
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return null;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid JWT token format: {}", e.getMessage());
            return null;
        }
    }
}
