import { apiClient } from '@/shared/api/axios'
import type { SubIssue, CreateSubIssueRequest } from '../types/subIssue'

export const subIssueApi = {
  getSubIssues: async (issueId: number): Promise<SubIssue[]> => {
    const { data } = await apiClient.get<SubIssue[]>(`/issues/${issueId}/sub-issues`)
    return data
  },
  createSubIssue: async (issueId: number, req: CreateSubIssueRequest): Promise<SubIssue> => {
    const { data } = await apiClient.post<SubIssue>(`/issues/${issueId}/sub-issues`, req)
    return data
  },
  updateSubIssue: async (issueId: number, subIssueId: number, req: CreateSubIssueRequest): Promise<SubIssue> => {
    const { data } = await apiClient.put<SubIssue>(`/issues/${issueId}/sub-issues/${subIssueId}`, req)
    return data
  },
  toggleSubIssue: async (issueId: number, subIssueId: number): Promise<void> => {
    await apiClient.patch(`/issues/${issueId}/sub-issues/${subIssueId}/toggle`)
  },
  deleteSubIssue: async (issueId: number, subIssueId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/sub-issues/${subIssueId}`)
  },
}
