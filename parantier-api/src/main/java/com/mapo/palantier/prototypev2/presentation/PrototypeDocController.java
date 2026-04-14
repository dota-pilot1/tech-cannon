package com.mapo.palantier.prototypev2.presentation;

import com.mapo.palantier.prototypev2.application.PrototypeDocService;
import com.mapo.palantier.prototypev2.domain.PrototypeBlock;
import com.mapo.palantier.prototypev2.domain.PrototypeCategory;
import com.mapo.palantier.prototypev2.domain.PrototypeSection;
import com.mapo.palantier.prototypev2.dto.PrototypeBlockDto;
import com.mapo.palantier.prototypev2.dto.PrototypeCategoryRequest;
import com.mapo.palantier.prototypev2.dto.PrototypeReorderRequest.ReorderItem;
import com.mapo.palantier.prototypev2.dto.PrototypeSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Prototype v2", description = "Prototype v2 문서 관리 API")
@RestController
@RequestMapping("/api/prototype-doc")
@RequiredArgsConstructor
public class PrototypeDocController {

    private final PrototypeDocService prototypeDocService;

    @Operation(summary = "Prototype 카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<PrototypeCategory>> getCategories() {
        return ResponseEntity.ok(prototypeDocService.getCategories());
    }

    @Operation(summary = "Prototype 카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(@RequestBody PrototypeCategoryRequest req) {
        prototypeDocService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable Long id, @RequestBody PrototypeCategoryRequest req) {
        prototypeDocService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        prototypeDocService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<ReorderItem> items) {
        prototypeDocService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<PrototypeSection>> getSections(@PathVariable Long id) {
        return ResponseEntity.ok(prototypeDocService.getSectionsByCategoryId(id));
    }

    @Operation(summary = "Prototype 섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(@RequestBody PrototypeSectionRequest req) {
        prototypeDocService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(@PathVariable Long id, @RequestBody PrototypeSectionRequest req) {
        prototypeDocService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        prototypeDocService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(@RequestBody List<ReorderItem> items) {
        prototypeDocService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Prototype 섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<PrototypeBlock>> getBlocks(@PathVariable Long id) {
        return ResponseEntity.ok(prototypeDocService.getBlocksBySectionId(id));
    }

    @Operation(summary = "Prototype 섹션 블록 저장 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<PrototypeBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        prototypeDocService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
