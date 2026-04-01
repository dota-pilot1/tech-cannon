import { apiClient } from "@/shared/api/axios";
import type { MeetingChatMessageWithUser } from "../types/meetingChat";
import type { MeetingChannel } from "../types/meetingChat";

export interface ReorderChannelItem {
  id: number;
  orderNum: number;
}

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

  createChannel: async (name: string): Promise<MeetingChannel> => {
    const { data } = await apiClient.post<MeetingChannel>("/meeting/channels", {
      name,
    });
    return data;
  },

  updateChannel: async (
    id: number,
    name: string,
    orderNum: number,
  ): Promise<MeetingChannel> => {
    const { data } = await apiClient.put<MeetingChannel>(
      `/meeting/channels/${id}`,
      { name, orderNum },
    );
    return data;
  },

  deleteChannel: async (id: number): Promise<void> => {
    await apiClient.delete(`/meeting/channels/${id}`);
  },

  reorderChannels: async (
    items: ReorderChannelItem[],
  ): Promise<MeetingChannel[]> => {
    const { data } = await apiClient.put<MeetingChannel[]>(
      "/meeting/channels/reorder",
      { items },
    );
    return data;
  },
};
