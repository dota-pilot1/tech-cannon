package com.mapo.palantier.devops.presentation;

import com.mapo.palantier.devops.application.DevOpsDocService;
import com.mapo.palantier.devops.domain.DevOpsBlock;
import com.mapo.palantier.devops.domain.DevOpsCategory;
import com.mapo.palantier.devops.domain.DevOpsSection;
import com.mapo.palantier.devops.dto.DevOpsBlockDto;
import com.mapo.palantier.devops.dto.DevOpsCategoryRequest;
import com.mapo.palantier.devops.dto.DevOpsReorderRequest.ReorderItem;
import com.mapo.palantier.devops.dto.DevOpsSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "DevOps", description = "DevOps 문서 관리 API")
@RestController
@RequestMapping("/api/devops-doc")
@RequiredArgsConstructor
public class DevOpsDocController {

    private final DevOpsDocService devOpsDocService;

    @Operation(summary = "DevOps 카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<DevOpsCategory>> getCategories() {
        return ResponseEntity.ok(devOpsDocService.getCategories());
    }

    @Operation(summary = "DevOps 카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(@RequestBody DevOpsCategoryRequest req) {
        devOpsDocService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable Long id, @RequestBody DevOpsCategoryRequest req) {
        devOpsDocService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        devOpsDocService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<ReorderItem> items) {
        devOpsDocService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<DevOpsSection>> getSections(@PathVariable Long id) {
        return ResponseEntity.ok(devOpsDocService.getSectionsByCategoryId(id));
    }

    @Operation(summary = "DevOps 섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(@RequestBody DevOpsSectionRequest req) {
        devOpsDocService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(@PathVariable Long id, @RequestBody DevOpsSectionRequest req) {
        devOpsDocService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        devOpsDocService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(@RequestBody List<ReorderItem> items) {
        devOpsDocService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "DevOps 섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<DevOpsBlock>> getBlocks(@PathVariable Long id) {
        return ResponseEntity.ok(devOpsDocService.getBlocksBySectionId(id));
    }

    @Operation(summary = "DevOps 섹션 블록 저장 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<DevOpsBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        devOpsDocService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
