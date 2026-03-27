package com.mapo.palantier.issue.presentation;

import com.mapo.palantier.issue.application.IssueMessageService;
import com.mapo.palantier.issue.domain.IssueMessage;
import com.mapo.palantier.issue.domain.MessageWithUser;
import com.mapo.palantier.issue.presentation.dto.CreateMessageRequest;
import com.mapo.palantier.issue.presentation.dto.UpdateMessageRequest;
import com.mapo.palantier.user.application.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues/{issueId}/messages")
public class IssueMessageController {

    private final IssueMessageService issueMessageService;
    private final AuthService authService;

    public IssueMessageController(IssueMessageService issueMessageService, AuthService authService) {
        this.issueMessageService = issueMessageService;
        this.authService = authService;
    }

    /**
     * GET /api/issues/{issueId}/messages
     * 특정 이슈의 메시지 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<MessageWithUser>> getMessages(@PathVariable Long issueId) {
        List<MessageWithUser> messages = issueMessageService.getMessagesByIssueId(issueId);
        return ResponseEntity.ok(messages);
    }

    /**
     * POST /api/issues/{issueId}/messages
     * 메시지 생성
     */
    @PostMapping
    public ResponseEntity<IssueMessage> createMessage(
            @PathVariable Long issueId,
            @RequestBody CreateMessageRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Long userId = authService.getUserByEmail(email).getId();
        IssueMessage message = issueMessageService.createMessage(issueId, userId, request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * PUT /api/issues/{issueId}/messages/{id}
     * 메시지 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateMessage(
            @PathVariable Long issueId,
            @PathVariable Long id,
            @RequestBody UpdateMessageRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Long userId = authService.getUserByEmail(email).getId();
        IssueMessage message = issueMessageService.getMessageById(id);

        // 권한 확인: 작성자만 수정 가능
        if (message == null || !message.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        issueMessageService.updateMessage(id, request.getMessage());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Message updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/issues/{issueId}/messages/{id}
     * 메시지 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @PathVariable Long issueId,
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Long userId = authService.getUserByEmail(email).getId();
        IssueMessage message = issueMessageService.getMessageById(id);

        // 권한 확인: 작성자만 삭제 가능
        if (message == null || !message.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        issueMessageService.deleteMessage(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Message deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/issues/{issueId}/messages/count
     * 특정 이슈의 메시지 총 개수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getMessageCount(@PathVariable Long issueId) {
        int count = issueMessageService.getMessageCount(issueId);
        Map<String, Integer> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
