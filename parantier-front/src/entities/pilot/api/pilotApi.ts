import { apiClient } from '@/shared/api/axios'
import type {
  Pilot,
  CreatePilotRequest,
  UpdatePilotRequest,
  PilotListResponse,
  PilotFilters,
} from '../types/pilot'

export const pilotApi = {
  getPilots: async (filters?: PilotFilters): Promise<PilotListResponse> => {
    const { data } = await apiClient.get<PilotListResponse>('/pilots', {
      params: filters,
    })
    return data
  },

  getPilot: async (id: number): Promise<Pilot> => {
    const { data } = await apiClient.get<Pilot>(`/pilots/${id}`)
    return data
  },

  createPilot: async (request: CreatePilotRequest): Promise<Pilot> => {
    const { data } = await apiClient.post<Pilot>('/pilots', request)
    return data
  },

  updatePilot: async (id: number, request: UpdatePilotRequest): Promise<Pilot> => {
    const { data } = await apiClient.put<Pilot>(`/pilots/${id}`, request)
    return data
  },

  deletePilot: async (id: number): Promise<void> => {
    await apiClient.delete(`/pilots/${id}`)
  },

  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.put(`/pilots/${id}/status`, { status })
  },

  updateAssignee: async (id: number, assigneeId: number | null): Promise<void> => {
    await apiClient.put(`/pilots/${id}/assignee`, { assigneeId })
  },

  updatePriority: async (id: number, priority: string): Promise<void> => {
    await apiClient.put(`/pilots/${id}/priority`, { priority })
  },

  reorderPilots: async (items: { id: number; orderNum: number }[]): Promise<void> => {
    await apiClient.patch('/pilots/reorder', items)
  },

  archivePilots: async (ids: number[]): Promise<void> => {
    await apiClient.patch('/pilots/archive', ids)
  },

  restorePilots: async (ids: number[]): Promise<void> => {
    await apiClient.patch('/pilots/restore', ids)
  },
}
