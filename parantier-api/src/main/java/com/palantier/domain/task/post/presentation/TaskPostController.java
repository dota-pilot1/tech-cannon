package com.palantier.domain.task.post.presentation;

import com.palantier.domain.task.dto.TaskPostDto;
import com.palantier.domain.task.post.TaskPost;
import com.palantier.domain.task.post.TaskPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Task 게시글", description = "Task 게시글 관리 API")
@RestController
@RequestMapping("/api/tasks/posts")
@RequiredArgsConstructor
public class TaskPostController {
    private final TaskPostService taskPostService;

    @Operation(summary = "폴더별 게시글 목록 조회")
    @GetMapping
    public ResponseEntity<List<TaskPost>> getPostsByFolder(
            @RequestParam Long folderId
    ) {
        return ResponseEntity.ok(taskPostService.getPostsByFolderId(folderId));
    }

    @Operation(summary = "게시글 상세 조회 (블록 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<TaskPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(taskPostService.getPostWithBlocks(id));
    }

    @Operation(summary = "게시글 생성/수정")
    @PostMapping
    public ResponseEntity<Long> savePost(
            @RequestBody TaskPostDto dto,
            Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        Long postId = taskPostService.savePost(dto, userId);
        return ResponseEntity.ok(postId);
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        taskPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
