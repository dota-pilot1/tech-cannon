import { apiClient } from '@/shared/api/axios'
import type { IssueChecklist, CreateChecklistRequest, UpdateChecklistRequest } from '../types/issueChecklist'

export const issueChecklistApi = {
  // Get checklists for an issue
  getChecklists: async (issueId: number): Promise<IssueChecklist[]> => {
    const response = await apiClient.get<IssueChecklist[]>(`/issues/${issueId}/checklists`)
    return response.data
  },

  // Create checklist item
  createChecklist: async (issueId: number, request: CreateChecklistRequest): Promise<IssueChecklist> => {
    const response = await apiClient.post<IssueChecklist>(`/issues/${issueId}/checklists`, request)
    return response.data
  },

  // Update checklist item
  updateChecklist: async (
    issueId: number,
    checklistId: number,
    request: UpdateChecklistRequest
  ): Promise<void> => {
    await apiClient.put(`/issues/${issueId}/checklists/${checklistId}`, request)
  },

  // Toggle checklist item
  toggleChecklist: async (issueId: number, checklistId: number): Promise<void> => {
    await apiClient.patch(`/issues/${issueId}/checklists/${checklistId}/toggle`)
  },

  // Delete checklist item
  deleteChecklist: async (issueId: number, checklistId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/checklists/${checklistId}`)
  },
}
