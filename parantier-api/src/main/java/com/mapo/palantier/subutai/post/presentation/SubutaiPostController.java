package com.mapo.palantier.subutai.post.presentation;

import com.mapo.palantier.subutai.dto.SubutaiPostDto;
import com.mapo.palantier.subutai.post.SubutaiPost;
import com.mapo.palantier.subutai.post.SubutaiPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subutai 게시글", description = "Subutai 게시글 관리 API")
@RestController
@RequestMapping("/api/subutai/posts")
@RequiredArgsConstructor
public class SubutaiPostController {

    private final SubutaiPostService subutaiPostService;

    @Operation(summary = "폴더별 게시글 목록 조회 (folderId 없으면 전체 조회)")
    @GetMapping
    public ResponseEntity<List<SubutaiPost>> getPostsByFolder(
        @RequestParam(required = false) Long folderId
    ) {
        if (folderId == null) {
            return ResponseEntity.ok(subutaiPostService.getAllPosts());
        }
        return ResponseEntity.ok(
            subutaiPostService.getPostsByFolderId(folderId)
        );
    }

    @Operation(summary = "게시글 상세 조회 (블록 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<SubutaiPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(subutaiPostService.getPostWithBlocks(id));
    }

    @Operation(summary = "게시글 생성/수정")
    @PostMapping
    public ResponseEntity<Long> savePost(
        @RequestBody SubutaiPostDto dto,
        @RequestAttribute("userId") Long userId
    ) {
        Long postId = subutaiPostService.savePost(dto, userId);
        return ResponseEntity.ok(postId);
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        subutaiPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "게시글 태그 조회")
    @GetMapping("/{id}/tags")
    public ResponseEntity<List<String>> getTags(@PathVariable Long id) {
        return ResponseEntity.ok(subutaiPostService.getTagsByPost(id));
    }

    @Operation(summary = "게시글 태그 저장")
    @PutMapping("/{id}/tags")
    public ResponseEntity<Void> saveTags(
        @PathVariable Long id,
        @RequestBody Map<String, List<String>> body
    ) {
        subutaiPostService.saveTags(id, body.get("tags"));
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "태그 키워드로 게시글 검색")
    @GetMapping("/tags/search")
    public ResponseEntity<List<Map<String, Object>>> searchByTag(
        @RequestParam String keyword
    ) {
        return ResponseEntity.ok(subutaiPostService.searchByTag(keyword));
    }
}
