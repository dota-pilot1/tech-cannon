package com.mapo.palantier.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardUserStatsResponse {

    private Long userId;
    private String username;
    private String email;
    private int doneWorks;
    private int doneIssues;
}
