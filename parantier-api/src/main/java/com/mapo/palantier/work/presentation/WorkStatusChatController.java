package com.mapo.palantier.work.presentation;

import com.mapo.palantier.work.application.WorkStatusChatService;
import com.mapo.palantier.work.domain.WorkStatusChatMessageWithUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/work-status/chat")
public class WorkStatusChatController {

    private final WorkStatusChatService workStatusChatService;

    public WorkStatusChatController(WorkStatusChatService workStatusChatService) {
        this.workStatusChatService = workStatusChatService;
    }

    /**
     * GET /api/work-status/chat/messages?limit=100
     * 업무 현황 공용 채팅방 최근 메시지 목록 조회
     */
    @GetMapping("/messages")
    public ResponseEntity<List<WorkStatusChatMessageWithUser>> getRecentMessages(
            @RequestParam(defaultValue = "100") int limit,
            Authentication authentication
    ) {
        // 인증 확인
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        List<WorkStatusChatMessageWithUser> messages = workStatusChatService.getRecentMessages(limit);
        return ResponseEntity.ok(messages);
    }
}
