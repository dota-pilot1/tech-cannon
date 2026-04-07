package com.mapo.palantier.task.presentation;

import com.mapo.palantier.task.application.TaskFolderService;
import com.mapo.palantier.task.presentation.dto.TaskFolderRequest;
import com.mapo.palantier.task.presentation.dto.TaskFolderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Task 폴더", description = "Task 폴더 관리 API")
@RestController
@RequestMapping("/api/tasks/folders")
@RequiredArgsConstructor
public class TaskFolderController {

    private final TaskFolderService taskFolderService;

    @Operation(summary = "전체 폴더 목록 조회")
    @GetMapping
    public ResponseEntity<List<TaskFolderResponse>> getAllFolders() {
        return ResponseEntity.ok(
            taskFolderService
                .getAllFolders()
                .stream()
                .map(TaskFolderResponse::from)
                .toList()
        );
    }

    @Operation(summary = "폴더 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<TaskFolderResponse> getFolder(@PathVariable Long id) {
        return ResponseEntity.ok(
            TaskFolderResponse.from(taskFolderService.getFolderById(id))
        );
    }

    @Operation(summary = "폴더 생성")
    @PostMapping
    public ResponseEntity<Long> createFolder(
        @RequestBody @Valid TaskFolderRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(
            taskFolderService.createFolder(request, userId)
        );
    }

    @Operation(summary = "폴더 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateFolder(
        @PathVariable Long id,
        @RequestBody @Valid TaskFolderRequest request
    ) {
        taskFolderService.updateFolder(id, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "폴더 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        taskFolderService.deleteFolder(id);
        return ResponseEntity.ok().build();
    }
}
