import { apiClient } from "@/shared/api/axios";
import type {
  PersonalBookmark,
  CreatePersonalBookmarkRequest,
  UpdatePersonalBookmarkRequest,
} from "../types/personalBookmark";

export const personalBookmarkApi = {
  getBookmarks: async (): Promise<PersonalBookmark[]> => {
    const { data } = await apiClient.get<PersonalBookmark[]>(
      "/personal-bookmarks",
    );
    return data;
  },

  createBookmark: async (
    request: CreatePersonalBookmarkRequest,
  ): Promise<number> => {
    const { data } = await apiClient.post<number>(
      "/personal-bookmarks",
      request,
    );
    return data;
  },

  updateBookmark: async (
    id: number,
    request: UpdatePersonalBookmarkRequest,
  ): Promise<void> => {
    await apiClient.put(`/personal-bookmarks/${id}`, request);
  },

  deleteBookmark: async (id: number): Promise<void> => {
    await apiClient.delete(`/personal-bookmarks/${id}`);
  },
};
