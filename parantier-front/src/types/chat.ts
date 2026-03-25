export interface ChatRoom {
  id: number
  name: string
  roomType: 'TEAM' | 'PROJECT' | 'DIRECT'
  createdBy: number
  createdByName: string
  createdAt: string
  isActive: boolean
  memberCount: number
}

export interface RoomMember {
  id: number
  roomId: number
  userId: number
  username: string
  email: string
  joinedAt: string
  lastReadAt: string | null
}

export interface ChatMessage {
  id?: number
  roomId?: number
  senderId?: number
  senderName: string
  content: string
  messageType?: string
  createdAt?: string
}
