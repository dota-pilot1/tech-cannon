package com.mapo.palantier.config;

import com.mapo.palantier.websocket.PureWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final PureWebSocketHandler pureWebSocketHandler;

    public WebSocketConfig(PureWebSocketHandler pureWebSocketHandler) {
        this.pureWebSocketHandler = pureWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
            .addHandler(pureWebSocketHandler, "/ws")
            .setAllowedOriginPatterns("*");
    }
}
