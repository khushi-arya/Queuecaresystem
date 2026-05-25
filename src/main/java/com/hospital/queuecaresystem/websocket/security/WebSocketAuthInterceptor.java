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

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
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
            
            // Extract user information from standard JWT claims
            String userId = claims.getSubject();  // "sub" claim - standard JWT subject
            String userEmail = (String) claims.get("email");  // Optional email claim
            String userRole = (String) claims.get("role");
            
            // Validate that userId (subject) is present - this is required
            if (userId == null || userId.isEmpty()) {
                log.warn("WebSocket connection rejected - JWT token has no subject (userId)");
                return false;
            }
            
            // Use email for display if available, otherwise fall back to userId
            String username = (userEmail != null && !userEmail.isEmpty()) ? userEmail : userId;
            
            // Store non-null values in session attributes for use in handlers
            attributes.put("userId", userId);
            attributes.put("username", username);
            
            // Only add role if it's present (optional claim)
            if (userRole != null && !userRole.isEmpty()) {
                attributes.put("userRole", userRole);
            }
            
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
     * Extract JWT token from Authorization header or query parameter
     * 
     * Tries multiple sources:
     * 1. Authorization header: "Authorization: Bearer <token>"
     * 2. Query parameter: ?token=<token>
     * 3. STOMP passcode header (fallback for STOMP clients)
     * 
     * This supports both direct HTTP headers and SockJS/STOMP connections
     * where headers may not be directly accessible.
     * 
     * @param request HTTP request
     * @return JWT token or null if not found
     */
    private String extractTokenFromRequest(ServerHttpRequest request) {
        // Try Authorization header first
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && !authHeader.isEmpty()) {
            if (authHeader.startsWith("Bearer ")) {
                log.debug("Token extracted from Authorization header");
                return authHeader.substring(7); // Remove "Bearer " prefix
            }
            log.warn("Invalid Authorization header format");
        }
        
        // Try query parameter (for SockJS compatibility)
        String uri = request.getURI().toString();
        log.debug("WebSocket request URI: {}", uri);
        
        if (uri.contains("token=")) {
            int tokenIndex = uri.indexOf("token=") + 6;
            int endIndex = uri.indexOf("&", tokenIndex);
            if (endIndex == -1) {
                endIndex = uri.length();
            }
            String token = uri.substring(tokenIndex, endIndex);
            if (!token.isEmpty()) {
                try {
                    // URL-decode the token since it's sent as a query parameter
                    token = URLDecoder.decode(token, StandardCharsets.UTF_8);
                    log.debug("Token extracted from query parameter (URL decoded)");
                    return token;
                } catch (Exception e) {
                    log.error("Error decoding URL-encoded token: {}", e.getMessage());
                    return null;
                }
            }
        }
        
        // Try passcode header (STOMP connect header)
        String passcode = request.getHeaders().getFirst("passcode");
        if (passcode != null && !passcode.isEmpty()) {
            log.debug("Token extracted from passcode header");
            return passcode;
        }
        
        log.debug("No JWT token found in request. URI: {}", uri);
        return null;
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
