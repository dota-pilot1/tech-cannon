package com.mapo.palantier.work.presentation;

import com.mapo.palantier.work.application.WorkStatusLogService;
import com.mapo.palantier.work.domain.WorkStatusLog;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/works")
public class WorkStatusLogController {

    private final WorkStatusLogService workStatusLogService;

    public WorkStatusLogController(WorkStatusLogService workStatusLogService) {
        this.workStatusLogService = workStatusLogService;
    }

    @GetMapping("/status-logs")
    public ResponseEntity<List<WorkStatusLog>> getStatusLogs(
        @RequestParam(required = false, defaultValue = "50") int limit,
        Authentication authentication
    ) {
        List<WorkStatusLog> logs = workStatusLogService.getRecentLogs(limit);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{workId}/status-logs")
    public ResponseEntity<List<WorkStatusLog>> getStatusLogsByWork(
        @PathVariable Long workId,
        Authentication authentication
    ) {
        List<WorkStatusLog> logs = workStatusLogService.getLogsByWorkId(workId);
        return ResponseEntity.ok(logs);
    }
}
