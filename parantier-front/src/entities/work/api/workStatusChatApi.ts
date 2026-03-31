import { apiClient } from '@/shared/api/axios'
import type { WorkStatusChatMessageWithUser } from '../types/workStatusChat'

export const workStatusChatApi = {
  getRecentMessages: async (limit = 100): Promise<WorkStatusChatMessageWithUser[]> => {
    const { data } = await apiClient.get<WorkStatusChatMessageWithUser[]>(
      `/work-status/chat/messages?limit=${limit}`
    )
    return data
  },
}
