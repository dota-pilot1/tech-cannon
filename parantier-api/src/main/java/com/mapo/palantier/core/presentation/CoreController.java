package com.mapo.palantier.core.presentation;

import com.mapo.palantier.core.application.CoreService;
import com.mapo.palantier.core.domain.CoreBlock;
import com.mapo.palantier.core.domain.CoreCategory;
import com.mapo.palantier.core.domain.CoreSection;
import com.mapo.palantier.core.dto.CoreBlockDto;
import com.mapo.palantier.core.dto.CoreCategoryRequest;
import com.mapo.palantier.core.dto.CoreReorderRequest.ReorderItem;
import com.mapo.palantier.core.dto.CoreSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Core", description = "Core 페이지 관리 API")
@RestController
@RequestMapping("/api/core")
@RequiredArgsConstructor
public class CoreController {

    private final CoreService coreService;

    // ──────────────────────────────────────────
    // Category - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "Core 카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<CoreCategory>> getCategories() {
        return ResponseEntity.ok(coreService.getCategories());
    }

    // ──────────────────────────────────────────
    // Category - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "Core 카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody CoreCategoryRequest req
    ) {
        coreService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Core 카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody CoreCategoryRequest req
    ) {
        coreService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Core 카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        coreService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Core 카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody List<ReorderItem> items
    ) {
        coreService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Section - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "Core 카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<CoreSection>> getSections(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(coreService.getSectionsByCategoryId(id));
    }

    // ──────────────────────────────────────────
    // Section - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "Core 섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(
        @RequestBody CoreSectionRequest req
    ) {
        coreService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Core 섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
        @PathVariable Long id,
        @RequestBody CoreSectionRequest req
    ) {
        coreService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Core 섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        coreService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Core 섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
        @RequestBody List<ReorderItem> items
    ) {
        coreService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Block - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "Core 섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<CoreBlock>> getBlocks(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(coreService.getBlocksBySectionId(id));
    }

    // ──────────────────────────────────────────
    // Block - 저장 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "Core 섹션 블록 저장 (전체 교체) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<CoreBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        coreService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
