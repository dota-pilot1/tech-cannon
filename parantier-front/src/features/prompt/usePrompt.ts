import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promptApi } from "@/entities/prompt/promptApi";
import type { PromptDto, PromptFolderDto } from "@/entities/prompt/prompt.types";

export const usePromptFolders = () =>
  useQuery({
    queryKey: ["prompt-folders"],
    queryFn: promptApi.getFolders,
    staleTime: 1000 * 60,
  });

export const usePromptsByFolder = (folderId: number | null) =>
  useQuery({
    queryKey: ["prompts", folderId],
    queryFn: () => promptApi.getPrompts(folderId ?? undefined),
    enabled: true,
    staleTime: 1000 * 30,
  });

export const usePromptDetail = (id: number | null) =>
  useQuery({
    queryKey: ["prompt", id],
    queryFn: () => promptApi.getPrompt(id!),
    enabled: !!id,
    staleTime: 1000 * 30,
  });

export const useSavePromptMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PromptDto) => promptApi.savePrompt(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
};

export const useDeletePromptMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => promptApi.deletePrompt(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
};

export const useCreatePromptFolderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PromptFolderDto) => promptApi.createFolder(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompt-folders"] });
    },
  });
};

export const useRenamePromptFolderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      promptApi.renameFolder(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompt-folders"] });
    },
  });
};

export const useDeletePromptFolderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => promptApi.deleteFolder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompt-folders"] });
    },
  });
};
