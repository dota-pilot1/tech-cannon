package com.mapo.palantier.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // SimpleBroker heartbeat: 서버 10초마다 ping, 클라이언트 10초마다 기대
        config
            .enableSimpleBroker("/topic", "/queue")
            .setHeartbeatValue(new long[] { 10000, 10000 });

        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
    }

    @Override
    public void configureWebSocketTransport(
        WebSocketTransportRegistration registration
    ) {
        registration
            .setMessageSizeLimit(128 * 1024) // 128KB
            .setSendBufferSizeLimit(512 * 1024) // 512KB
            .setSendTimeLimit(20 * 1000); // 20초
    }
}
