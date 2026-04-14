package com.mapo.palantier.skillcore.presentation;

import com.mapo.palantier.skillcore.application.SkillCoreDocService;
import com.mapo.palantier.skillcore.domain.SkillCoreBlock;
import com.mapo.palantier.skillcore.domain.SkillCoreCategory;
import com.mapo.palantier.skillcore.domain.SkillCoreSection;
import com.mapo.palantier.skillcore.dto.SkillCoreBlockDto;
import com.mapo.palantier.skillcore.dto.SkillCoreCategoryRequest;
import com.mapo.palantier.skillcore.dto.SkillCoreReorderRequest.ReorderItem;
import com.mapo.palantier.skillcore.dto.SkillCoreSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SkillCore", description = "SkillCore 문서 관리 API")
@RestController
@RequestMapping("/api/skillcore-doc")
@RequiredArgsConstructor
public class SkillCoreDocController {

    private final SkillCoreDocService skillCoreDocService;

    @Operation(summary = "SkillCore 카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<SkillCoreCategory>> getCategories() {
        return ResponseEntity.ok(skillCoreDocService.getCategories());
    }

    @Operation(summary = "SkillCore 카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(@RequestBody SkillCoreCategoryRequest req) {
        skillCoreDocService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable Long id, @RequestBody SkillCoreCategoryRequest req) {
        skillCoreDocService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        skillCoreDocService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<ReorderItem> items) {
        skillCoreDocService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<SkillCoreSection>> getSections(@PathVariable Long id) {
        return ResponseEntity.ok(skillCoreDocService.getSectionsByCategoryId(id));
    }

    @Operation(summary = "SkillCore 섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(@RequestBody SkillCoreSectionRequest req) {
        skillCoreDocService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(@PathVariable Long id, @RequestBody SkillCoreSectionRequest req) {
        skillCoreDocService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        skillCoreDocService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(@RequestBody List<ReorderItem> items) {
        skillCoreDocService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SkillCore 섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<SkillCoreBlock>> getBlocks(@PathVariable Long id) {
        return ResponseEntity.ok(skillCoreDocService.getBlocksBySectionId(id));
    }

    @Operation(summary = "SkillCore 섹션 블록 저장 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<SkillCoreBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        skillCoreDocService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
