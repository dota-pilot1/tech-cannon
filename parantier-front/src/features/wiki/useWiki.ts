import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wikiApi } from "@/entities/wiki/wikiApi";
import type { WikiFolderDto, WikiPostDto } from "@/entities/wiki/wiki.types";
import { toast } from "sonner";

// ── Folder hooks ───────────────────────────────────────────────────────────────

export function useWikiFolders() {
  return useQuery({
    queryKey: ["wikiFolders"],
    queryFn: () => wikiApi.getFolders(),
  });
}

export function useCreateWikiFolderMutation(
  onSuccess?: (parentId: number | null) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: WikiFolderDto) => wikiApi.createFolder(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wikiFolders"] });
      toast.success("폴더가 생성되었습니다");
      if (onSuccess) onSuccess(variables.parentId);
    },
    onError: (error: unknown) => {
      console.error("[useCreateWikiFolderMutation] 에러:", error);
      toast.error(
        "폴더 생성 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useRenameWikiFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: WikiFolderDto }) =>
      wikiApi.updateFolder(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wikiFolders"] });
      toast.success("폴더명이 변경되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useRenameWikiFolderMutation] 에러:", error);
      toast.error(
        "폴더 수정 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useDeleteWikiFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => wikiApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wikiFolders"] });
      toast.success("폴더가 삭제되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useDeleteWikiFolderMutation] 에러:", error);
      toast.error(
        "폴더 삭제 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

// ── Post hooks ─────────────────────────────────────────────────────────────────

export function useWikiPosts(folderId: number | null) {
  return useQuery({
    queryKey: ["wikiPosts", folderId],
    queryFn: () => wikiApi.getPostsByFolder(folderId!),
    enabled: !!folderId,
  });
}

export function useAllWikiPosts() {
  return useQuery({
    queryKey: ["wikiPosts"],
    queryFn: () => wikiApi.getAllPosts(),
  });
}

export function useWikiPostDetail(postId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["wikiPost", postId],
    queryFn: () => wikiApi.getPost(postId!),
    enabled: !!postId && enabled,
  });
}

export function useSaveWikiMutation(
  postId: number | null,
  onSuccess?: (newId: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: WikiPostDto) => wikiApi.savePost(dto),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["wikiPosts"] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["wikiPost", postId] });
      }
      toast.success("저장되었습니다");
      if (onSuccess) onSuccess(newId);
    },
    onError: (error: unknown) => {
      console.error("[useSaveWikiMutation] 에러:", error);
      toast.error(
        "저장 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useDeleteWikiMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => wikiApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wikiPosts"] });
      toast.success("삭제되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useDeleteWikiMutation] 에러:", error);
      toast.error(
        "삭제 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}
