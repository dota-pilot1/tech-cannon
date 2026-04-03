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

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
    return data;
  },
};
