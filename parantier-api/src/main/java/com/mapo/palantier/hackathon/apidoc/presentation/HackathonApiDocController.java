package com.mapo.palantier.hackathon.apidoc.presentation;

import com.mapo.palantier.apidoc.domain.ApiDocBlock;
import com.mapo.palantier.apidoc.domain.ApiDocCategory;
import com.mapo.palantier.apidoc.domain.ApiDocSection;
import com.mapo.palantier.apidoc.dto.ApiDocBlockDto;
import com.mapo.palantier.apidoc.dto.ApiDocCategoryRequest;
import com.mapo.palantier.apidoc.dto.ApiDocReorderRequest.ReorderItem;
import com.mapo.palantier.apidoc.dto.ApiDocSectionRequest;
import com.mapo.palantier.hackathon.apidoc.application.HackathonApiDocService;
import com.mapo.palantier.user.domain.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hackathon/teams/{teamId}/api-doc")
@RequiredArgsConstructor
public class HackathonApiDocController {

    private final HackathonApiDocService hackathonApiDocService;

    // ── Category ──

    @GetMapping("/categories")
    public ResponseEntity<List<ApiDocCategory>> getCategories(@PathVariable Long teamId) {
        return ResponseEntity.ok(hackathonApiDocService.getCategoriesByTeam(teamId));
    }

    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(
            @PathVariable Long teamId,
            @RequestBody ApiDocCategoryRequest req,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.createCategory(teamId, req);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(
            @PathVariable Long teamId,
            @PathVariable Long id,
            @RequestBody ApiDocCategoryRequest req,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long teamId,
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(
            @PathVariable Long teamId,
            @RequestBody List<ReorderItem> items,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.reorderCategories(teamId, items);
        return ResponseEntity.ok().build();
    }

    // ── Section ──

    @GetMapping("/categories/{categoryId}/sections")
    public ResponseEntity<List<ApiDocSection>> getSections(
            @PathVariable Long teamId,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(hackathonApiDocService.getSectionsByCategoryId(categoryId));
    }

    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(
            @PathVariable Long teamId,
            @RequestBody ApiDocSectionRequest req,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(
            @PathVariable Long teamId,
            @PathVariable Long id,
            @RequestBody ApiDocSectionRequest req,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(
            @PathVariable Long teamId,
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(
            @PathVariable Long teamId,
            @RequestBody List<ReorderItem> items,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        hackathonApiDocService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    // ── Block ──

    @GetMapping("/sections/{sectionId}/blocks")
    public ResponseEntity<List<ApiDocBlock>> getBlocks(
            @PathVariable Long teamId,
            @PathVariable Long sectionId) {
        return ResponseEntity.ok(hackathonApiDocService.getBlocksBySectionId(sectionId));
    }

    @PutMapping("/sections/{sectionId}/blocks")
    public ResponseEntity<Void> saveBlocks(
            @PathVariable Long teamId,
            @PathVariable Long sectionId,
            @RequestBody List<ApiDocBlockDto> blocks,
            @AuthenticationPrincipal User user) {
        Long userId = (user != null) ? user.getId() : null;
        hackathonApiDocService.saveBlocks(sectionId, blocks, userId);
        return ResponseEntity.ok().build();
    }
}
