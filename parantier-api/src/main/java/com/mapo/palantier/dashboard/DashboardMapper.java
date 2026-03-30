package com.mapo.palantier.dashboard;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DashboardMapper {
    int countMyInProgressWorks(@Param("userId") Long userId);
    int countTodayDueWorks(@Param("userId") Long userId);
    int countOpenIssues();
    int countWeekDoneWorks(@Param("userId") Long userId);
    int countWeekTotalWorks(@Param("userId") Long userId);
    int countTotalUsers();
}
