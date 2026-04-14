package com.mapo.palantier.topic.presentation;

import com.mapo.palantier.topic.application.TopicService;
import com.mapo.palantier.topic.domain.Topic;
import com.mapo.palantier.topic.presentation.dto.TopicRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "Topic", description = "토픽 게시판 API")
@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @Operation(summary = "토픽 목록 조회")
    @GetMapping
    public ResponseEntity<List<Topic>> getTopics(
        @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(topicService.getTopics(keyword));
    }

    @Operation(summary = "토픽 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopic(@PathVariable Long id) {
        return topicService.getTopic(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "토픽을 찾을 수 없습니다"));
    }

    @Operation(summary = "토픽 생성")
    @PostMapping
    public ResponseEntity<Long> createTopic(
        @Validated @RequestBody TopicRequest req,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(topicService.createTopic(req, userId));
    }

    @Operation(summary = "토픽 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTopic(
        @PathVariable Long id,
        @Validated @RequestBody TopicRequest req
    ) {
        topicService.updateTopic(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "토픽 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "토픽 고정/해제")
    @PostMapping("/{id}/pin")
    public ResponseEntity<Void> togglePin(@PathVariable Long id) {
        topicService.togglePin(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다");
        }
        try {
            return (Long) auth.getPrincipal();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 인증 정보입니다");
        }
    }
}
