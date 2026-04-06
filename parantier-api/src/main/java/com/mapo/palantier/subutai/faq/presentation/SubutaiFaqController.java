package com.mapo.palantier.subutai.faq.presentation;

import com.mapo.palantier.subutai.faq.application.SubutaiFaqService;
import com.mapo.palantier.subutai.faq.domain.SubutaiFaqBlock;
import com.mapo.palantier.subutai.faq.domain.SubutaiFaqCategory;
import com.mapo.palantier.subutai.faq.domain.SubutaiFaqSection;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqBlockDto;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqCategoryRequest;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqReorderRequest.ReorderItem;
import com.mapo.palantier.subutai.faq.dto.SubutaiFaqSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subutai FAQ", description = "Subutai FAQ 관리 API")
@RestController
@RequestMapping("/api/subutai/faq")
@RequiredArgsConstructor
public class SubutaiFaqController {

    private final SubutaiFaqService subutaiFaqService;

    // ──────────────────────────────────────────
    // Category - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<SubutaiFaqCategory>> getCategories() {
        return ResponseEntity.ok(subutaiFaqService.getCategories());
    }

    // ──────────────────────────────────────────
    // Category - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody SubutaiFaqCategoryRequest req
    ) {
        subutaiFaqService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody SubutaiFaqCategoryRequest req
    ) {
        subutaiFaqService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        subutaiFaqService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody List<ReorderItem> items
    ) {
        subutaiFaqService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Section - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<SubutaiFaqSection>> getSections(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(subutaiFaqService.getSectionsByCategoryId(id));
    }

    // ──────────────────────────────────────────
    // Section - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(
        @RequestBody SubutaiFaqSectionRequest req
    ) {
        subutaiFaqService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
        @PathVariable Long id,
        @RequestBody SubutaiFaqSectionRequest req
    ) {
        subutaiFaqService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        subutaiFaqService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
        @RequestBody List<ReorderItem> items
    ) {
        subutaiFaqService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Block - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<SubutaiFaqBlock>> getBlocks(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(subutaiFaqService.getBlocksBySectionId(id));
    }

    // ──────────────────────────────────────────
    // Block - 저장 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 블록 저장 (전체 교체) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<SubutaiFaqBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        subutaiFaqService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
