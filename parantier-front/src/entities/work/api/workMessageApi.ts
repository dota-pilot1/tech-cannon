import { apiClient } from '@/shared/api/axios'
import type {
  WorkMessage,
  WorkMessageWithUser,
  CreateWorkMessageRequest,
  UpdateWorkMessageRequest,
  WorkMessageCountResponse,
} from '../types/workMessage'

export const workMessageApi = {
  // 특정 업무의 메시지 목록 조회
  getMessages: async (workId: number): Promise<WorkMessageWithUser[]> => {
    const { data } = await apiClient.get<WorkMessageWithUser[]>(`/works/${workId}/messages`)
    return data
  },

  // 메시지 생성
  createMessage: async (workId: number, request: CreateWorkMessageRequest): Promise<WorkMessage> => {
    const { data } = await apiClient.post<WorkMessage>(`/works/${workId}/messages`, request)
    return data
  },

  // 메시지 수정
  updateMessage: async (workId: number, messageId: number, request: UpdateWorkMessageRequest): Promise<void> => {
    await apiClient.put(`/works/${workId}/messages/${messageId}`, request)
  },

  // 메시지 삭제
  deleteMessage: async (workId: number, messageId: number): Promise<void> => {
    await apiClient.delete(`/works/${workId}/messages/${messageId}`)
  },

  // 메시지 총 개수 조회
  getMessageCount: async (workId: number): Promise<number> => {
    const { data } = await apiClient.get<WorkMessageCountResponse>(`/works/${workId}/messages/count`)
    return data.count
  },
}
