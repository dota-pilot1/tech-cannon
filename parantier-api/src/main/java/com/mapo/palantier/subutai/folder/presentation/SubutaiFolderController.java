package com.mapo.palantier.subutai.folder.presentation;

import com.mapo.palantier.subutai.dto.SubutaiFolderDto;
import com.mapo.palantier.subutai.folder.SubutaiFolder;
import com.mapo.palantier.subutai.folder.SubutaiFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subutai 폴더", description = "Subutai 폴더 관리 API")
@RestController
@RequestMapping("/api/subutai/folders")
@RequiredArgsConstructor
public class SubutaiFolderController {

    private final SubutaiFolderService subutaiFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<SubutaiFolder>> getAllFolders() {
        return ResponseEntity.ok(subutaiFolderService.getAllFolders());
    }

    @Operation(summary = "폴더 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<SubutaiFolder> getFolder(@PathVariable Long id) {
        return ResponseEntity.ok(subutaiFolderService.getFolderById(id));
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
        @RequestBody SubutaiFolderDto dto,
        @RequestAttribute("userId") Long userId
    ) {
        Long folderId = subutaiFolderService.createFolder(dto, userId);
        return ResponseEntity.ok(folderId);
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody SubutaiFolderDto dto
    ) {
        subutaiFolderService.updateFolder(id, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 순서 변경")
    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderFolders(
        @RequestBody List<Map<String, Object>> items
    ) {
        subutaiFolderService.reorderFolders(items);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        subutaiFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }
}
