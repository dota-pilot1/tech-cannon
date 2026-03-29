import { apiClient } from '@/shared/api/axios'
import type { WorkLinkedIssue } from '../types/workLinkedIssue'

export const workLinkedIssueApi = {
  // 연결된 이슈 목록 조회
  getLinkedIssues: async (workId: number): Promise<WorkLinkedIssue[]> => {
    const response = await apiClient.get<WorkLinkedIssue[]>(`/works/${workId}/linked-issues`)
    return response.data
  },

  // 이슈 연결
  linkIssue: async (workId: number, issueId: number): Promise<WorkLinkedIssue> => {
    const response = await apiClient.post<WorkLinkedIssue>(`/works/${workId}/linked-issues`, {
      issueId,
    })
    return response.data
  },

  // 이슈 연결 해제
  unlinkIssue: async (workId: number, linkId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/linked-issues/${linkId}`)
  },
}
