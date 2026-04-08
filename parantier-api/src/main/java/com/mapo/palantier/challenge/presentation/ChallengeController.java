package com.mapo.palantier.challenge.presentation;

import com.mapo.palantier.challenge.application.ChallengeService;
import com.mapo.palantier.challenge.domain.ChallengeCategory;
import com.mapo.palantier.challenge.domain.ChallengeSection;
import com.mapo.palantier.challenge.domain.ChallengeSubmission;
import com.mapo.palantier.challenge.domain.ChallengeTopic;
import com.mapo.palantier.challenge.dto.ChallengeCategoryRequest;
import com.mapo.palantier.challenge.dto.ChallengeReorderRequest.ReorderItem;
import com.mapo.palantier.challenge.dto.ChallengeSectionRequest;
import com.mapo.palantier.challenge.dto.ChallengeSubmissionRequest;
import com.mapo.palantier.challenge.dto.ChallengeTopicDto;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Challenge", description = "챌린지 관리 API")
@RestController
@RequestMapping("/api/challenge")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    // ── 카테고리 ──

    @Operation(summary = "챌린지 카테고리 목록 조회")
    @GetMapping("/categories")
    public ResponseEntity<List<ChallengeCategory>> getCategories() {
        return ResponseEntity.ok(challengeService.getCategories());
    }

    @Operation(summary = "챌린지 카테고리 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<Void> createCategory(@RequestBody ChallengeCategoryRequest req) {
        challengeService.createCategory(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 카테고리 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable Long id, @RequestBody ChallengeCategoryRequest req) {
        challengeService.updateCategory(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 카테고리 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        challengeService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 카테고리 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/categories/reorder")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<ReorderItem> items) {
        challengeService.reorderCategories(items);
        return ResponseEntity.ok().build();
    }

    // ── 섹션 ──

    @Operation(summary = "챌린지 카테고리별 섹션 목록 조회")
    @GetMapping("/categories/{id}/sections")
    public ResponseEntity<List<ChallengeSection>> getSections(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getSectionsByCategoryId(id));
    }

    @Operation(summary = "챌린지 섹션 생성 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sections")
    public ResponseEntity<Void> createSection(@RequestBody ChallengeSectionRequest req) {
        challengeService.createSection(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 섹션 수정 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}")
    public ResponseEntity<Void> updateSection(@PathVariable Long id, @RequestBody ChallengeSectionRequest req) {
        challengeService.updateSection(id, req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 섹션 삭제 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/sections/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        challengeService.deleteSection(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 섹션 순서 변경 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/reorder")
    public ResponseEntity<Void> reorderSections(@RequestBody List<ReorderItem> items) {
        challengeService.reorderSections(items);
        return ResponseEntity.ok().build();
    }

    // ── 주제 블록 ──

    @Operation(summary = "챌린지 섹션별 주제 블록 조회")
    @GetMapping("/sections/{id}/topics")
    public ResponseEntity<List<ChallengeTopic>> getTopics(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getTopicsBySectionId(id));
    }

    @Operation(summary = "챌린지 주제 블록 저장 [ADMIN]")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sections/{id}/topics")
    public ResponseEntity<Void> saveTopics(
            @PathVariable Long id,
            @RequestBody List<ChallengeTopicDto> topics,
            @AuthenticationPrincipal User user
    ) {
        Long userId = (user != null) ? user.getId() : null;
        challengeService.saveTopics(id, topics, userId);
        return ResponseEntity.ok().build();
    }

    // ── 풀이 제출 ──

    @Operation(summary = "챌린지 섹션별 제출 목록 조회")
    @GetMapping("/sections/{id}/submissions")
    public ResponseEntity<List<ChallengeSubmission>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getSubmissionsBySectionId(id));
    }

    @Operation(summary = "챌린지 풀이 제출")
    @PostMapping("/sections/{id}/submissions")
    public ResponseEntity<Void> createSubmission(
            @PathVariable Long id,
            @RequestBody ChallengeSubmissionRequest req,
            @AuthenticationPrincipal User user
    ) {
        challengeService.createSubmission(id, req, user.getId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 풀이 수정")
    @PutMapping("/submissions/{id}")
    public ResponseEntity<Void> updateSubmission(
            @PathVariable Long id,
            @RequestBody ChallengeSubmissionRequest req,
            @AuthenticationPrincipal User user
    ) {
        challengeService.updateSubmission(id, req, user.getId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "챌린지 풀이 삭제")
    @DeleteMapping("/submissions/{id}")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        boolean isAdmin = user.getRole() == UserRole.ROLE_ADMIN;
        challengeService.deleteSubmission(id, user.getId(), isAdmin);
        return ResponseEntity.ok().build();
    }
}
