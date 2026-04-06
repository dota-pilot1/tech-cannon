package com.mapo.palantier.hackathon.presentation;

import com.mapo.palantier.hackathon.application.HackathonDocService;
import com.mapo.palantier.hackathon.domain.HackathonDocBlock;
import com.mapo.palantier.hackathon.domain.HackathonDocCategory;
import com.mapo.palantier.hackathon.domain.HackathonDocSection;
import com.mapo.palantier.hackathon.dto.HackathonDocBlockDto;
import com.mapo.palantier.hackathon.dto.HackathonDocCategoryRequest;
import com.mapo.palantier.hackathon.dto.HackathonDocReorderRequest;
import com.mapo.palantier.hackathon.dto.HackathonDocSectionRequest;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hackathon")
@RequiredArgsConstructor
public class HackathonDocController {

    private final HackathonDocService hackathonDocService;

    // ──────────────────────────────────────────
    // Category
    // ──────────────────────────────────────────

    /**
     * GET /api/hackathon/teams/{teamId}/doc/categories
     */
    @GetMapping("/teams/{teamId}/doc/categories")
    public ResponseEntity<List<HackathonDocCategory>> getCategories(
        @PathVariable Long teamId,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonDocService.getCategories(teamId));
    }

    /**
     * POST /api/hackathon/teams/{teamId}/doc/categories
     */
    @PostMapping("/teams/{teamId}/doc/categories")
    public ResponseEntity<?> createCategory(
        @PathVariable Long teamId,
        @RequestBody HackathonDocCategoryRequest req,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        Long id = hackathonDocService.createCategory(teamId, req.getName());
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * PUT /api/hackathon/teams/{teamId}/doc/categories/{categoryId}
     */
    @PutMapping("/teams/{teamId}/doc/categories/{categoryId}")
    public ResponseEntity<?> updateCategory(
        @PathVariable Long teamId,
        @PathVariable Long categoryId,
        @RequestBody HackathonDocCategoryRequest req,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonDocService.updateCategory(categoryId, req.getName());
        return ResponseEntity.ok(
            Map.of("message", "카테고리가 수정되었습니다.")
        );
    }

    /**
     * DELETE /api/hackathon/teams/{teamId}/doc/categories/{categoryId}
     */
    @DeleteMapping("/teams/{teamId}/doc/categories/{categoryId}")
    public ResponseEntity<?> deleteCategory(
        @PathVariable Long teamId,
        @PathVariable Long categoryId,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonDocService.deleteCategory(categoryId);
        return ResponseEntity.ok(
            Map.of("message", "카테고리가 삭제되었습니다.")
        );
    }

    /**
     * PUT /api/hackathon/teams/{teamId}/doc/categories/reorder
     */
    @PutMapping("/teams/{teamId}/doc/categories/reorder")
    public ResponseEntity<?> reorderCategories(
        @PathVariable Long teamId,
        @RequestBody HackathonDocReorderRequest req,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonDocService.reorderCategories(req.getItems());
        return ResponseEntity.ok(
            Map.of("message", "카테고리 순서가 변경되었습니다.")
        );
    }

    // ──────────────────────────────────────────
    // Section
    // ──────────────────────────────────────────

    /**
     * GET /api/hackathon/doc/categories/{categoryId}/sections
     */
    @GetMapping("/doc/categories/{categoryId}/sections")
    public ResponseEntity<List<HackathonDocSection>> getSections(
        @PathVariable Long categoryId,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonDocService.getSections(categoryId));
    }

    /**
     * POST /api/hackathon/doc/categories/{categoryId}/sections
     */
    @PostMapping("/doc/categories/{categoryId}/sections")
    public ResponseEntity<?> createSection(
        @PathVariable Long categoryId,
        @RequestBody HackathonDocSectionRequest req,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        Long id = hackathonDocService.createSection(
            categoryId,
            req.getTeamId(),
            req.getTitle()
        );
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * PUT /api/hackathon/doc/sections/{sectionId}
     */
    @PutMapping("/doc/sections/{sectionId}")
    public ResponseEntity<?> updateSection(
        @PathVariable Long sectionId,
        @RequestBody HackathonDocSectionRequest req,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonDocService.updateSection(sectionId, req.getTitle());
        return ResponseEntity.ok(Map.of("message", "섹션이 수정되었습니다."));
    }

    /**
     * DELETE /api/hackathon/doc/sections/{sectionId}
     */
    @DeleteMapping("/doc/sections/{sectionId}")
    public ResponseEntity<?> deleteSection(
        @PathVariable Long sectionId,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonDocService.deleteSection(sectionId);
        return ResponseEntity.ok(Map.of("message", "섹션이 삭제되었습니다."));
    }

    /**
     * PUT /api/hackathon/doc/categories/{categoryId}/sections/reorder
     */
    @PutMapping("/doc/categories/{categoryId}/sections/reorder")
    public ResponseEntity<?> reorderSections(
        @PathVariable Long categoryId,
        @RequestBody HackathonDocReorderRequest req,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonDocService.reorderSections(req.getItems());
        return ResponseEntity.ok(
            Map.of("message", "섹션 순서가 변경되었습니다.")
        );
    }

    // ──────────────────────────────────────────
    // Block
    // ──────────────────────────────────────────

    /**
     * GET /api/hackathon/doc/sections/{sectionId}/blocks
     */
    @GetMapping("/doc/sections/{sectionId}/blocks")
    public ResponseEntity<List<HackathonDocBlock>> getBlocks(
        @PathVariable Long sectionId,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonDocService.getBlocks(sectionId));
    }

    /**
     * PUT /api/hackathon/doc/sections/{sectionId}/blocks
     */
    @PutMapping("/doc/sections/{sectionId}/blocks")
    public ResponseEntity<?> saveBlocks(
        @PathVariable Long sectionId,
        @RequestBody List<HackathonDocBlockDto> blocks,
        Authentication auth
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonDocService.saveBlocks(sectionId, blocks);
        return ResponseEntity.ok(Map.of("message", "블록이 저장되었습니다."));
    }
}
