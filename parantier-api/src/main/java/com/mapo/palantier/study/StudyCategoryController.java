package com.mapo.palantier.study;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "스터디 카테고리", description = "스터디 카테고리 관리 API")
@RestController
@RequestMapping("/api/study/categories")
@RequiredArgsConstructor
public class StudyCategoryController {

    private final StudyCategoryService studyCategoryService;

    @Operation(
        summary = "카테고리 트리 전체 조회 (ownerId=null이면 공용, 있으면 개인)"
    )
    @GetMapping
    public ResponseEntity<List<StudyCategory>> getCategoryTree(
        @RequestParam(required = false) Long ownerId
    ) {
        return ResponseEntity.ok(studyCategoryService.getCategoryTree(ownerId));
    }

    @Operation(summary = "카테고리 생성 (관리자 또는 일반 사용자)")
    @PostMapping
    public ResponseEntity<Long> createCategory(
        @RequestBody StudyCategoryRequest req,
        Authentication auth
    ) {
        Long authorId = getUserIdFromAuthOrNull(auth);
        return ResponseEntity.ok(
            studyCategoryService.createCategory(req, authorId)
        );
    }

    @Operation(summary = "카테고리 수정 (관리자 또는 일반 사용자)")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody StudyCategoryRequest req,
        Authentication auth
    ) {
        studyCategoryService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 삭제 (비활성화, 관리자 또는 일반 사용자)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
        @PathVariable Long id,
        Authentication auth
    ) {
        studyCategoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
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
