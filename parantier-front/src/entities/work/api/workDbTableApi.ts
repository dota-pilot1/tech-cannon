import { apiClient } from '@/shared/api/axios'
import type { WorkDbTable, CreateWorkDbTableRequest, UpdateWorkDbTableRequest } from '../types/workDbTable'

export const workDbTableApi = {
  // Get DB tables for a work
  getDbTables: async (workId: number): Promise<WorkDbTable[]> => {
    const response = await apiClient.get<WorkDbTable[]>(`/works/${workId}/db-tables`)
    return response.data
  },

  // Create DB table
  createDbTable: async (workId: number, request: CreateWorkDbTableRequest): Promise<WorkDbTable> => {
    const response = await apiClient.post<WorkDbTable>(`/works/${workId}/db-tables`, request)
    return response.data
  },

  // Update DB table
  updateDbTable: async (
    workId: number,
    dbTableId: number,
    request: UpdateWorkDbTableRequest
  ): Promise<void> => {
    await apiClient.put(`/works/${workId}/db-tables/${dbTableId}`, request)
  },

  // Delete DB table
  deleteDbTable: async (workId: number, dbTableId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/db-tables/${dbTableId}`)
  },
}
