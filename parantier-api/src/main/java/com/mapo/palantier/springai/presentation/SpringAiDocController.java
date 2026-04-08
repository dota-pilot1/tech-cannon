package com.mapo.palantier.springai.presentation;

import com.mapo.palantier.springai.application.SpringAiDocService;
import com.mapo.palantier.springai.domain.SpringAiBlock;
import com.mapo.palantier.springai.domain.SpringAiCategory;
import com.mapo.palantier.springai.domain.SpringAiSection;
import com.mapo.palantier.springai.dto.SpringAiBlockDto;
import com.mapo.palantier.springai.dto.SpringAiCategoryRequest;
import com.mapo.palantier.springai.dto.SpringAiReorderRequest.ReorderItem;
import com.mapo.palantier.springai.dto.SpringAiSectionRequest;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SpringAI", description = "Spring AI 문서 관리 API")
@RestController
@RequestMapping("/api/springai-doc")
@RequiredArgsConstructor
public class SpringAiDocController {

    private final SpringAiDocService springAiDocService;

    @Operation(summary = "SpringAI 카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<SpringAiCategory>> getCategories() {
        return ResponseEntity.ok(springAiDocService.getCategories());
    }

    @Operation(summary = "SpringAI 카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(@RequestBody SpringAiCategoryRequest req) {
        springAiDocService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable Long id, @RequestBody SpringAiCategoryRequest req) {
        springAiDocService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        springAiDocService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<ReorderItem> items) {
        springAiDocService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<SpringAiSection>> getSections(@PathVariable Long id) {
        return ResponseEntity.ok(springAiDocService.getSectionsByCategoryId(id));
    }

    @Operation(summary = "SpringAI 섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(@RequestBody SpringAiSectionRequest req) {
        springAiDocService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(@PathVariable Long id, @RequestBody SpringAiSectionRequest req) {
        springAiDocService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        springAiDocService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(@RequestBody List<ReorderItem> items) {
        springAiDocService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SpringAI 섹션별 블록 목록 조회")
    @GetMapping("/sections/{id}/blocks")
    public ResponseEntity<List<SpringAiBlock>> getBlocks(@PathVariable Long id) {
        return ResponseEntity.ok(springAiDocService.getBlocksBySectionId(id));
    }

    @Operation(summary = "SpringAI 섹션 블록 저장 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/blocks")
    public ResponseEntity<Void> saveBlocks(
        @PathVariable Long id,
        @RequestBody List<SpringAiBlockDto> blocks,
        @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        springAiDocService.saveBlocks(id, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
