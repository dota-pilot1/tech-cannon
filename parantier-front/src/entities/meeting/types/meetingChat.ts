export interface MeetingChannel {
  id: number;
  name: string;
  slug: string;
  orderNum: number;
  isActive: boolean;
}

export interface MeetingChatMessage {
  id: number;
  userId: number;
  message: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingChatMessageWithUser extends MeetingChatMessage {
  username: string;
  userEmail: string;
}
