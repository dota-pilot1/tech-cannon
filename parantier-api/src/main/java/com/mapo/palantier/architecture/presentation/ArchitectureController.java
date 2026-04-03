package com.mapo.palantier.architecture.presentation;

import com.mapo.palantier.architecture.application.ArchitectureService;
import com.mapo.palantier.architecture.domain.ArchitectureBlock;
import com.mapo.palantier.architecture.domain.ArchitectureCategory;
import com.mapo.palantier.architecture.domain.ArchitectureSection;
import com.mapo.palantier.architecture.dto.BlockDto;
import com.mapo.palantier.architecture.dto.CategoryRequest;
import com.mapo.palantier.architecture.dto.ReorderRequest;
import com.mapo.palantier.architecture.dto.SectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "아키텍처 문서", description = "아키텍처 문서 관리 API")
@RestController
@RequestMapping("/api/architecture")
@RequiredArgsConstructor
public class ArchitectureController {

    private final ArchitectureService architectureService;

    // ──────────────────────────────────────────
    // Category - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<ArchitectureCategory>> getCategories() {
        return ResponseEntity.ok(architectureService.getCategories());
    }

    // ──────────────────────────────────────────
    // Category - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody CategoryRequest req
    ) {
        architectureService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody CategoryRequest req
    ) {
        architectureService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        architectureService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody ReorderRequest req
    ) {
        architectureService.reorderCategories(req.getItems());
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Section - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<ArchitectureSection>> getSections(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(
            architectureService.getSectionsByCategoryId(id)
        );
    }

    // ──────────────────────────────────────────
    // Section - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(@RequestBody SectionRequest req) {
        architectureService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
        @PathVariable Long id,
        @RequestBody SectionRequest req
    ) {
        architectureService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        architectureService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
        @RequestBody ReorderRequest req
    ) {
        architectureService.reorderSections(req.getItems());
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Block - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<ArchitectureBlock>> getBlocks(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(architectureService.getBlocksBySectionId(id));
    }

    // ──────────────────────────────────────────
    // Block - 저장 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 블록 저장 (전체 교체) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<BlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        architectureService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
