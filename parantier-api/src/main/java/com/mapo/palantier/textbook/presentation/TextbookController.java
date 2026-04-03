package com.mapo.palantier.textbook.presentation;

import com.mapo.palantier.textbook.application.TextbookService;
import com.mapo.palantier.textbook.domain.TextbookBlock;
import com.mapo.palantier.textbook.domain.TextbookCategory;
import com.mapo.palantier.textbook.domain.TextbookSection;
import com.mapo.palantier.textbook.dto.TextbookBlockDto;
import com.mapo.palantier.textbook.dto.TextbookCategoryRequest;
import com.mapo.palantier.textbook.dto.TextbookReorderRequest;
import com.mapo.palantier.textbook.dto.TextbookSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "교과서 문서", description = "교과서 문서 관리 API")
@RestController
@RequestMapping("/api/textbook")
@RequiredArgsConstructor
public class TextbookController {

    private final TextbookService textbookService;

    // ──────────────────────────────────────────
    // Category - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<TextbookCategory>> getCategories() {
        return ResponseEntity.ok(textbookService.getCategories());
    }

    // ──────────────────────────────────────────
    // Category - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody TextbookCategoryRequest req
    ) {
        textbookService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody TextbookCategoryRequest req
    ) {
        textbookService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        textbookService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody TextbookReorderRequest req
    ) {
        textbookService.reorderCategories(req.getItems());
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Section - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<TextbookSection>> getSections(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(
            textbookService.getSectionsByCategoryId(id)
        );
    }

    // ──────────────────────────────────────────
    // Section - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(@RequestBody TextbookSectionRequest req) {
        textbookService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
        @PathVariable Long id,
        @RequestBody TextbookSectionRequest req
    ) {
        textbookService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        textbookService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
        @RequestBody TextbookReorderRequest req
    ) {
        textbookService.reorderSections(req.getItems());
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Block - 조회 (인증 필요)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<TextbookBlock>> getBlocks(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(textbookService.getBlocksBySectionId(id));
    }

    // ──────────────────────────────────────────
    // Block - 저장 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "섹션 블록 저장 (전체 교체) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<TextbookBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        textbookService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
