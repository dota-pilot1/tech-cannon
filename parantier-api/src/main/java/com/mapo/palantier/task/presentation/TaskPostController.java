package com.mapo.palantier.task.presentation;

import com.mapo.palantier.task.application.TaskPostService;
import com.mapo.palantier.task.presentation.dto.TaskPostDetail;
import com.mapo.palantier.task.presentation.dto.TaskPostRequest;
import com.mapo.palantier.task.presentation.dto.TaskPostSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Task 게시글", description = "Task 게시글 관리 API")
@RestController
@RequestMapping("/api/tasks/posts")
@RequiredArgsConstructor
public class TaskPostController {

    private final TaskPostService taskPostService;

    @Operation(summary = "폴더별 게시글 목록 조회 (folderId 없으면 전체 조회)")
    @GetMapping
    public ResponseEntity<List<TaskPostSummary>> getPostsByFolder(
        @RequestParam(required = false) Long folderId
    ) {
        List<TaskPostSummary> result =
            folderId == null
                ? taskPostService.getAllPosts()
                : taskPostService.getPostsByFolderId(folderId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "게시글 상세 조회 (블록 포함)")
    @GetMapping("/{id}")
    public ResponseEntity<TaskPostDetail> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(taskPostService.getPostWithBlocks(id));
    }

    @Operation(summary = "게시글 생성/수정")
    @PostMapping
    public ResponseEntity<Long> savePost(
        @RequestBody TaskPostRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(taskPostService.savePost(request, userId));
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        taskPostService.deletePost(id);
        return ResponseEntity.ok().build();
    }
}
