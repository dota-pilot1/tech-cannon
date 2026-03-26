import { apiClient } from '@/shared/api/axios'
import type { IssueTaskLink, LinkTaskRequest } from '../types/issueTask'

export const issueTaskApi = {
  // Get linked tasks for an issue
  getLinkedTasks: async (issueId: number): Promise<IssueTaskLink[]> => {
    const response = await apiClient.get<IssueTaskLink[]>(`/issues/${issueId}/tasks`)
    return response.data
  },

  // Link task to issue
  linkTask: async (issueId: number, request: LinkTaskRequest): Promise<any> => {
    const response = await apiClient.post(`/issues/${issueId}/tasks`, request)
    return response.data
  },

  // Unlink task from issue
  unlinkTask: async (issueId: number, linkId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/tasks/${linkId}`)
  },
}
