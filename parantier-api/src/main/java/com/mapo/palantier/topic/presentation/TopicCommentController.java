package com.mapo.palantier.topic.presentation;

import com.mapo.palantier.topic.application.TopicCommentService;
import com.mapo.palantier.topic.domain.TopicComment;
import com.mapo.palantier.topic.presentation.dto.TopicCommentRequest;
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

@Tag(name = "Topic 댓글", description = "토픽 댓글 관리 API")
@RestController
@RequestMapping("/api/topics/{topicId}/comments")
@RequiredArgsConstructor
public class TopicCommentController {

    private final TopicCommentService topicCommentService;

    @Operation(summary = "댓글 목록 조회")
    @GetMapping
    public ResponseEntity<List<TopicComment>> getComments(
        @PathVariable Long topicId
    ) {
        return ResponseEntity.ok(topicCommentService.getComments(topicId));
    }

    @Operation(summary = "댓글 작성")
    @PostMapping
    public ResponseEntity<Long> createComment(
        @PathVariable Long topicId,
        @Validated @RequestBody TopicCommentRequest req,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(topicCommentService.createComment(topicId, req, userId));
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable Long topicId,
        @PathVariable Long id
    ) {
        topicCommentService.deleteComment(id);
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
