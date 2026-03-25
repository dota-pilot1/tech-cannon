package com.palantier.domain.task.comment.presentation;

import com.palantier.domain.task.comment.TaskComment;
import com.palantier.domain.task.comment.TaskCommentService;
import com.palantier.domain.task.dto.TaskCommentDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Task 댓글", description = "Task 댓글 관리 API")
@RestController
@RequestMapping("/api/tasks/comments")
@RequiredArgsConstructor
public class TaskCommentController {
    private final TaskCommentService taskCommentService;

    @Operation(summary = "게시글별 댓글 목록 조회")
    @GetMapping
    public ResponseEntity<List<TaskComment>> getComments(
            @RequestParam Long postId
    ) {
        return ResponseEntity.ok(taskCommentService.getCommentsByPostId(postId));
    }

    @Operation(summary = "댓글 작성")
    @PostMapping
    public ResponseEntity<Long> createComment(
            @RequestBody TaskCommentDto dto,
            Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        Long commentId = taskCommentService.createComment(dto, userId);
        return ResponseEntity.ok(commentId);
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        taskCommentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
