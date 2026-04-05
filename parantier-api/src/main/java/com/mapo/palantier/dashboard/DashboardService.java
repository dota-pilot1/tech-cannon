package com.mapo.palantier.dashboard;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final DashboardMapper dashboardMapper;

    public List<DashboardUserStatsResponse> getUserCompletionStats(
        String period
    ) {
        return dashboardMapper.getUserCompletionStats(period);
    }

    public DashboardStatsResponse getStats(Long userId) {
        return DashboardStatsResponse.builder()
            .totalWorks(dashboardMapper.countTotalWorks(userId))
            .doneWorks(dashboardMapper.countDoneWorks(userId))
            .inProgressWorks(dashboardMapper.countInProgressWorks(userId))
            .testWorks(dashboardMapper.countTestWorks(userId))
            .todoWorks(dashboardMapper.countTodoWorks(userId))
            .holdWorks(dashboardMapper.countHoldWorks(userId))
            .blockedWorks(dashboardMapper.countBlockedWorks(userId))
            .totalIssues(dashboardMapper.countTotalIssues())
            .doneIssues(dashboardMapper.countDoneIssues())
            .inProgressIssues(dashboardMapper.countInProgressIssues())
            .testIssues(dashboardMapper.countTestIssues())
            .todoIssues(dashboardMapper.countTodoIssues())
            .holdIssues(dashboardMapper.countHoldIssues())
            .blockedIssues(dashboardMapper.countBlockedIssues())
            .build();
    }
}
