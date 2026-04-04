package com.mapo.palantier.hackathon.presentation;

import com.mapo.palantier.hackathon.application.HackathonEventService;
import com.mapo.palantier.hackathon.dto.CreateEventRequest;
import com.mapo.palantier.hackathon.dto.HackathonEventResponse;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hackathon")
public class HackathonEventController {

    private final HackathonEventService hackathonEventService;

    public HackathonEventController(HackathonEventService hackathonEventService) {
        this.hackathonEventService = hackathonEventService;
    }

    /**
     * GET /api/hackathon/events/active
     * 활성 이벤트 단건 조회 (팀 + 멤버 포함)
     */
    @GetMapping("/events/active")
    public ResponseEntity<?> getActiveEvent(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        HackathonEventResponse response = hackathonEventService.getActiveEvent();
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/hackathon/events
     * 전체 이벤트 목록 조회
     */
    @GetMapping("/events")
    public ResponseEntity<List<HackathonEventResponse>> getAllEvents(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonEventService.getAllEvents());
    }

    /**
     * POST /api/hackathon/events
     * 이벤트 생성 (ADMIN 전용)
     */
    @PostMapping("/events")
    public ResponseEntity<?> createEvent(
        @RequestBody CreateEventRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(403).build();
        }
        Long id = hackathonEventService.createEvent(req);
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * PUT /api/hackathon/events/{id}
     * 이벤트 수정 (ADMIN 전용)
     */
    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(
        @PathVariable Long id,
        @RequestBody CreateEventRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(403).build();
        }
        hackathonEventService.updateEvent(id, req);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
