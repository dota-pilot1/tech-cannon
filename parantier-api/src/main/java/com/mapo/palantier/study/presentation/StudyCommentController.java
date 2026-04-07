package com.mapo.palantier.study.presentation;

import com.mapo.palantier.study.application.StudyCommentService;
import com.mapo.palantier.study.domain.StudyComment;
import com.mapo.palantier.study.presentation.dto.StudyCommentRequest;
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

@Tag(name = "스터디 댓글", description = "스터디 댓글 관리 API")
@RestController
@RequestMapping("/api/study/posts/{postId}/comments")
@RequiredArgsConstructor
public class StudyCommentController {

    private final StudyCommentService studyCommentService;

    @Operation(summary = "댓글 목록 조회")
    @GetMapping
    public ResponseEntity<List<StudyComment>> getComments(
        @PathVariable Long postId
    ) {
        return ResponseEntity.ok(studyCommentService.getComments(postId));
    }

    @Operation(summary = "댓글 작성")
    @PostMapping
    public ResponseEntity<Long> createComment(
        @PathVariable Long postId,
        @Validated @RequestBody StudyCommentRequest req,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(
            studyCommentService.createComment(postId, req, userId)
        );
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable Long postId,
        @PathVariable Long id
    ) {
        studyCommentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "로그인이 필요합니다"
            );
        }
        try {
            return (Long) auth.getPrincipal();
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "유효하지 않은 인증 정보입니다"
            );
        }
    }
}
