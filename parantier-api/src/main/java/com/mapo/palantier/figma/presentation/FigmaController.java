package com.mapo.palantier.figma.presentation;

import com.mapo.palantier.figma.application.FigmaService;
import com.mapo.palantier.figma.domain.FigmaCategory;
import com.mapo.palantier.figma.domain.FigmaLink;
import com.mapo.palantier.figma.dto.FigmaCategoryRequest;
import com.mapo.palantier.figma.dto.FigmaLinkRequest;
import com.mapo.palantier.figma.dto.FigmaReorderRequest.ReorderItem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Figma", description = "Figma 링크 관리 API")
@RestController
@RequestMapping("/api/figma")
@RequiredArgsConstructor
public class FigmaController {

    private final FigmaService figmaService;

    // ──────────────────────────────────────────
    // Category - 조회 (인증 없이 가능)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<FigmaCategory>> getCategories() {
        return ResponseEntity.ok(figmaService.getCategories());
    }

    // ──────────────────────────────────────────
    // Category - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody FigmaCategoryRequest req
    ) {
        figmaService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody FigmaCategoryRequest req
    ) {
        figmaService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        figmaService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody List<ReorderItem> items
    ) {
        figmaService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Link - 조회 (인증 없이 가능)
    // ──────────────────────────────────────────

    @Operation(summary = "카테고리별 링크 목록 조회")
    @GetMapping("/categories/{id}/links")
    public ResponseEntity<List<FigmaLink>> getLinks(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(figmaService.getLinks(id));
    }

    // ──────────────────────────────────────────
    // Link - 관리 (ADMIN 전용)
    // ──────────────────────────────────────────

    @Operation(summary = "링크 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/links")
    public ResponseEntity<Void> createLink(
        @RequestBody FigmaLinkRequest req
    ) {
        figmaService.createLink(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "링크 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/links/{id}")
    public ResponseEntity<Void> updateLink(
        @PathVariable Long id,
        @RequestBody FigmaLinkRequest req
    ) {
        figmaService.updateLink(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "링크 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/links/{id}")
    public ResponseEntity<Void> deleteLink(@PathVariable Long id) {
        figmaService.deleteLink(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "링크 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/links/reorder")
    public ResponseEntity<Void> reorderLinks(
        @RequestBody List<ReorderItem> items
    ) {
        figmaService.reorderLinks(items);
        return ResponseEntity.ok().build();
    }
}
