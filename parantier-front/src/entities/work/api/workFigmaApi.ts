import { apiClient } from '@/shared/api/axios'
import type { WorkFigma, CreateWorkFigmaRequest, UpdateWorkFigmaRequest } from '../types/workFigma'

export const workFigmaApi = {
  // Get figmas for a work
  getFigmas: async (workId: number): Promise<WorkFigma[]> => {
    const response = await apiClient.get<WorkFigma[]>(`/works/${workId}/figmas`)
    return response.data
  },

  // Create figma
  createFigma: async (workId: number, request: CreateWorkFigmaRequest): Promise<WorkFigma> => {
    const response = await apiClient.post<WorkFigma>(`/works/${workId}/figmas`, request)
    return response.data
  },

  // Update figma
  updateFigma: async (
    workId: number,
    figmaId: number,
    request: UpdateWorkFigmaRequest
  ): Promise<void> => {
    await apiClient.put(`/works/${workId}/figmas/${figmaId}`, request)
  },

  // Delete figma
  deleteFigma: async (workId: number, figmaId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/figmas/${figmaId}`)
  },
}
