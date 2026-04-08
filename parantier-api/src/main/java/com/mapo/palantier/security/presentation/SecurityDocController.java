package com.mapo.palantier.security.presentation;

import com.mapo.palantier.security.application.SecurityDocService;
import com.mapo.palantier.security.domain.SecurityBlock;
import com.mapo.palantier.security.domain.SecurityCategory;
import com.mapo.palantier.security.domain.SecuritySection;
import com.mapo.palantier.security.dto.SecurityBlockDto;
import com.mapo.palantier.security.dto.SecurityCategoryRequest;
import com.mapo.palantier.security.dto.SecurityReorderRequest.ReorderItem;
import com.mapo.palantier.security.dto.SecuritySectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Security", description = "Security 문서 관리 API")
@RestController
@RequestMapping("/api/security-doc")
@RequiredArgsConstructor
public class SecurityDocController {

    private final SecurityDocService securityDocService;

    @Operation(summary = "Security 카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<SecurityCategory>> getCategories() {
        return ResponseEntity.ok(securityDocService.getCategories());
    }

    @Operation(summary = "Security 카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
        @RequestBody SecurityCategoryRequest req
    ) {
        securityDocService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
        @PathVariable Long id,
        @RequestBody SecurityCategoryRequest req
    ) {
        securityDocService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        securityDocService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
        @RequestBody List<ReorderItem> items
    ) {
        securityDocService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<SecuritySection>> getSections(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(securityDocService.getSectionsByCategoryId(id));
    }

    @Operation(summary = "Security 섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(
        @RequestBody SecuritySectionRequest req
    ) {
        securityDocService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
        @PathVariable Long id,
        @RequestBody SecuritySectionRequest req
    ) {
        securityDocService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        securityDocService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
        @RequestBody List<ReorderItem> items
    ) {
        securityDocService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Security 섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<SecurityBlock>> getBlocks(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(securityDocService.getBlocksBySectionId(id));
    }

    @Operation(summary = "Security 섹션 블록 저장 (전체 교체) [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<SecurityBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        securityDocService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
