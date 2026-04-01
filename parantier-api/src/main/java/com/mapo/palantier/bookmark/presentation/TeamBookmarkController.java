package com.mapo.palantier.bookmark.presentation;

import com.mapo.palantier.bookmark.application.TeamBookmarkService;
import com.mapo.palantier.bookmark.domain.TeamBookmark;
import com.mapo.palantier.bookmark.domain.TeamBookmarkWithUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class TeamBookmarkController {

    private final TeamBookmarkService teamBookmarkService;

    public TeamBookmarkController(TeamBookmarkService teamBookmarkService) {
        this.teamBookmarkService = teamBookmarkService;
    }

    /**
     * GET /api/bookmarks
     * 전체 즐겨찾기 목록 조회 (인증 필요)
     */
    @GetMapping
    public ResponseEntity<List<TeamBookmarkWithUser>> getAll(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<TeamBookmarkWithUser> bookmarks = teamBookmarkService.getAll();
        return ResponseEntity.ok(bookmarks);
    }

    /**
     * POST /api/bookmarks
     * 즐겨찾기 생성 (인증 필요)
     */
    @PostMapping
    public ResponseEntity<TeamBookmark> create(
            @RequestBody CreateRequest request,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        TeamBookmark bookmark = teamBookmarkService.create(
                userId,
                request.title,
                request.url,
                request.description,
                request.category
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(bookmark);
    }

    /**
     * DELETE /api/bookmarks/{id}
     * 즐겨찾기 삭제 (본인만 삭제 가능)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = Long.parseLong(authentication.getName());
        teamBookmarkService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    // -------------------------
    // Request DTO (내부 클래스)
    // -------------------------

    static class CreateRequest {
        String title;
        String url;
        String description;
        String category;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
