import { apiClient } from "@/shared/api/axios";
import type {
  Issue,
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueListResponse,
  IssueFilters,
} from "../types/issue";

export const issueApi = {
  // 이슈 목록 조회
  getIssues: async (
    filters?: IssueFilters & { page?: number; limit?: number },
  ): Promise<IssueListResponse> => {
    const { data } = await apiClient.get<IssueListResponse>("/issues", {
      params: filters,
    });
    return data;
  },

  // 이슈 상세 조회
  getIssue: async (id: number): Promise<Issue> => {
    const { data } = await apiClient.get<Issue>(`/issues/${id}`);
    return data;
  },

  // 이슈 생성
  createIssue: async (request: CreateIssueRequest): Promise<Issue> => {
    const { data } = await apiClient.post<Issue>("/issues", request);
    return data;
  },

  // 이슈 수정
  updateIssue: async (
    id: number,
    request: UpdateIssueRequest,
  ): Promise<Issue> => {
    const { data } = await apiClient.put<Issue>(`/issues/${id}`, request);
    return data;
  },

  // 이슈 삭제
  deleteIssue: async (id: number): Promise<void> => {
    await apiClient.delete(`/issues/${id}`);
  },

  // 상태 변경
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.put(`/issues/${id}/status`, { status });
  },

  // 담당자 변경
  updateAssignee: async (
    id: number,
    assigneeId: number | null,
  ): Promise<void> => {
    await apiClient.put(`/issues/${id}/assignee`, { assigneeId });
  },

  // 우선순위 변경
  updatePriority: async (id: number, priority: string): Promise<void> => {
    await apiClient.put(`/issues/${id}/priority`, { priority });
  },

  // 순서 변경
  reorderIssues: async (
    items: { id: number; orderNum: number }[],
  ): Promise<void> => {
    await apiClient.patch("/issues/reorder", items);
  },
};
