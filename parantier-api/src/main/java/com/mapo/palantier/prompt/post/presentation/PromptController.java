package com.mapo.palantier.prompt.post.presentation;

import com.mapo.palantier.prompt.post.Prompt;
import com.mapo.palantier.prompt.post.PromptDto;
import com.mapo.palantier.prompt.post.PromptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Prompts", description = "프롬프트 관리")
@RestController
@RequestMapping("/api/prompts")
@RequiredArgsConstructor
public class PromptController {

    private final PromptService promptService;

    @Operation(summary = "프롬프트 목록 조회")
    @GetMapping
    public ResponseEntity<List<Prompt>> getPrompts(@RequestParam(required = false) Long folderId) {
        if (folderId != null) {
            return ResponseEntity.ok(promptService.getPromptsByFolder(folderId));
        }
        return ResponseEntity.ok(promptService.getAllPrompts());
    }

    @Operation(summary = "프롬프트 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<Prompt> getPrompt(@PathVariable Long id) {
        return ResponseEntity.ok(promptService.getPrompt(id));
    }

    @Operation(summary = "프롬프트 저장 (생성/수정)")
    @PostMapping
    public ResponseEntity<Long> savePrompt(@RequestBody PromptDto dto, Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(promptService.savePrompt(dto, userId));
    }

    @Operation(summary = "프롬프트 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrompt(@PathVariable Long id) {
        promptService.deletePrompt(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
