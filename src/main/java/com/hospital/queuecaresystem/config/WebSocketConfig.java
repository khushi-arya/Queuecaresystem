package com.hospital.queuecaresystem.config;

import com.hospital.queuecaresystem.websocket.security.WebSocketAuthInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for real-time queue updates using STOMP protocol.
 * 
 * This configuration enables:
 * - STOMP protocol for real-time messaging
 * - Topic-based broadcasting for queue updates
 * - User-specific queue for personal notifications
 * - JWT authentication for WebSocket connections
 * - Production-ready CORS configuration
 * 
 * Features:
 * - Authentication via HandshakeInterceptor (JWT validation)
 * - SockJS fallback for browsers without WebSocket support
 * - Configurable allowed origins (from application.yml)
 * - Proper destination prefixes for pub/sub messaging
 * 
 * @author QueueCare System
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor authInterceptor;
    
    @Value("${websocket.allowed-origins:http://localhost:3000,http://localhost:4200,http://localhost:5173}")
    private String allowedOrigins;

    /**
     * Configure STOMP endpoints for WebSocket connections
     * 
     * Endpoint: ws://localhost:8080/ws
     * 
     * Configuration:
     * - Registers JWT authentication interceptor
     * - Sets allowed origins from application properties
     * - Enables SockJS fallback for older browsers
     * - Configures session cookie handling
     * 
     * Security:
     * - JWT token validation via WebSocketAuthInterceptor
     * - Only specified origins allowed (configurable)
     * - User context extracted and available in session
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registering WebSocket STOMP endpoints");
        
        String[] origins = allowedOrigins.split(",");
        log.info("Allowed WebSocket origins: {}", allowedOrigins);
        
        registry
    .addEndpoint("/ws")
    .addInterceptors(authInterceptor)
    .setAllowedOrigins(origins)
    .withSockJS()
        .setSessionCookieNeeded(true);
        
        log.info("WebSocket endpoint registered: /ws with {} allowed origin(s)", origins.length);
    }

    /**
     * Configure message broker for pub/sub messaging
     * 
     * - /topic/* : Broadcast messages to all subscribers
     * - /queue/* : Personal messages to specific users
     * - /app/* : Application destination prefix for @MessageMapping
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        log.info("Configuring message broker");
        
        // Enable simple broker for /topic and /queue destinations
        registry.enableSimpleBroker(
            "/topic",      // Broadcast destination - queue updates
            "/queue"       // Personal destination - patient notifications
        );
        
        // Set the destination prefix for @MessageMapping annotated methods
        registry.setApplicationDestinationPrefixes("/app");
        
        // Set the prefix for user-specific messages
        registry.setUserDestinationPrefix("/user");
        
        log.info("Message broker configured with brokers: /topic, /queue");
        log.info("Application destination prefix: /app");
        log.info("User destination prefix: /user");
    }
}
