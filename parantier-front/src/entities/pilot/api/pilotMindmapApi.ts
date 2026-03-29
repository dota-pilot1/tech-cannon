import { apiClient } from '@/shared/api/axios'
import type { PilotMindmap, CreatePilotMindmapRequest, UpdatePilotMindmapRequest } from '../types/pilotMindmap'

export const pilotMindmapApi = {
  getMindmaps: async (pilotId: number): Promise<PilotMindmap[]> => {
    const response = await apiClient.get<PilotMindmap[]>(`/pilots/${pilotId}/mindmaps`)
    return response.data
  },

  createMindmap: async (pilotId: number, request: CreatePilotMindmapRequest): Promise<PilotMindmap> => {
    const response = await apiClient.post<PilotMindmap>(`/pilots/${pilotId}/mindmaps`, request)
    return response.data
  },

  updateMindmap: async (pilotId: number, mindmapId: number, request: UpdatePilotMindmapRequest): Promise<void> => {
    await apiClient.put(`/pilots/${pilotId}/mindmaps/${mindmapId}`, request)
  },

  deleteMindmap: async (pilotId: number, mindmapId: number): Promise<void> => {
    await apiClient.delete(`/pilots/${pilotId}/mindmaps/${mindmapId}`)
  },
}
