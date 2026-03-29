import { apiClient } from '@/shared/api/axios'
import type { IssueFigma, CreateFigmaRequest, UpdateFigmaRequest } from '../types/issueFigma'

export const issueFigmaApi = {
  getFigmas: async (issueId: number): Promise<IssueFigma[]> => {
    const response = await apiClient.get<IssueFigma[]>(`/issues/${issueId}/figmas`)
    return response.data
  },

  createFigma: async (issueId: number, request: CreateFigmaRequest): Promise<IssueFigma> => {
    const response = await apiClient.post<IssueFigma>(`/issues/${issueId}/figmas`, request)
    return response.data
  },

  updateFigma: async (issueId: number, figmaId: number, request: UpdateFigmaRequest): Promise<void> => {
    await apiClient.put(`/issues/${issueId}/figmas/${figmaId}`, request)
  },

  deleteFigma: async (issueId: number, figmaId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/figmas/${figmaId}`)
  },
}
