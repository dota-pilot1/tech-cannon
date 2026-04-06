package com.mapo.palantier.subutai.ai.presentation;

import com.mapo.palantier.subutai.ai.application.SubutaiChatService;
import com.mapo.palantier.subutai.ai.domain.SubutaiChatHistory;
import com.mapo.palantier.subutai.ai.dto.SubutaiChatRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiChatResponse;
import com.mapo.palantier.user.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subutai AI", description = "Subutai AI 챗봇 API")
@RestController
@RequestMapping("/api/subutai/ai")
@RequiredArgsConstructor
public class SubutaiAiController {

    private final SubutaiChatService chatService;

    // ── 챗봇 ─────────────────────────────────────────────────

    @Operation(summary = "AI 질의 (문서 기반)")
    @PostMapping("/chat")
    public ResponseEntity<SubutaiChatResponse> chat(
        @RequestBody SubutaiChatRequest req,
        @AuthenticationPrincipal User user
    ) {
        Long userId = user != null ? user.getId() : 1L;
        return ResponseEntity.ok(chatService.chat(req, userId));
    }

    // ── 히스토리 ──────────────────────────────────────────────

    @Operation(summary = "대화 히스토리 조회")
    @GetMapping("/histories")
    public ResponseEntity<List<SubutaiChatHistory>> getHistories(
        @AuthenticationPrincipal User user
    ) {
        Long userId = user != null ? user.getId() : 1L;
        return ResponseEntity.ok(chatService.getHistories(userId));
    }

    @Operation(summary = "히스토리 삭제")
    @DeleteMapping("/histories/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        chatService.deleteHistory(id);
        return ResponseEntity.ok().build();
    }
}
