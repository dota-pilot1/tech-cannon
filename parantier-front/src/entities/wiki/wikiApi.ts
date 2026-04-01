import { apiClient } from "@/shared/api/client";
import type {
  WikiFolder,
  WikiPost,
  WikiFolderDto,
  WikiPostDto,
} from "./wiki.types";

export const wikiApi = {
  // ── Folders ────────────────────────────────────────────────────

  getFolders: async (): Promise<WikiFolder[]> => {
    const { data } = await apiClient.get("/wiki/folders");
    return data;
  },

  createFolder: async (dto: WikiFolderDto): Promise<number> => {
    const { data } = await apiClient.post("/wiki/folders", dto);
    return data;
  },

  updateFolder: async (id: number, dto: WikiFolderDto): Promise<void> => {
    await apiClient.put(`/wiki/folders/${id}`, dto);
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/wiki/folders/${id}`);
  },

  // ── Posts ──────────────────────────────────────────────────────

  getAllPosts: async (): Promise<WikiPost[]> => {
    const { data } = await apiClient.get("/wiki/posts");
    return data;
  },

  getPostsByFolder: async (folderId: number): Promise<WikiPost[]> => {
    const { data } = await apiClient.get("/wiki/posts", {
      params: { folderId },
    });
    return data;
  },

  getPost: async (id: number): Promise<WikiPost> => {
    const { data } = await apiClient.get(`/wiki/posts/${id}`);
    return data;
  },

  savePost: async (dto: WikiPostDto): Promise<number> => {
    const { data } = await apiClient.post("/wiki/posts", dto);
    return data;
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/wiki/posts/${id}`);
  },
};
