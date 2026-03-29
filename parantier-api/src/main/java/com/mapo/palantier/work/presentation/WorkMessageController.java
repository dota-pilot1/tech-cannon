package com.mapo.palantier.work.presentation;

import com.mapo.palantier.work.application.WorkMessageService;
import com.mapo.palantier.work.domain.WorkMessage;
import com.mapo.palantier.work.domain.WorkMessageWithUser;
import com.mapo.palantier.work.presentation.dto.CreateWorkMessageRequest;
import com.mapo.palantier.work.presentation.dto.UpdateWorkMessageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/works/{workId}/messages")
public class WorkMessageController {

    private final WorkMessageService workMessageService;

    public WorkMessageController(WorkMessageService workMessageService) {
        this.workMessageService = workMessageService;
    }

    /**
     * GET /api/works/{workId}/messages
     * 특정 업무의 메시지 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<WorkMessageWithUser>> getMessages(@PathVariable Long workId) {
        List<WorkMessageWithUser> messages = workMessageService.getMessagesByWorkId(workId);
        return ResponseEntity.ok(messages);
    }

    /**
     * POST /api/works/{workId}/messages
     * 메시지 생성
     */
    @PostMapping
    public ResponseEntity<WorkMessage> createMessage(
            @PathVariable Long workId,
            @RequestBody CreateWorkMessageRequest request,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        WorkMessage message = workMessageService.createMessage(workId, userId, request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * PUT /api/works/{workId}/messages/{id}
     * 메시지 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateMessage(
            @PathVariable Long workId,
            @PathVariable Long id,
            @RequestBody UpdateWorkMessageRequest request,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        WorkMessage message = workMessageService.getMessageById(id);

        // 권한 확인: 작성자만 수정 가능
        if (message == null || !message.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        workMessageService.updateMessage(id, request.getMessage());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Message updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/works/{workId}/messages/{id}
     * 메시지 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @PathVariable Long workId,
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        WorkMessage message = workMessageService.getMessageById(id);

        // 권한 확인: 작성자만 삭제 가능
        if (message == null || !message.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        workMessageService.deleteMessage(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Message deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/works/{workId}/messages/count
     * 특정 업무의 메시지 총 개수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getMessageCount(@PathVariable Long workId) {
        int count = workMessageService.getMessageCount(workId);
        Map<String, Integer> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
