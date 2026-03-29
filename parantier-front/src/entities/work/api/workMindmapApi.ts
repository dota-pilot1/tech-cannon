import { apiClient } from '@/shared/api/axios'
import type { WorkMindmap, CreateWorkMindmapRequest, UpdateWorkMindmapRequest } from '../types/workMindmap'

export const workMindmapApi = {
  // Get mindmaps for a work
  getMindmaps: async (workId: number): Promise<WorkMindmap[]> => {
    const response = await apiClient.get<WorkMindmap[]>(`/works/${workId}/mindmaps`)
    return response.data
  },

  // Create mindmap
  createMindmap: async (workId: number, request: CreateWorkMindmapRequest): Promise<WorkMindmap> => {
    const response = await apiClient.post<WorkMindmap>(`/works/${workId}/mindmaps`, request)
    return response.data
  },

  // Update mindmap
  updateMindmap: async (
    workId: number,
    mindmapId: number,
    request: UpdateWorkMindmapRequest
  ): Promise<void> => {
    await apiClient.put(`/works/${workId}/mindmaps/${mindmapId}`, request)
  },

  // Delete mindmap
  deleteMindmap: async (workId: number, mindmapId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/mindmaps/${mindmapId}`)
  },
}
