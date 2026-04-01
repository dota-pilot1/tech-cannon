import { apiClient } from "@/shared/api/axios";
import type { TeamBookmark, CreateBookmarkRequest } from "../types/bookmark";

export const bookmarkApi = {
  getBookmarks: async (): Promise<TeamBookmark[]> => {
    const { data } = await apiClient.get<TeamBookmark[]>("/bookmarks");
    return data;
  },

  createBookmark: async (
    request: CreateBookmarkRequest,
  ): Promise<TeamBookmark> => {
    const { data } = await apiClient.post<TeamBookmark>("/bookmarks", request);
    return data;
  },

  deleteBookmark: async (id: number): Promise<void> => {
    await apiClient.delete(`/bookmarks/${id}`);
  },
};
