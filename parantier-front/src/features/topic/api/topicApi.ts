import { apiClient } from "@/shared/api/client";
import type { Topic, TopicComment } from "@/entities/topic/types/topic";

export const topicApi = {
  getTopics: async (keyword?: string): Promise<Topic[]> => {
    const params = keyword ? { keyword } : {};
    const { data } = await apiClient.get<Topic[]>("/topics", { params });
    return data;
  },

  getTopic: async (id: number): Promise<Topic> => {
    const { data } = await apiClient.get<Topic>(`/topics/${id}`);
    return data;
  },

  createTopic: async (req: { title: string; content: string }): Promise<number> => {
    const { data } = await apiClient.post<number>("/topics", req);
    return data;
  },

  updateTopic: async (id: number, req: { title: string; content: string }): Promise<void> => {
    await apiClient.put(`/topics/${id}`, req);
  },

  deleteTopic: async (id: number): Promise<void> => {
    await apiClient.delete(`/topics/${id}`);
  },

  togglePin: async (id: number): Promise<void> => {
    await apiClient.post(`/topics/${id}/pin`);
  },

  getComments: async (topicId: number): Promise<TopicComment[]> => {
    const { data } = await apiClient.get<TopicComment[]>(`/topics/${topicId}/comments`);
    return data;
  },

  createComment: async (topicId: number, content: string): Promise<number> => {
    const { data } = await apiClient.post<number>(`/topics/${topicId}/comments`, { content });
    return data;
  },

  deleteComment: async (topicId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/topics/${topicId}/comments/${commentId}`);
  },
};
