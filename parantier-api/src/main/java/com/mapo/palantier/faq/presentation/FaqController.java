package com.mapo.palantier.faq.presentation;

import com.mapo.palantier.faq.application.FaqService;
import com.mapo.palantier.faq.domain.FaqBlock;
import com.mapo.palantier.faq.domain.FaqCategory;
import com.mapo.palantier.faq.domain.FaqSection;
import com.mapo.palantier.faq.dto.FaqBlockDto;
import com.mapo.palantier.faq.dto.FaqCategoryRequest;
import com.mapo.palantier.faq.dto.FaqReorderRequest;
import com.mapo.palantier.faq.dto.FaqReorderRequest.ReorderItem;
import com.mapo.palantier.faq.dto.FaqSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "FAQ", description = "FAQ 관리 API")
@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    // ──────────────────────────────────────────
    // Category - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<FaqCategory>> getCategories() {
        return ResponseEntity.ok(faqService.getCategories());
    }

    // ──────────────────────────────────────────
    // Category - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody FaqCategoryRequest req
    ) {
        faqService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody FaqCategoryRequest req
    ) {
        faqService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        faqService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody List<ReorderItem> items
    ) {
        faqService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Section - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<FaqSection>> getSections(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.getSectionsByCategoryId(id));
    }

    // ──────────────────────────────────────────
    // Section - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(
        @RequestBody FaqSectionRequest req
    ) {
        faqService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
        @PathVariable Long id,
        @RequestBody FaqSectionRequest req
    ) {
        faqService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        faqService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
        @RequestBody List<ReorderItem> items
    ) {
        faqService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Block - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<FaqBlock>> getBlocks(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.getBlocksBySectionId(id));
    }

    // ──────────────────────────────────────────
    // Block - 저장 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 블록 저장 (전체 교체) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<FaqBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        faqService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
