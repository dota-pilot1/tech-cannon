package com.mapo.palantier.meeting.presentation;

import com.mapo.palantier.meeting.application.MeetingChatService;
import com.mapo.palantier.meeting.domain.MeetingChatMessageWithUser;
import com.mapo.palantier.websocket.PureWebSocketHandler;
import java.util.List;
import java.util.Map;
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
    private final PureWebSocketHandler webSocketHandler;

    public MeetingChatController(
        MeetingChatService meetingChatService,
        PureWebSocketHandler webSocketHandler
    ) {
        this.meetingChatService = meetingChatService;
        this.webSocketHandler = webSocketHandler;
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

    /**
     * GET /api/meeting/chat/activity?minutes=30
     * 채널별 최근 N분간 메시지 수 집계
     */
    @GetMapping("/chat/activity")
    public ResponseEntity<Map<Long, Integer>> getChannelActivity(
        @RequestParam(defaultValue = "30") int minutes,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
            meetingChatService.getRecentActivityCounts(minutes)
        );
    }

    /**
     * GET /api/meeting/channels/participant-counts
     * 채널별 현재 참가자수 조회 (초기 스냅샷용)
     */
    @GetMapping("/channels/participant-counts")
    public ResponseEntity<Map<Long, Integer>> getChannelParticipantCounts(
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
            webSocketHandler.getMeetingChannelParticipantCounts()
        );
    }
}
