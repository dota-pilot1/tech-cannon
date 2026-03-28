package com.mapo.palantier.study;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "스터디 좋아요", description = "스터디 좋아요 관리 API")
@RestController
@RequestMapping("/api/study/posts/{id}/like")
@RequiredArgsConstructor
public class StudyLikeController {

    private final StudyLikeService studyLikeService;

    @Operation(summary = "좋아요 토글")
    @PostMapping
    public ResponseEntity<StudyLikeResponse> toggleLike(
        @PathVariable Long id,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(studyLikeService.toggleLike(id, userId));
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
