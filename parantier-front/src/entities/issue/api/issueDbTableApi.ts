import { apiClient } from '@/shared/api/axios'
import type { IssueDbTable, CreateDbTableRequest, UpdateDbTableRequest } from '../types/issueDbTable'

export const issueDbTableApi = {
  // Get DB tables for an issue
  getDbTables: async (issueId: number): Promise<IssueDbTable[]> => {
    const response = await apiClient.get<IssueDbTable[]>(`/issues/${issueId}/dbtables`)
    return response.data
  },

  // Create DB table
  createDbTable: async (issueId: number, request: CreateDbTableRequest): Promise<IssueDbTable> => {
    const response = await apiClient.post<IssueDbTable>(`/issues/${issueId}/dbtables`, request)
    return response.data
  },

  // Update DB table
  updateDbTable: async (
    issueId: number,
    dbTableId: number,
    request: UpdateDbTableRequest
  ): Promise<void> => {
    await apiClient.put(`/issues/${issueId}/dbtables/${dbTableId}`, request)
  },

  // Delete DB table
  deleteDbTable: async (issueId: number, dbTableId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/dbtables/${dbTableId}`)
  },
}
