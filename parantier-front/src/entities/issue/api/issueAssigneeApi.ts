import { apiClient } from '@/shared/api/axios'
import type { IssueAssignee } from '../types/issueAssignee'

export const issueAssigneeApi = {
  // Get assignees for an issue
  getIssueAssignees: async (issueId: number): Promise<IssueAssignee[]> => {
    const response = await apiClient.get<IssueAssignee[]>(`/issues/${issueId}/assignees`)
    return response.data
  },

  // Add assignee
  addAssignee: async (issueId: number, userId: number): Promise<void> => {
    await apiClient.post(`/issues/${issueId}/assignees`, { userId })
  },

  // Remove assignee
  removeAssignee: async (issueId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/assignees/${userId}`)
  },

  // Update all assignees (batch)
  updateAssignees: async (issueId: number, userIds: number[]): Promise<void> => {
    await apiClient.put(`/issues/${issueId}/assignees`, { userIds })
  },
}
