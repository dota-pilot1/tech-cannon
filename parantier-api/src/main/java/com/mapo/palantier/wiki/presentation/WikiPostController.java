package com.mapo.palantier.wiki.presentation;

import com.mapo.palantier.wiki.application.WikiPostService;
import com.mapo.palantier.wiki.presentation.dto.WikiPostDetail;
import com.mapo.palantier.wiki.presentation.dto.WikiPostRequest;
import com.mapo.palantier.wiki.presentation.dto.WikiPostSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Wiki 포스트", description = "Tech Wiki 문서 관리 API")
@RestController
@RequestMapping("/api/wiki/posts")
@RequiredArgsConstructor
public class WikiPostController {

    private final WikiPostService wikiPostService;

    @Operation(summary = "전체 or 폴더별 문서 목록 조회")
    @GetMapping
    public ResponseEntity<List<WikiPostSummary>> getPosts(
        @RequestParam(required = false) Long folderId
    ) {
        List<WikiPostSummary> result =
            folderId == null
                ? wikiPostService.getAllPosts()
                : wikiPostService.getPostsByFolderId(folderId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "문서 상세 조회 (블록 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<WikiPostDetail> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(wikiPostService.getPostWithBlocks(id));
    }

    @Operation(summary = "문서 생성/수정")
    @PostMapping
    public ResponseEntity<Long> savePost(
        @RequestBody WikiPostRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(wikiPostService.savePost(request, userId));
    }

    @Operation(summary = "문서 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        wikiPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }
}
