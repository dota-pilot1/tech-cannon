package com.mapo.palantier.prompt.folder.presentation;

import com.mapo.palantier.prompt.folder.PromptFolder;
import com.mapo.palantier.prompt.folder.PromptFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Prompt Folders", description = "프롬프트 폴더 관리")
@RestController
@RequestMapping("/api/prompt/folders")
@RequiredArgsConstructor
public class PromptFolderController {

    private final PromptFolderService promptFolderService;

    @Getter
    @NoArgsConstructor
    static class CreateFolderRequest {
        private Long parentId;
        private String name;
        private Integer sortOrder;
    }

    @Operation(summary = "폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<PromptFolder>> getFolders() {
        return ResponseEntity.ok(promptFolderService.getFolders());
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Void> createFolder(
        @RequestBody CreateFolderRequest req,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        PromptFolder folder = PromptFolder.builder()
            .parentId(req.getParentId())
            .name(req.getName())
            .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
            .createdBy(userId)
            .build();
        promptFolderService.createFolder(folder);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 이름 변경")
    @PutMapping("/{id}")
    public ResponseEntity<Void> renameFolder(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
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
