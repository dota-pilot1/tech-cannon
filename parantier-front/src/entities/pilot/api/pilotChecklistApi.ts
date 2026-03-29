import { apiClient } from '@/shared/api/axios'
import type { PilotChecklist, CreatePilotChecklistRequest, UpdatePilotChecklistRequest } from '../types/pilotChecklist'

export const pilotChecklistApi = {
  getChecklists: async (pilotId: number): Promise<PilotChecklist[]> => {
    const response = await apiClient.get<PilotChecklist[]>(`/pilots/${pilotId}/checklists`)
    return response.data
  },

  createChecklist: async (pilotId: number, request: CreatePilotChecklistRequest): Promise<PilotChecklist> => {
    const response = await apiClient.post<PilotChecklist>(`/pilots/${pilotId}/checklists`, request)
    return response.data
  },

  updateChecklist: async (pilotId: number, checklistId: number, request: UpdatePilotChecklistRequest): Promise<void> => {
    await apiClient.put(`/pilots/${pilotId}/checklists/${checklistId}`, request)
  },

  toggleChecklist: async (pilotId: number, checklistId: number): Promise<void> => {
    await apiClient.patch(`/pilots/${pilotId}/checklists/${checklistId}/toggle`)
  },

  deleteChecklist: async (pilotId: number, checklistId: number): Promise<void> => {
    await apiClient.delete(`/pilots/${pilotId}/checklists/${checklistId}`)
  },
}
