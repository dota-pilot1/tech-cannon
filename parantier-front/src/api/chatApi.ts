import { apiClient } from '@/shared/api/client'
import type { ChatRoom, RoomMember, ChatMessage } from '@/types/chat'

export const chatApi = {
  // 모든 활성 채팅방 목록
  getAllRooms: async (): Promise<ChatRoom[]> => {
    const { data } = await apiClient.get('/chat/rooms')
    return data
  },

  // 내가 참가한 채팅방 목록
  getMyRooms: async (): Promise<ChatRoom[]> => {
    const { data } = await apiClient.get('/chat/rooms/my')
    return data
  },

  // 채팅방 상세 조회
  getRoom: async (id: number): Promise<ChatRoom> => {
    const { data } = await apiClient.get(`/chat/rooms/${id}`)
    return data
  },

  // 채팅방 참가자 목록
  getRoomMembers: async (roomId: number): Promise<RoomMember[]> => {
    const { data } = await apiClient.get(`/chat/rooms/${roomId}/members`)
    return data
  },

  // 채팅방 생성
  createRoom: async (room: Partial<ChatRoom>): Promise<number> => {
    const { data } = await apiClient.post('/chat/rooms', room)
    return data
  },

  // 채팅방 수정
  updateRoom: async (id: number, room: Partial<ChatRoom>): Promise<void> => {
    await apiClient.put(`/chat/rooms/${id}`, room)
  },

  // 채팅방 삭제
  deleteRoom: async (id: number): Promise<void> => {
    await apiClient.delete(`/chat/rooms/${id}`)
  },

  // 모든 채팅방 삭제 (관리자 전용)
  deleteAllRooms: async (): Promise<void> => {
    await apiClient.delete('/chat/rooms/all')
  },

  // 채팅방 참가
  joinRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/chat/rooms/${roomId}/join`)
  },

  // 채팅방 나가기
  leaveRoom: async (roomId: number): Promise<void> => {
    await apiClient.post(`/chat/rooms/${roomId}/leave`)
  },

  // 채팅방 메시지 히스토리 조회
  getRoomMessages: async (
    roomId: number,
    limit: number = 50,
    beforeId?: number
  ): Promise<ChatMessage[]> => {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (beforeId) {
      params.append('beforeId', beforeId.toString())
    }
    const { data } = await apiClient.get(`/chat/rooms/${roomId}/messages?${params}`)
    return data
  },
}
