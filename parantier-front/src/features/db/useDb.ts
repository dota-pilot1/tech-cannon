import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbApi } from "@/entities/db/dbApi";
import type { DbFolderDto, DbPostDto } from "@/entities/db/db.types";
import { toast } from "sonner";

// ── Folder hooks ───────────────────────────────────────────────────────────────

export function useDbFolders() {
  return useQuery({
    queryKey: ["dbFolders"],
    queryFn: () => dbApi.getFolders(),
  });
}

export function useCreateDbFolderMutation(
  onSuccess?: (parentId: number | null) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: DbFolderDto) => dbApi.createFolder(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dbFolders"] });
      toast.success("폴더가 생성되었습니다");
      if (onSuccess) onSuccess(variables.parentId);
    },
    onError: (error: unknown) => {
      console.error("[useCreateDbFolderMutation] 에러:", error);
      toast.error(
        "폴더 생성 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useRenameDbFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: DbFolderDto }) =>
      dbApi.updateFolder(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dbFolders"] });
      toast.success("폴더명이 변경되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useRenameDbFolderMutation] 에러:", error);
      toast.error(
        "폴더 수정 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useDeleteDbFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dbApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dbFolders"] });
      toast.success("폴더가 삭제되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useDeleteDbFolderMutation] 에러:", error);
      toast.error(
        "폴더 삭제 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

// ── Post hooks ─────────────────────────────────────────────────────────────────

export function useDbPosts(folderId: number | null) {
  return useQuery({
    queryKey: ["dbPosts", folderId],
    queryFn: () => dbApi.getPostsByFolder(folderId!),
    enabled: !!folderId,
  });
}

export function useAllDbPosts() {
  return useQuery({
    queryKey: ["dbPosts"],
    queryFn: () => dbApi.getAllPosts(),
  });
}

export function useDbPostDetail(postId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["dbPost", postId],
    queryFn: () => dbApi.getPost(postId!),
    enabled: !!postId && enabled,
  });
}

export function useSaveDbMutation(
  postId: number | null,
  onSuccess?: (newId: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: DbPostDto) => dbApi.savePost(dto),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["dbPosts"] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["dbPost", postId] });
      }
      toast.success("저장되었습니다");
      if (onSuccess) onSuccess(newId);
    },
    onError: (error: unknown) => {
      console.error("[useSaveDbMutation] 에러:", error);
      toast.error(
        "저장 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useDeleteDbMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dbApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dbPosts"] });
      toast.success("삭제되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useDeleteDbMutation] 에러:", error);
      toast.error(
        "삭제 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}
