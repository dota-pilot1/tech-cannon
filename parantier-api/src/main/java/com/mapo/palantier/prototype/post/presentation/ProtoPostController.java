package com.mapo.palantier.prototype.post.presentation;

import com.mapo.palantier.prototype.dto.ProtoPostDto;
import com.mapo.palantier.prototype.post.ProtoPost;
import com.mapo.palantier.prototype.post.ProtoPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Prototype 포스트", description = "Prototype 문서 관리 API")
@RestController
@RequestMapping("/api/prototype/posts")
@RequiredArgsConstructor
public class ProtoPostController {

    private final ProtoPostService protoPostService;

    @Operation(summary = "전체 or 폴더별 문서 목록 조회")
    @GetMapping
    public ResponseEntity<List<ProtoPost>> getPosts(
        @RequestParam(required = false) Long folderId
    ) {
        if (folderId == null) {
            return ResponseEntity.ok(protoPostService.getAllPosts());
        }
        return ResponseEntity.ok(protoPostService.getPostsByFolderId(folderId));
    }

    @Operation(summary = "문서 상세 조회 (블록 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<ProtoPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(protoPostService.getPostWithBlocks(id));
    }

    @Operation(summary = "문서 생성/수정")
    @PostMapping
    public ResponseEntity<Long> savePost(
        @RequestBody ProtoPostDto dto,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(protoPostService.savePost(dto, userId));
    }

    @Operation(summary = "문서 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        protoPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }
}
