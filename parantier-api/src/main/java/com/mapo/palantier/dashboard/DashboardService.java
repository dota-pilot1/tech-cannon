package com.mapo.palantier.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final DashboardMapper dashboardMapper;

    public DashboardStatsResponse getStats(Long userId) {
        int weekDone = dashboardMapper.countWeekDoneWorks(userId);
        int weekTotal = dashboardMapper.countWeekTotalWorks(userId);
        int weekCompletionRate = weekTotal > 0 ? (int) Math.round((double) weekDone / weekTotal * 100) : 0;

        return DashboardStatsResponse.builder()
                .myInProgressWorks(dashboardMapper.countMyInProgressWorks(userId))
                .todayDueWorks(dashboardMapper.countTodayDueWorks(userId))
                .openIssues(dashboardMapper.countOpenIssues())
                .weekDoneWorks(weekDone)
                .totalUsers(dashboardMapper.countTotalUsers())
                .weekCompletionRate(weekCompletionRate)
                .build();
    }
}
