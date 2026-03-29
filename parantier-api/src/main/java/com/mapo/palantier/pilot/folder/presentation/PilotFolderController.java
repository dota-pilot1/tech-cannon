package com.mapo.palantier.pilot.folder.presentation;

import com.mapo.palantier.pilot.dto.PilotFolderDto;
import com.mapo.palantier.pilot.folder.PilotFolder;
import com.mapo.palantier.pilot.folder.PilotFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Pilot 폴더", description = "Pilot 폴더 관리 API")
@RestController
@RequestMapping("/api/pilots/folders")
@RequiredArgsConstructor
public class PilotFolderController {
    private final PilotFolderService pilotFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<PilotFolder>> getAllFolders() {
        return ResponseEntity.ok(pilotFolderService.getAllFolders());
    }

    @Operation(summary = "폴더 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<PilotFolder> getFolder(@PathVariable Long id) {
        return ResponseEntity.ok(pilotFolderService.getFolderById(id));
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
            @RequestBody PilotFolderDto dto,
            Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        Long folderId = pilotFolderService.createFolder(dto, userId);
        return ResponseEntity.ok(folderId);
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
            @PathVariable Long id,
            @RequestBody PilotFolderDto dto
    ) {
        pilotFolderService.updateFolder(id, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        pilotFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
