package com.mapo.palantier.db.post.presentation;

import com.mapo.palantier.db.dto.DbPostDto;
import com.mapo.palantier.db.post.DbPost;
import com.mapo.palantier.db.post.DbPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "DB 관리", description = "DB 관리 API")
@RestController
@RequestMapping("/api/db/posts")
@RequiredArgsConstructor
public class DbPostController {

    private final DbPostService dbPostService;

    @Operation(summary = "전체 or 폴더별 문서 목록 조회")
    @GetMapping
    public ResponseEntity<List<DbPost>> getPosts(
        @RequestParam(required = false) Long folderId
    ) {
        if (folderId == null) {
            return ResponseEntity.ok(dbPostService.getAllPosts());
        }
        return ResponseEntity.ok(dbPostService.getPostsByFolderId(folderId));
    }

    @Operation(summary = "문서 상세 조회 (블록 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<DbPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(dbPostService.getPostWithBlocks(id));
    }

    @Operation(summary = "문서 생성/수정")
    @PostMapping
    public ResponseEntity<Long> savePost(
        @RequestBody DbPostDto dto,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(dbPostService.savePost(dto, userId));
    }

    @Operation(summary = "문서 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        dbPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
