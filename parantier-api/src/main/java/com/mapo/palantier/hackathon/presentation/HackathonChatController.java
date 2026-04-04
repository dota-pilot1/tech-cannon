package com.mapo.palantier.hackathon.presentation;

import com.mapo.palantier.hackathon.application.HackathonChatService;
import com.mapo.palantier.hackathon.domain.HackathonChatMessage;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hackathon")
public class HackathonChatController {

    private final HackathonChatService hackathonChatService;

    public HackathonChatController(HackathonChatService hackathonChatService) {
        this.hackathonChatService = hackathonChatService;
    }

    /**
     * GET /api/hackathon/events/{eventId}/chat?limit=50
     * 이벤트별 최근 채팅 메시지 목록 조회
     */
    @GetMapping("/events/{eventId}/chat")
    public ResponseEntity<List<HackathonChatMessage>> getRecentMessages(
        @PathVariable Long eventId,
        @RequestParam(defaultValue = "50") int limit,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
            hackathonChatService.getRecentMessages(eventId, limit)
        );
    }
}
