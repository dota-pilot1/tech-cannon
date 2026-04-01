import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { protoApi } from "@/entities/prototype/protoApi";
import type { ProtoFolderDto, ProtoPostDto } from "@/entities/prototype/prototype.types";
import { toast } from "sonner";

// ── Folder hooks ───────────────────────────────────────────────────────────────

export function useProtoFolders() {
  return useQuery({
    queryKey: ["protoFolders"],
    queryFn: () => protoApi.getFolders(),
  });
}

export function useCreateProtoFolderMutation(
  onSuccess?: (parentId: number | null) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProtoFolderDto) => protoApi.createFolder(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["protoFolders"] });
      toast.success("폴더가 생성되었습니다");
      if (onSuccess) onSuccess(variables.parentId);
    },
    onError: (error: unknown) => {
      console.error("[useCreateProtoFolderMutation] 에러:", error);
      toast.error(
        "폴더 생성 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useRenameProtoFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ProtoFolderDto }) =>
      protoApi.updateFolder(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protoFolders"] });
      toast.success("폴더명이 변경되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useRenameProtoFolderMutation] 에러:", error);
      toast.error(
        "폴더 수정 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useDeleteProtoFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => protoApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protoFolders"] });
      toast.success("폴더가 삭제되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useDeleteProtoFolderMutation] 에러:", error);
      toast.error(
        "폴더 삭제 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

// ── Post hooks ─────────────────────────────────────────────────────────────────

export function useProtoPosts(folderId: number | null) {
  return useQuery({
    queryKey: ["protoPosts", folderId],
    queryFn: () => protoApi.getPostsByFolder(folderId!),
    enabled: !!folderId,
  });
}

export function useAllProtoPosts() {
  return useQuery({
    queryKey: ["protoPosts"],
    queryFn: () => protoApi.getAllPosts(),
  });
}

export function useProtoPostDetail(postId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["protoPost", postId],
    queryFn: () => protoApi.getPost(postId!),
    enabled: !!postId && enabled,
  });
}

export function useSaveProtoMutation(
  postId: number | null,
  onSuccess?: (newId: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProtoPostDto) => protoApi.savePost(dto),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["protoPosts"] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["protoPost", postId] });
      }
      toast.success("저장되었습니다");
      if (onSuccess) onSuccess(newId);
    },
    onError: (error: unknown) => {
      console.error("[useSaveProtoMutation] 에러:", error);
      toast.error(
        "저장 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useDeleteProtoMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => protoApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protoPosts"] });
      toast.success("삭제되었습니다");
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      console.error("[useDeleteProtoMutation] 에러:", error);
      toast.error(
        "삭제 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}
