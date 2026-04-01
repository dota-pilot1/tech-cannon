import { apiClient } from "@/shared/api/client";
import type {
  ProtoFolder,
  ProtoPost,
  ProtoFolderDto,
  ProtoPostDto,
} from "./prototype.types";

export const protoApi = {
  // ── Folders ────────────────────────────────────────────────────

  getFolders: async (): Promise<ProtoFolder[]> => {
    const { data } = await apiClient.get("/prototype/folders");
    return data;
  },

  createFolder: async (dto: ProtoFolderDto): Promise<number> => {
    const { data } = await apiClient.post("/prototype/folders", dto);
    return data;
  },

  updateFolder: async (id: number, dto: ProtoFolderDto): Promise<void> => {
    await apiClient.put(`/prototype/folders/${id}`, dto);
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/prototype/folders/${id}`);
  },

  // ── Posts ──────────────────────────────────────────────────────

  getAllPosts: async (): Promise<ProtoPost[]> => {
    const { data } = await apiClient.get("/prototype/posts");
    return data;
  },

  getPostsByFolder: async (folderId: number): Promise<ProtoPost[]> => {
    const { data } = await apiClient.get("/prototype/posts", {
      params: { folderId },
    });
    return data;
  },

  getPost: async (id: number): Promise<ProtoPost> => {
    const { data } = await apiClient.get(`/prototype/posts/${id}`);
    return data;
  },

  savePost: async (dto: ProtoPostDto): Promise<number> => {
    const { data } = await apiClient.post("/prototype/posts", dto);
    return data;
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/prototype/posts/${id}`);
  },
};
