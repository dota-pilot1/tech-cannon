package com.mapo.palantier.devlog;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "개발 일지", description = "개인 개발 일지 API")
@RestController
@RequestMapping("/api/devlogs")
@RequiredArgsConstructor
public class DevLogController {

    private final DevLogService devLogService;

    @Operation(summary = "내 개발 일지 목록 조회")
    @GetMapping
    public ResponseEntity<List<DevLog>> getMyDevLogs(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(devLogService.getMyDevLogs(userId));
    }

    @Operation(summary = "개발 일지 생성")
    @PostMapping
    public ResponseEntity<Long> createDevLog(
        @RequestBody DevLogDto dto,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        return ResponseEntity.ok(devLogService.createDevLog(dto, userId));
    }

    @Operation(summary = "개발 일지 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateDevLog(
        @PathVariable Long id,
        @RequestBody DevLogDto dto,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        devLogService.updateDevLog(id, dto, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "개발 일지 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevLog(
        @PathVariable Long id,
        Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        devLogService.deleteDevLog(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "개발 일지에 연결된 이슈 ID 목록 조회")
    @GetMapping("/{id}/linked-issues")
    public ResponseEntity<List<Long>> getLinkedIssues(
        @PathVariable Long id,
        Authentication auth
    ) {
        getUserIdFromAuth(auth);
        return ResponseEntity.ok(devLogService.getLinkedIssueIds(id));
    }

    @Operation(summary = "개발 일지에 이슈 연결")
    @PostMapping("/{id}/link-issue/{issueId}")
    public ResponseEntity<Void> linkIssue(
        @PathVariable Long id,
        @PathVariable Long issueId,
        Authentication auth
    ) {
        getUserIdFromAuth(auth);
        devLogService.linkIssue(id, issueId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "개발 일지에서 이슈 연결 해제")
    @DeleteMapping("/{id}/link-issue/{issueId}")
    public ResponseEntity<Void> unlinkIssue(
        @PathVariable Long id,
        @PathVariable Long issueId,
        Authentication auth
    ) {
        getUserIdFromAuth(auth);
        devLogService.unlinkIssue(id, issueId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "개발 일지에 연결된 업무 ID 목록 조회")
    @GetMapping("/{id}/linked-works")
    public ResponseEntity<List<Long>> getLinkedWorks(
        @PathVariable Long id,
        Authentication auth
    ) {
        getUserIdFromAuth(auth);
        return ResponseEntity.ok(devLogService.getLinkedWorkIds(id));
    }

    @Operation(summary = "개발 일지에 업무 연결")
    @PostMapping("/{id}/link-work/{workId}")
    public ResponseEntity<Void> linkWork(
        @PathVariable Long id,
        @PathVariable Long workId,
        Authentication auth
    ) {
        getUserIdFromAuth(auth);
        devLogService.linkWork(id, workId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "개발 일지에서 업무 연결 해제")
    @DeleteMapping("/{id}/link-work/{workId}")
    public ResponseEntity<Void> unlinkWork(
        @PathVariable Long id,
        @PathVariable Long workId,
        Authentication auth
    ) {
        getUserIdFromAuth(auth);
        devLogService.unlinkWork(id, workId);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "로그인이 필요합니다"
            );
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof com.mapo.palantier.user.domain.User) {
            return ((com.mapo.palantier.user.domain.User) principal).getId();
        }
        try {
            return Long.parseLong(auth.getName());
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "유효하지 않은 인증 정보입니다"
            );
        }
    }
}
