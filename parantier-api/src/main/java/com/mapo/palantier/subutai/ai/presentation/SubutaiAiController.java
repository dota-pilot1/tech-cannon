package com.mapo.palantier.subutai.ai.presentation;

import com.mapo.palantier.subutai.ai.application.SubutaiChatService;
import com.mapo.palantier.subutai.ai.domain.SubutaiChatHistory;
import com.mapo.palantier.subutai.ai.domain.SubutaiGithubFolder;
import com.mapo.palantier.subutai.ai.dto.*;
import com.mapo.palantier.subutai.ai.dto.SubutaiGithubFolderUpdateRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiGithubItemUpdateRequest;
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

    // ── GitHub 폴더 ───────────────────────────────────────────

    @Operation(summary = "GitHub 폴더 목록 (아이템 포함)")
    @GetMapping("/folders")
    public ResponseEntity<List<SubutaiGithubFolder>> getFolders() {
        return ResponseEntity.ok(chatService.getFolders());
    }

    @Operation(summary = "GitHub 폴더 생성")
    @PostMapping("/folders")
    public ResponseEntity<Void> createFolder(
        @RequestBody SubutaiGithubFolderRequest req,
        @AuthenticationPrincipal User user
    ) {
        Long userId = user != null ? user.getId() : 1L;
        chatService.createFolder(req, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "GitHub 폴더 삭제")
    @DeleteMapping("/folders/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        chatService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "GitHub 폴더 수정")
    @PutMapping("/folders/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody SubutaiGithubFolderUpdateRequest req
    ) {
        chatService.updateFolder(id, req);
        return ResponseEntity.ok().build();
    }

    // ── GitHub 아이템 ─────────────────────────────────────────

    @Operation(summary = "GitHub URL 아이템 추가")
    @PostMapping("/items")
    public ResponseEntity<Void> createItem(
        @RequestBody SubutaiGithubItemRequest req
    ) {
        chatService.createItem(req);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "GitHub URL 아이템 삭제")
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        chatService.deleteItem(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "GitHub URL 아이템 수정")
    @PutMapping("/items/{id}")
    public ResponseEntity<Void> updateItem(
        @PathVariable Long id,
        @RequestBody SubutaiGithubItemUpdateRequest req
    ) {
        chatService.updateItem(id, req);
        return ResponseEntity.ok().build();
    }

    // ── 챗봇 ─────────────────────────────────────────────────

    @Operation(summary = "AI 질의 (GitHub 코드 기반)")
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
