import { apiClient } from '@/shared/api/axios'
import type { PilotDbTable, CreatePilotDbTableRequest, UpdatePilotDbTableRequest } from '../types/pilotDbTable'

export const pilotDbTableApi = {
  getDbTables: async (pilotId: number): Promise<PilotDbTable[]> => {
    const { data } = await apiClient.get<PilotDbTable[]>(`/pilots/${pilotId}/dbtables`)
    return data
  },

  createDbTable: async (pilotId: number, request: CreatePilotDbTableRequest): Promise<PilotDbTable> => {
    const { data } = await apiClient.post<PilotDbTable>(`/pilots/${pilotId}/dbtables`, request)
    return data
  },

  updateDbTable: async (pilotId: number, dbTableId: number, request: UpdatePilotDbTableRequest): Promise<void> => {
    await apiClient.put(`/pilots/${pilotId}/dbtables/${dbTableId}`, request)
  },

  deleteDbTable: async (pilotId: number, dbTableId: number): Promise<void> => {
    await apiClient.delete(`/pilots/${pilotId}/dbtables/${dbTableId}`)
  },
}
