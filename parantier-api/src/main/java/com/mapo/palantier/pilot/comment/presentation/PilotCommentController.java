package com.mapo.palantier.pilot.comment.presentation;

import com.mapo.palantier.pilot.comment.PilotComment;
import com.mapo.palantier.pilot.comment.PilotCommentService;
import com.mapo.palantier.pilot.dto.PilotCommentDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Pilot 댓글", description = "Pilot 댓글 관리 API")
@RestController
@RequestMapping("/api/pilots/comments")
@RequiredArgsConstructor
public class PilotCommentController {

    private final PilotCommentService pilotCommentService;

    @Operation(summary = "게시글별 댓글 목록 조회")
    @GetMapping
    public ResponseEntity<List<PilotComment>> getComments(
        @RequestParam Long postId
    ) {
        return ResponseEntity.ok(
            pilotCommentService.getCommentsByPostId(postId)
        );
    }

    @Operation(summary = "댓글 작성")
    @PostMapping
    public ResponseEntity<Long> createComment(
        @RequestBody PilotCommentDto dto,
        @RequestAttribute("userId") Long userId
    ) {
        Long commentId = pilotCommentService.createComment(dto, userId);
        return ResponseEntity.ok(commentId);
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        pilotCommentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }
}
