package com.mapo.palantier.task.presentation;

import com.mapo.palantier.task.application.TaskCommentService;
import com.mapo.palantier.task.presentation.dto.TaskCommentRequest;
import com.mapo.palantier.task.presentation.dto.TaskCommentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Task 댓글", description = "Task 댓글 관리 API")
@RestController
@RequestMapping("/api/tasks/comments")
@RequiredArgsConstructor
public class TaskCommentController {

    private final TaskCommentService taskCommentService;

    @Operation(summary = "게시글별 댓글 목록 조회")
    @GetMapping
    public ResponseEntity<List<TaskCommentResponse>> getComments(
        @RequestParam Long postId
    ) {
        return ResponseEntity.ok(
            taskCommentService.getCommentsByPostId(postId)
        );
    }

    @Operation(summary = "댓글 작성")
    @PostMapping
    public ResponseEntity<Long> createComment(
        @RequestBody @Valid TaskCommentRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(
            taskCommentService.createComment(request, userId)
        );
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        taskCommentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }
}
