package com.mapo.palantier.meeting.presentation;

import com.mapo.palantier.meeting.application.MeetingChatService;
import com.mapo.palantier.meeting.domain.MeetingChatMessageWithUser;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meeting")
public class MeetingChatController {

    private final MeetingChatService meetingChatService;

    public MeetingChatController(MeetingChatService meetingChatService) {
        this.meetingChatService = meetingChatService;
    }

    /**
     * GET /api/meeting/chat/messages?channelId=1&limit=100
     * 채널별 최근 메시지 목록 조회
     */
    @GetMapping("/chat/messages")
    public ResponseEntity<List<MeetingChatMessageWithUser>> getRecentMessages(
        @RequestParam(defaultValue = "1") long channelId,
        @RequestParam(defaultValue = "100") int limit,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        List<MeetingChatMessageWithUser> messages =
            meetingChatService.getRecentMessages(channelId, limit);
        return ResponseEntity.ok(messages);
    }
}
