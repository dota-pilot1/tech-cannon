import { apiClient } from '@/shared/api/axios'
import type {
  WorkChecklist,
  CreateWorkChecklistRequest,
  UpdateWorkChecklistRequest,
} from '../types/workChecklist'

export const workChecklistApi = {
  // Get checklists for a work
  getChecklists: async (workId: number): Promise<WorkChecklist[]> => {
    const response = await apiClient.get<WorkChecklist[]>(`/works/${workId}/checklists`)
    return response.data
  },

  // Create checklist item
  createChecklist: async (workId: number, request: CreateWorkChecklistRequest): Promise<WorkChecklist> => {
    const response = await apiClient.post<WorkChecklist>(`/works/${workId}/checklists`, request)
    return response.data
  },

  // Update checklist item
  updateChecklist: async (
    workId: number,
    checklistId: number,
    request: UpdateWorkChecklistRequest
  ): Promise<void> => {
    await apiClient.put(`/works/${workId}/checklists/${checklistId}`, request)
  },

  // Toggle checklist item
  toggleChecklist: async (workId: number, checklistId: number): Promise<void> => {
    await apiClient.patch(`/works/${workId}/checklists/${checklistId}/toggle`)
  },

  // Delete checklist item
  deleteChecklist: async (workId: number, checklistId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/checklists/${checklistId}`)
  },
}
