import { apiClient } from '@/shared/api/axios'
import type {
  MessageWithUser,
  IssueMessage,
  CreateMessageRequest,
  UpdateMessageRequest,
  MessageCountResponse,
} from '../types/issueMessage'

export const issueMessageApi = {
  // 특정 이슈의 메시지 목록 조회
  getMessages: async (issueId: number): Promise<MessageWithUser[]> => {
    const { data } = await apiClient.get<MessageWithUser[]>(`/issues/${issueId}/messages`)
    return data
  },

  // 메시지 생성
  createMessage: async (issueId: number, request: CreateMessageRequest): Promise<IssueMessage> => {
    const { data } = await apiClient.post<IssueMessage>(`/issues/${issueId}/messages`, request)
    return data
  },

  // 메시지 수정
  updateMessage: async (issueId: number, messageId: number, request: UpdateMessageRequest): Promise<void> => {
    await apiClient.put(`/issues/${issueId}/messages/${messageId}`, request)
  },

  // 메시지 삭제
  deleteMessage: async (issueId: number, messageId: number): Promise<void> => {
    await apiClient.delete(`/issues/${issueId}/messages/${messageId}`)
  },

  // 메시지 총 개수 조회
  getMessageCount: async (issueId: number): Promise<number> => {
    const { data } = await apiClient.get<MessageCountResponse>(`/issues/${issueId}/messages/count`)
    return data.count
  },
}
