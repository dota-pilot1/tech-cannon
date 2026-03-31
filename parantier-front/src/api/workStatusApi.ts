import { apiClient } from "@/shared/api/axios";

export interface WorkStatusLog {
  id: number;
  workId: number;
  workTitle: string;
  changedBy: string;
  changedById: number;
  changeType: "STATUS" | "ASSIGNEE" | "PRIORITY" | "CREATED" | "TITLE";
  oldValue: string | null;
  newValue: string | null;
  changedAt: string; // ISO datetime
}

export interface TeamMemberWorkSummary {
  userId: number;
  username: string;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  holdCount: number;
  testCount: number;
  blockedCount: number;
  totalCount: number;
  works: TeamMemberWork[];
}

export interface TeamMemberWork {
  id: number;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "TEST" | "DONE" | "HOLD" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  workType: "FEATURE" | "QA" | "COMMON";
  dueDate: string | null;
}

export const workStatusApi = {
  getRecentLogs: async (limit = 50): Promise<WorkStatusLog[]> => {
    const { data } = await apiClient.get<WorkStatusLog[]>(
      `/works/status-logs?limit=${limit}`,
    );
    return data;
  },
};
