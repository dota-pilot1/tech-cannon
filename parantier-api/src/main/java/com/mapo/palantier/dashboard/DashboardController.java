package com.mapo.palantier.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(
        Authentication authentication
    ) {
        // 비로그인 시 빈 통계 반환
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(
                DashboardStatsResponse.builder()
                    .myInProgressWorks(0)
                    .todayDueWorks(0)
                    .openIssues(0)
                    .weekDoneWorks(0)
                    .totalUsers(0)
                    .weekCompletionRate(0)
                    .build()
            );
        }
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(dashboardService.getStats(userId));
    }
}
