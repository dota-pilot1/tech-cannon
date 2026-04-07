package com.mapo.palantier.db.folder.presentation;

import com.mapo.palantier.db.dto.DbFolderDto;
import com.mapo.palantier.db.folder.DbFolder;
import com.mapo.palantier.db.folder.DbFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "DB 관리", description = "DB 관리 API")
@RestController
@RequestMapping("/api/db/folders")
@RequiredArgsConstructor
public class DbFolderController {

    private final DbFolderService dbFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<DbFolder>> getAllFolders() {
        return ResponseEntity.ok(dbFolderService.getAllFolders());
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
        @RequestBody DbFolderDto dto,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(dbFolderService.createFolder(dto, userId));
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody DbFolderDto dto
    ) {
        dbFolderService.updateFolder(id, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        dbFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }
}
