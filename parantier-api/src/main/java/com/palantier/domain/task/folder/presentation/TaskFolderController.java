package com.palantier.domain.task.folder.presentation;

import com.palantier.domain.task.dto.TaskFolderDto;
import com.palantier.domain.task.folder.TaskFolder;
import com.palantier.domain.task.folder.TaskFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Task 폴더", description = "Task 폴더 관리 API")
@RestController
@RequestMapping("/api/tasks/folders")
@RequiredArgsConstructor
public class TaskFolderController {
    private final TaskFolderService taskFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<TaskFolder>> getAllFolders() {
        return ResponseEntity.ok(taskFolderService.getAllFolders());
    }

    @Operation(summary = "폴더 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<TaskFolder> getFolder(@PathVariable Long id) {
        return ResponseEntity.ok(taskFolderService.getFolderById(id));
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
            @RequestBody TaskFolderDto dto,
            Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        Long folderId = taskFolderService.createFolder(dto, userId);
        return ResponseEntity.ok(folderId);
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
            @PathVariable Long id,
            @RequestBody TaskFolderDto dto
    ) {
        taskFolderService.updateFolder(id, dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        taskFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: JWT 토큰에서 userId 추출
        return 1L;
    }
}
