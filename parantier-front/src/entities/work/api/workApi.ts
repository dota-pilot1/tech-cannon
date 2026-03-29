import { apiClient } from '@/shared/api/axios'
import type {
  Work,
  CreateWorkRequest,
  UpdateWorkRequest,
  WorkListResponse,
  WorkFilters,
} from '../types/work'

export const workApi = {
  // 업무 목록 조회
  getWorks: async (filters?: WorkFilters): Promise<WorkListResponse> => {
    const { data } = await apiClient.get<WorkListResponse>('/works', {
      params: filters,
    })
    return data
  },

  // 업무 상세 조회
  getWork: async (id: number): Promise<Work> => {
    const { data } = await apiClient.get<Work>(`/works/${id}`)
    return data
  },

  // 업무 생성
  createWork: async (request: CreateWorkRequest): Promise<Work> => {
    const { data } = await apiClient.post<Work>('/works', request)
    return data
  },

  // 업무 수정
  updateWork: async (id: number, request: UpdateWorkRequest): Promise<Work> => {
    const { data } = await apiClient.put<Work>(`/works/${id}`, request)
    return data
  },

  // 업무 삭제
  deleteWork: async (id: number): Promise<void> => {
    await apiClient.delete(`/works/${id}`)
  },

  // 상태 변경
  updateStatus: async (id: number, status: string): Promise<void> => {
    await apiClient.put(`/works/${id}/status`, { status })
  },

  // 담당자 변경
  updateAssignee: async (id: number, assigneeId: number | null): Promise<void> => {
    await apiClient.put(`/works/${id}/assignee`, { assigneeId })
  },

  // 우선순위 변경
  updatePriority: async (id: number, priority: string): Promise<void> => {
    await apiClient.put(`/works/${id}/priority`, { priority })
  },

  // 순서 변경
  reorderWorks: async (items: { id: number; orderNum: number }[]): Promise<void> => {
    await apiClient.patch('/works/reorder', items)
  },

  // 업무 백업(아카이브)
  archiveWorks: async (ids: number[]): Promise<void> => {
    await apiClient.patch('/works/archive', ids)
  },

  // 업무 복원
  restoreWorks: async (ids: number[]): Promise<void> => {
    await apiClient.patch('/works/restore', ids)
  },
}
