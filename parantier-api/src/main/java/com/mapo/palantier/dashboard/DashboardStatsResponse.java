package com.mapo.palantier.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {

    // 업무 (내 담당 전체, 아카이브 제외)
    private int totalWorks; // 전체
    private int doneWorks; // 완료 (DONE)
    private int inProgressWorks; // 진행 중 (IN_PROGRESS)
    private int testWorks; // 테스트 중 (TEST)
    private int todoWorks; // 대기 (TODO)
    private int holdWorks; // 보류 (HOLD)
    private int blockedWorks; // 막힘 (BLOCKED)

    // 이슈 (전체, 아카이브 제외)
    private int totalIssues; // 전체
    private int doneIssues; // 완료 (DONE)
    private int inProgressIssues; // 진행 중 (IN_PROGRESS)
    private int testIssues; // 테스트 중 (TEST)
    private int todoIssues; // 대기 (TODO)
    private int holdIssues; // 보류 (HOLD)
    private int blockedIssues; // 막힘 (BLOCKED)
}
