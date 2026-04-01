package com.mapo.palantier.wiki.folder.presentation;

import com.mapo.palantier.wiki.dto.WikiFolderDto;
import com.mapo.palantier.wiki.folder.WikiFolder;
import com.mapo.palantier.wiki.folder.WikiFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Wiki 폴더", description = "Tech Wiki 폴더 관리 API")
@RestController
@RequestMapping("/api/wiki/folders")
@RequiredArgsConstructor
public class WikiFolderController {

    private final WikiFolderService wikiFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<WikiFolder>> getAllFolders() {
        return ResponseEntity.ok(wikiFolderService.getAllFolders());
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
        @RequestBody WikiFolderDto dto,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(wikiFolderService.createFolder(dto, userId));
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody WikiFolderDto dto
    ) {
        wikiFolderService.updateFolder(id, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        wikiFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
