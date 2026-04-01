package com.mapo.palantier.meeting.presentation;

import com.mapo.palantier.meeting.application.MeetingChannelService;
import com.mapo.palantier.meeting.domain.MeetingChannel;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meeting/channels")
public class MeetingChannelController {

    private final MeetingChannelService meetingChannelService;

    public MeetingChannelController(MeetingChannelService meetingChannelService) {
        this.meetingChannelService = meetingChannelService;
    }

    // -----------------------------------------------------------------------
    // Request DTOs
    // -----------------------------------------------------------------------

    static class CreateRequest {
        public String name;
    }

    static class UpdateRequest {
        public String name;
        public int orderNum;
    }

    static class ReorderItem {
        public Long id;
        public int orderNum;
    }

    static class ReorderRequest {
        public List<ReorderItem> items;
    }

    // -----------------------------------------------------------------------
    // Endpoints
    // -----------------------------------------------------------------------

    /**
     * GET /api/meeting/channels
     * 활성 채널 전체 목록 조회 (인증된 사용자 모두 허용)
     */
    @GetMapping
    public ResponseEntity<List<MeetingChannel>> getChannels(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(meetingChannelService.getAll());
    }

    /**
     * POST /api/meeting/channels
     * 채널 생성 (ADMIN 전용)
     * slug는 name 기반으로 자동 생성
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MeetingChannel> createChannel(
            @RequestBody CreateRequest request,
            Authentication authentication) {

        String slug = generateSlug(request.name);

        // orderNum 기본값: 현재 목록 크기 + 1
        int orderNum = meetingChannelService.getAll().size() + 1;

        MeetingChannel created = meetingChannelService.create(request.name, slug, orderNum);
        return ResponseEntity.ok(created);
    }

    /**
     * PUT /api/meeting/channels/{id}
     * 채널 수정 (ADMIN 전용)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateChannel(
            @PathVariable Long id,
            @RequestBody UpdateRequest request,
            Authentication authentication) {

        meetingChannelService.update(id, request.name, request.orderNum);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/meeting/channels/{id}
     * 채널 삭제 (ADMIN 전용)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteChannel(
            @PathVariable Long id,
            Authentication authentication) {

        meetingChannelService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/meeting/channels/reorder
     * 채널 순서 일괄 변경 (ADMIN 전용)
     */
    @PutMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderChannels(
            @RequestBody ReorderRequest request,
            Authentication authentication) {

        List<Map<String, Object>> orders = request.items.stream()
                .map(item -> Map.<String, Object>of(
                        "id", item.id,
                        "orderNum", item.orderNum))
                .collect(Collectors.toList());

        meetingChannelService.reorder(orders);
        return ResponseEntity.ok().build();
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * name을 기반으로 slug 자동 생성
     * 예) "회의실 A" → "회의실a"
     */
    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9가-힣]", "")
                .replaceAll("\\s+", "-");
    }
}
