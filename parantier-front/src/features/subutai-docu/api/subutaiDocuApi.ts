import { apiClient } from "@/shared/api/client";
import type {
  SubutaiDocuFolder,
  SubutaiDocuPost,
  SubutaiDocuComment,
  SubutaiDocuFolderDto,
  SubutaiDocuPostDto,
  SubutaiDocuCommentDto,
  SubutaiTagSearchResult,
} from "../types/subutaiDocu.types";

export const subutaiDocuApi = {
  // Folders
  getFolders: async (): Promise<SubutaiDocuFolder[]> => {
    const { data } = await apiClient.get("/subutai/folders");
    return data;
  },

  getFolder: async (id: number): Promise<SubutaiDocuFolder> => {
    const { data } = await apiClient.get(`/subutai/folders/${id}`);
    return data;
  },

  createFolder: async (dto: SubutaiDocuFolderDto): Promise<number> => {
    const { data } = await apiClient.post("/subutai/folders", dto);
    return data;
  },

  updateFolder: async (
    id: number,
    dto: SubutaiDocuFolderDto,
  ): Promise<void> => {
    await apiClient.put(`/subutai/folders/${id}`, dto);
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/subutai/folders/${id}`);
  },

  // Posts
  getAllPosts: async (): Promise<SubutaiDocuPost[]> => {
    const { data } = await apiClient.get("/subutai/posts");
    return data;
  },

  getPostsByFolder: async (folderId: number): Promise<SubutaiDocuPost[]> => {
    const { data } = await apiClient.get("/subutai/posts", {
      params: { folderId },
    });
    return data;
  },

  getPost: async (id: number): Promise<SubutaiDocuPost> => {
    const { data } = await apiClient.get(`/subutai/posts/${id}`);
    return data;
  },

  savePost: async (dto: SubutaiDocuPostDto): Promise<number> => {
    const { data } = await apiClient.post("/subutai/posts", dto);
    return data;
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/subutai/posts/${id}`);
  },

  // Comments
  getComments: async (postId: number): Promise<SubutaiDocuComment[]> => {
    const { data } = await apiClient.get("/subutai/comments", {
      params: { postId },
    });
    return data;
  },

  createComment: async (dto: SubutaiDocuCommentDto): Promise<number> => {
    const { data } = await apiClient.post("/subutai/comments", dto);
    return data;
  },

  deleteComment: async (id: number): Promise<void> => {
    await apiClient.delete(`/subutai/comments/${id}`);
  },

  // Tags
  getTags: async (postId: number): Promise<string[]> => {
    const { data } = await apiClient.get(`/subutai/posts/${postId}/tags`);
    return data;
  },

  saveTags: async (postId: number, tags: string[]): Promise<void> => {
    await apiClient.put(`/subutai/posts/${postId}/tags`, { tags });
  },

  searchByTag: async (keyword: string): Promise<SubutaiTagSearchResult[]> => {
    const { data } = await apiClient.get("/subutai/posts/tags/search", {
      params: { keyword },
    });
    return data;
  },
};
