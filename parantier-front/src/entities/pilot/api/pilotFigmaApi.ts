import { apiClient } from '@/shared/api/axios'
import type { PilotFigma, CreatePilotFigmaRequest, UpdatePilotFigmaRequest } from '../types/pilotFigma'

export const pilotFigmaApi = {
  getFigmas: async (pilotId: number): Promise<PilotFigma[]> => {
    const { data } = await apiClient.get<PilotFigma[]>(`/pilots/${pilotId}/figmas`)
    return data
  },

  createFigma: async (pilotId: number, request: CreatePilotFigmaRequest): Promise<PilotFigma> => {
    const { data } = await apiClient.post<PilotFigma>(`/pilots/${pilotId}/figmas`, request)
    return data
  },

  updateFigma: async (pilotId: number, figmaId: number, request: UpdatePilotFigmaRequest): Promise<void> => {
    await apiClient.put(`/pilots/${pilotId}/figmas/${figmaId}`, request)
  },

  deleteFigma: async (pilotId: number, figmaId: number): Promise<void> => {
    await apiClient.delete(`/pilots/${pilotId}/figmas/${figmaId}`)
  },
}
