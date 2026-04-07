package com.mapo.palantier.prototype.folder.presentation;

import com.mapo.palantier.prototype.dto.ProtoFolderDto;
import com.mapo.palantier.prototype.folder.ProtoFolder;
import com.mapo.palantier.prototype.folder.ProtoFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Prototype 폴더", description = "Prototype 폴더 관리 API")
@RestController
@RequestMapping("/api/prototype/folders")
@RequiredArgsConstructor
public class ProtoFolderController {

    private final ProtoFolderService protoFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<ProtoFolder>> getAllFolders() {
        return ResponseEntity.ok(protoFolderService.getAllFolders());
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
        @RequestBody ProtoFolderDto dto,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(protoFolderService.createFolder(dto, userId));
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody ProtoFolderDto dto
    ) {
        protoFolderService.updateFolder(id, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        protoFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }
}
