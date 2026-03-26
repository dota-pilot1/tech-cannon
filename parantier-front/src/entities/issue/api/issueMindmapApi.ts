import { apiClient } from '@/shared/api/axios'
import type { IssueMindmap, CreateMindmapRequest, UpdateMindmapRequest } from '../types/issueMindmap'

export const issueMindmapApi = {
  // Get mindmaps for an issue
  getMindmaps: async (issueId: number): Promise<IssueMindmap[]> => {
    const response = await apiClient.get<IssueMindmap[]>(`/issues/${issueId}/mindmaps`)
    return response.data
  },

  // Create mindmap
  createMindmap: async (issueId: number, request: CreateMindmapRequest): Promise<IssueMindmap> => {
    const response = await apiClient.post<IssueMindmap>(`/issues/${issueId}/mindmaps`, request)
    return response.data
  },

  // Update mindmap
  updateMindmap: async (
    issueId: number,
    mindmapId: number,
    request: UpdateMindmapRequest
  ): Promise<void> => {
    await apiClient.put(`/issues/${issueId}/mindmaps/${mindmapId}`, request)
  },

  // Delete mindmap
  deleteMindmap: async (issueId: number, mindmapId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/mindmaps/${mindmapId}`)
  },
}
