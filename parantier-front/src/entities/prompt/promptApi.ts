import { apiClient } from "@/shared/api/client";
import type {
  PromptFolder,
  PromptFolderDto,
  Prompt,
  PromptDto,
} from "./prompt.types";

export const promptApi = {
  getFolders: async (): Promise<PromptFolder[]> => {
    const { data } = await apiClient.get("/prompt/folders");
    return data;
  },

  createFolder: async (dto: PromptFolderDto): Promise<void> => {
    await apiClient.post("/prompt/folders", dto);
  },

  renameFolder: async (id: number, name: string): Promise<void> => {
    await apiClient.put(`/prompt/folders/${id}`, { name });
  },

  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/prompt/folders/${id}`);
  },

  getPrompts: async (folderId?: number): Promise<Prompt[]> => {
    const { data } = await apiClient.get("/prompts", {
      params: folderId ? { folderId } : {},
    });
    return data;
  },

  getPrompt: async (id: number): Promise<Prompt> => {
    const { data } = await apiClient.get(`/prompts/${id}`);
    return data;
  },

  savePrompt: async (dto: PromptDto): Promise<number> => {
    const { data } = await apiClient.post("/prompts", dto);
    return data;
  },

  deletePrompt: async (id: number): Promise<void> => {
    await apiClient.delete(`/prompts/${id}`);
  },
};
