package com.mapo.palantier.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(
                DashboardStatsResponse.builder()
                    .totalWorks(0)
                    .doneWorks(0)
                    .inProgressWorks(0)
                    .testWorks(0)
                    .todoWorks(0)
                    .holdWorks(0)
                    .blockedWorks(0)
                    .totalIssues(0)
                    .doneIssues(0)
                    .inProgressIssues(0)
                    .testIssues(0)
                    .todoIssues(0)
                    .holdIssues(0)
                    .blockedIssues(0)
                    .build()
            );
        }
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(dashboardService.getStats(userId));
    }
}
