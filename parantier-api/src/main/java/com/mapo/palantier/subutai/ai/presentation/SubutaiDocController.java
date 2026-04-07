package com.mapo.palantier.subutai.ai.presentation;

import com.mapo.palantier.subutai.ai.application.SubutaiDocService;
import com.mapo.palantier.subutai.ai.domain.SubutaiDocFolder;
import com.mapo.palantier.subutai.ai.domain.SubutaiDocPost;
import com.mapo.palantier.subutai.ai.dto.SubutaiDocFolderRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiDocPostRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiDocTagRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiTagSearchResponse;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subutai Doc", description = "Subutai AI 문서 관리")
@RestController
@RequestMapping("/api/subutai/doc")
@RequiredArgsConstructor
public class SubutaiDocController {

    private final SubutaiDocService docService;

    @GetMapping("/folders")
    public ResponseEntity<List<SubutaiDocFolder>> getFolders() {
        return ResponseEntity.ok(docService.getFolders());
    }

    @PostMapping("/folders")
    public ResponseEntity<Void> createFolder(
        @RequestBody SubutaiDocFolderRequest req,
        @AuthenticationPrincipal User user
    ) {
        docService.createFolder(req, user != null ? user.getId() : 1L);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/folders/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody SubutaiDocFolderRequest req
    ) {
        docService.updateFolder(id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/folders/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        docService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/folders/{folderId}/posts")
    public ResponseEntity<List<SubutaiDocPost>> getPosts(
        @PathVariable Long folderId
    ) {
        return ResponseEntity.ok(docService.getPostsByFolder(folderId));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<SubutaiDocPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(docService.getPostWithSections(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<Long> createPost(
        @RequestBody SubutaiDocPostRequest req,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
            docService.createPost(req, user != null ? user.getId() : 1L)
        );
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<Void> updatePost(
        @PathVariable Long id,
        @RequestBody SubutaiDocPostRequest req
    ) {
        docService.updatePost(id, req);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        docService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/posts/{id}/tags")
    public ResponseEntity<List<String>> getTags(@PathVariable Long id) {
        return ResponseEntity.ok(docService.getTagsByPost(id));
    }

    @PutMapping("/posts/{id}/tags")
    public ResponseEntity<Void> saveTags(
        @PathVariable Long id,
        @RequestBody SubutaiDocTagRequest req
    ) {
        docService.saveTags(id, req);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tags/search")
    public ResponseEntity<List<SubutaiTagSearchResponse>> searchByTag(
        @RequestParam String keyword
    ) {
        return ResponseEntity.ok(docService.searchByTag(keyword));
    }
}
