import { apiClient } from "@/shared/api/axios";

export interface DashboardStats {
  totalWorks: number;
  doneWorks: number;
  inProgressWorks: number;
  testWorks: number;
  todoWorks: number;
  holdWorks: number;
  blockedWorks: number;
  totalIssues: number;
  doneIssues: number;
  inProgressIssues: number;
  testIssues: number;
  todoIssues: number;
  holdIssues: number;
  blockedIssues: number;
}

export type DashboardPeriod = "today" | "week" | "month";

export interface DashboardUserStats {
  userId: number;
  username: string;
  email: string;
  doneWorks: number;
  doneIssues: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
    return data;
  },

  getUserCompletionStats: async (
    period: DashboardPeriod,
  ): Promise<DashboardUserStats[]> => {
    const periodMap: Record<DashboardPeriod, string> = {
      today: "TODAY",
      week: "WEEK",
      month: "MONTH",
    };
    const { data } = await apiClient.get<DashboardUserStats[]>(
      `/dashboard/user-completion-stats?period=${periodMap[period]}`,
    );
    return data;
  },
};
