export interface WorkMessage {
  id: number
  workId: number
  userId: number
  message: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkMessageWithUser extends WorkMessage {
  username: string
  userEmail: string
}

export interface CreateWorkMessageRequest {
  message: string
}

export interface UpdateWorkMessageRequest {
  message: string
}

export interface WorkMessageCountResponse {
  count: number
}
