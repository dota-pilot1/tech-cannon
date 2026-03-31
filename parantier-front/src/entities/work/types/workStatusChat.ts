export interface WorkStatusChatMessage {
  id: number;
  userId: number;
  message: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkStatusChatMessageWithUser extends WorkStatusChatMessage {
  username: string;
  userEmail: string;
}
