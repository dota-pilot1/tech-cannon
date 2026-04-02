import { apiClient } from "@/shared/api/client";
import type {
  DbFolder,
  DbPost,
  DbFolderDto,
  DbPostDto,
} from "./db.types";

export const dbApi = {
  // ── Folders ────────────────────────────────────────────────────

  getFolders: async (): Promise<DbFolder[]> => {
    const { data } = await apiClient.get("/db/folders");
    return data;
  },

  createFolder: async (dto: DbFolderDto): Promise<number> => {
    const { data } = await apiClient.post("/db/folders", dto);
    return data;
  },

  updateFolder: async (id: number, dto: DbFolderDto): Promise<void> => {
    await apiClient.put(`/db/folders/${id}`, dto);
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/db/folders/${id}`);
  },

  // ── Posts ──────────────────────────────────────────────────────

  getAllPosts: async (): Promise<DbPost[]> => {
    const { data } = await apiClient.get("/db/posts");
    return data;
  },

  getPostsByFolder: async (folderId: number): Promise<DbPost[]> => {
    const { data } = await apiClient.get("/db/posts", {
      params: { folderId },
    });
    return data;
  },

  getPost: async (id: number): Promise<DbPost> => {
    const { data } = await apiClient.get(`/db/posts/${id}`);
    return data;
  },

  savePost: async (dto: DbPostDto): Promise<number> => {
    const { data } = await apiClient.post("/db/posts", dto);
    return data;
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/db/posts/${id}`);
  },
};
