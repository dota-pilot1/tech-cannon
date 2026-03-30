import { apiClient } from '@/shared/api/axios'
import type { SubWork, CreateSubWorkRequest } from '../types/subWork'

export const subWorkApi = {
  getSubWorks: async (workId: number): Promise<SubWork[]> => {
    const { data } = await apiClient.get<SubWork[]>(`/works/${workId}/sub-works`)
    return data
  },
  createSubWork: async (workId: number, req: CreateSubWorkRequest): Promise<SubWork> => {
    const { data } = await apiClient.post<SubWork>(`/works/${workId}/sub-works`, req)
    return data
  },
  updateSubWork: async (workId: number, subWorkId: number, req: CreateSubWorkRequest): Promise<SubWork> => {
    const { data } = await apiClient.put<SubWork>(`/works/${workId}/sub-works/${subWorkId}`, req)
    return data
  },
  toggleSubWork: async (workId: number, subWorkId: number): Promise<void> => {
    await apiClient.patch(`/works/${workId}/sub-works/${subWorkId}/toggle`)
  },
  deleteSubWork: async (workId: number, subWorkId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/sub-works/${subWorkId}`)
  },
}
