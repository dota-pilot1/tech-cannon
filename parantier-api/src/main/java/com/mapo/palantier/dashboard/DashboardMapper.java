package com.mapo.palantier.dashboard;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DashboardMapper {
    // 업무
    int countTotalWorks(@Param("userId") Long userId);
    int countDoneWorks(@Param("userId") Long userId);
    int countInProgressWorks(@Param("userId") Long userId);
    int countTestWorks(@Param("userId") Long userId);
    int countTodoWorks(@Param("userId") Long userId);
    int countHoldWorks(@Param("userId") Long userId);
    int countBlockedWorks(@Param("userId") Long userId);

    // 이슈 (전체, 아카이브 제외)
    int countTotalIssues();
    int countDoneIssues(); // DONE
    int countInProgressIssues(); // IN_PROGRESS
    int countTestIssues(); // TEST
    int countTodoIssues(); // TODO
    int countHoldIssues(); // HOLD
    int countBlockedIssues(); // BLOCKED

    // 유저별 완료 건수
    List<DashboardUserStatsResponse> getUserCompletionStats(
        @Param("period") String period
    );
}
