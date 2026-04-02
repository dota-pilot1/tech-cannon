package com.mapo.palantier.prompt.folder.presentation;

import com.mapo.palantier.prompt.folder.PromptFolder;
import com.mapo.palantier.prompt.folder.PromptFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Prompt Folders", description = "프롬프트 폴더 관리")
@RestController
@RequestMapping("/api/prompt/folders")
@RequiredArgsConstructor
public class PromptFolderController {

    private final PromptFolderService promptFolderService;

    @Operation(summary = "폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<PromptFolder>> getFolders() {
        return ResponseEntity.ok(promptFolderService.getFolders());
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Void> createFolder(@RequestBody PromptFolder folder, Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        folder.setCreatedBy(userId);
        promptFolderService.createFolder(folder);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 이름 변경")
    @PutMapping("/{id}")
    public ResponseEntity<Void> renameFolder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        promptFolderService.renameFolder(id, body.get("name"));
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        promptFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
