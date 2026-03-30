package com.mapo.palantier.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {
    private int myInProgressWorks;   // 내 진행 중 업무
    private int todayDueWorks;       // 오늘 마감 업무
    private int openIssues;          // 미해결 이슈 (OPEN + IN_PROGRESS)
    private int weekDoneWorks;       // 이번 주 완료 업무
    private int totalUsers;          // 전체 활성 사용자 수
    private int weekCompletionRate;  // 이번 주 완료율 (%)
}
