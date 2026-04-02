package com.mapo.palantier.study;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "스터디 게시글", description = "스터디 게시글 관리 API")
@RestController
@RequestMapping("/api/study/posts")
@RequiredArgsConstructor
public class StudyPostController {

    private final StudyPostService studyPostService;

    @Operation(
        summary = "카테고리별 게시글 목록 조회 (isPublic=false이면 개인 노트만)"
    )
    @GetMapping
    public ResponseEntity<List<StudyPost>> getPosts(
        @RequestParam Long categoryId,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Boolean isPublic,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuthOrNull(auth);
        return ResponseEntity.ok(
            studyPostService.getPostsByCategory(
                categoryId,
                userId,
                keyword,
                isPublic
            )
        );
    }

    @Operation(summary = "게시글 상세 조회 (조회수 +1)")
    @GetMapping("/{id}")
    public ResponseEntity<StudyPost> getPost(
        @PathVariable Long id,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuthOrNull(auth);
        return ResponseEntity.ok(studyPostService.getPost(id, userId));
    }

    @Operation(summary = "게시글 생성")
    @PostMapping
    public ResponseEntity<Long> createPost(
        @RequestBody StudyPostRequest req,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(studyPostService.createPost(req, userId));
    }

    @Operation(summary = "게시글 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(
        @PathVariable Long id,
        @RequestBody StudyPostRequest req,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        studyPostService.updatePost(id, req, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        studyPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "게시글 상단 고정 토글")
    @PostMapping("/{id}/pin")
    public ResponseEntity<Void> togglePin(@PathVariable Long id) {
        studyPostService.togglePin(id);
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

    private Long getUserIdFromAuthOrNull(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        try {
            return (Long) auth.getPrincipal();
        } catch (Exception e) {
            return null;
        }
    }
}
