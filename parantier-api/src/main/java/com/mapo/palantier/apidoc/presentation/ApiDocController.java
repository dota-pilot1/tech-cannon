package com.mapo.palantier.apidoc.presentation;

import com.mapo.palantier.apidoc.application.ApiDocService;
import com.mapo.palantier.apidoc.domain.ApiDocBlock;
import com.mapo.palantier.apidoc.domain.ApiDocCategory;
import com.mapo.palantier.apidoc.domain.ApiDocSection;
import com.mapo.palantier.apidoc.dto.ApiDocBlockDto;
import com.mapo.palantier.apidoc.dto.ApiDocCategoryRequest;
import com.mapo.palantier.apidoc.dto.ApiDocReorderRequest.ReorderItem;
import com.mapo.palantier.apidoc.dto.ApiDocSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "API 문서 테스터", description = "API 문서 및 테스트 관리")
@RestController
@RequestMapping("/api/api-doc")
@RequiredArgsConstructor
public class ApiDocController {

    private final ApiDocService apiDocService;

    // ──────────────────────────────────────────
    // Category - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<ApiDocCategory>> getCategories() {
        return ResponseEntity.ok(apiDocService.getCategories());
    }

    // ──────────────────────────────────────────
    // Category - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody ApiDocCategoryRequest req
    ) {
        apiDocService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody ApiDocCategoryRequest req
    ) {
        apiDocService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        apiDocService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody List<ReorderItem> items
    ) {
        apiDocService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Section - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<ApiDocSection>> getSections(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(apiDocService.getSectionsByCategoryId(id));
    }

    // ──────────────────────────────────────────
    // Section - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(
        @RequestBody ApiDocSectionRequest req
    ) {
        apiDocService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
        @PathVariable Long id,
        @RequestBody ApiDocSectionRequest req
    ) {
        apiDocService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        apiDocService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
        @RequestBody List<ReorderItem> items
    ) {
        apiDocService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Block - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<ApiDocBlock>> getBlocks(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(apiDocService.getBlocksBySectionId(id));
    }

    // ──────────────────────────────────────────
    // Block - 저장 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 블록 저장 (전체 교체) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<ApiDocBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        apiDocService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
