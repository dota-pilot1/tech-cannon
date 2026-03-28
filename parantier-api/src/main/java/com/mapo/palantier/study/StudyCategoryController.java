package com.mapo.palantier.study;

import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "스터디 카테고리", description = "스터디 카테고리 관리 API")
@RestController
@RequestMapping("/api/study/categories")
@RequiredArgsConstructor
public class StudyCategoryController {

    private final StudyCategoryService studyCategoryService;

    @Operation(summary = "카테고리 트리 전체 조회")
    @GetMapping
    public ResponseEntity<List<StudyCategory>> getCategoryTree() {
        return ResponseEntity.ok(studyCategoryService.getCategoryTree());
    }

    @Operation(summary = "카테고리 생성 (관리자 또는 일반 사용자)")
    @PostMapping
    public ResponseEntity<Long> createCategory(
        @RequestBody StudyCategoryRequest req,
        Authentication auth
    ) {
        return ResponseEntity.ok(studyCategoryService.createCategory(req));
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
}
