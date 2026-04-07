package com.mapo.palantier.pilot.post.presentation;

import com.mapo.palantier.pilot.dto.PilotPostDto;
import com.mapo.palantier.pilot.post.PilotPost;
import com.mapo.palantier.pilot.post.PilotPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Pilot 게시글", description = "Pilot 게시글 관리 API")
@RestController
@RequestMapping("/api/pilots/posts")
@RequiredArgsConstructor
public class PilotPostController {

    private final PilotPostService pilotPostService;

    @Operation(summary = "폴더별 게시글 목록 조회 (folderId 없으면 전체 조회)")
    @GetMapping
    public ResponseEntity<List<PilotPost>> getPostsByFolder(
        @RequestParam(required = false) Long folderId
    ) {
        if (folderId == null) {
            return ResponseEntity.ok(pilotPostService.getAllPosts());
        }
        return ResponseEntity.ok(pilotPostService.getPostsByFolderId(folderId));
    }

    @Operation(summary = "게시글 상세 조회 (블록 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<PilotPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(pilotPostService.getPostWithBlocks(id));
    }

    @Operation(summary = "게시글 생성/수정")
    @PostMapping
    public ResponseEntity<Long> savePost(
        @RequestBody PilotPostDto dto,
        @RequestAttribute("userId") Long userId
    ) {
        Long postId = pilotPostService.savePost(dto, userId);
        return ResponseEntity.ok(postId);
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        pilotPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }
}
