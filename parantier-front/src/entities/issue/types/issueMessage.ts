export interface IssueMessage {
  id: number
  issueId: number
  userId: number
  message: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

export interface MessageWithUser extends IssueMessage {
  username: string
  userEmail: string
}

export interface CreateMessageRequest {
  message: string
}

export interface UpdateMessageRequest {
  message: string
}

export interface MessageCountResponse {
  count: number
}
