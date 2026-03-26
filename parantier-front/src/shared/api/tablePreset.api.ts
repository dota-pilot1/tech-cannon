import { apiClient } from './axios'
import type { TablePreset, CreateTablePresetRequest, UpdateTablePresetRequest } from '@/shared/types/tablePreset'

export const tablePresetApi = {
  // 사용자의 모든 프리셋 조회
  getMyPresets: async (): Promise<TablePreset[]> => {
    const { data } = await apiClient.get('/table-presets')
    return data
  },

  // 기본 프리셋 조회
  getDefaultPreset: async (): Promise<TablePreset | null> => {
    try {
      const { data } = await apiClient.get('/table-presets/default')
      return data
    } catch {
      return null
    }
  },

  // 특정 프리셋 조회
  getPreset: async (id: number): Promise<TablePreset> => {
    const { data } = await apiClient.get(`/table-presets/${id}`)
    return data
  },

  // 프리셋 생성
  createPreset: async (request: CreateTablePresetRequest): Promise<TablePreset> => {
    const { data } = await apiClient.post('/table-presets', request)
    return data
  },

  // 프리셋 수정
  updatePreset: async (id: number, request: UpdateTablePresetRequest): Promise<TablePreset> => {
    const { data } = await apiClient.put(`/table-presets/${id}`, request)
    return data
  },

  // 프리셋 삭제
  deletePreset: async (id: number): Promise<void> => {
    await apiClient.delete(`/table-presets/${id}`)
  },
}
