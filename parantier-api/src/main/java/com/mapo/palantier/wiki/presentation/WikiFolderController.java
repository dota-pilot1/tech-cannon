package com.mapo.palantier.wiki.presentation;

import com.mapo.palantier.wiki.application.WikiFolderService;
import com.mapo.palantier.wiki.presentation.dto.WikiFolderRequest;
import com.mapo.palantier.wiki.presentation.dto.WikiFolderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Wiki 폴더", description = "Tech Wiki 폴더 관리 API")
@RestController
@RequestMapping("/api/wiki/folders")
@RequiredArgsConstructor
public class WikiFolderController {

    private final WikiFolderService wikiFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<WikiFolderResponse>> getAllFolders() {
        return ResponseEntity.ok(
            wikiFolderService
                .getAllFolders()
                .stream()
                .map(WikiFolderResponse::from)
                .toList()
        );
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
        @RequestBody WikiFolderRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(
            wikiFolderService.createFolder(request, userId)
        );
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody WikiFolderRequest request
    ) {
        wikiFolderService.updateFolder(id, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        wikiFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }
}
