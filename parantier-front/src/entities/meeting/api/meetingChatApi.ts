import { apiClient } from "@/shared/api/axios";
import type { MeetingChatMessageWithUser } from "../types/meetingChat";
import type { MeetingChannel } from "../types/meetingChat";

export const meetingChatApi = {
  getRecentMessages: async (
    limit = 100,
    channelId?: number,
  ): Promise<MeetingChatMessageWithUser[]> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (channelId !== undefined) {
      params.append("channelId", String(channelId));
    }
    const { data } = await apiClient.get<MeetingChatMessageWithUser[]>(
      `/meeting/chat/messages?${params.toString()}`,
    );
    return data;
  },

  getChannels: async (): Promise<MeetingChannel[]> => {
    const { data } = await apiClient.get<MeetingChannel[]>("/meeting/channels");
    return data;
  },
};
