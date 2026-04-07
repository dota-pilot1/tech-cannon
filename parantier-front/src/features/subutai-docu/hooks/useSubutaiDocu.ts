import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { subutaiDocuApi } from "../api/subutaiDocuApi";
import type {
  SubutaiDocuFolderDto,
  SubutaiDocuPostDto,
  SubutaiDocuCommentDto,
} from "../types/subutaiDocu.types";
import { toast } from "sonner";

// Folder hooks
export function useSubutaiDocuFolders() {
  return useQuery({
    queryKey: ["subutaiDocuFolders"],
    queryFn: () => subutaiDocuApi.getFolders(),
  });
}

export function useCreateSubutaiDocuFolderMutation(
  onSuccess?: (parentId: number | null) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubutaiDocuFolderDto) => subutaiDocuApi.createFolder(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subutaiDocuFolders"] });
      toast.success("폴더가 생성되었습니다");
      if (onSuccess) onSuccess(variables.parentId);
    },
    onError: (error: Error) => {
      console.error("[useCreateSubutaiDocuFolderMutation] 에러:", error);
      toast.error("폴더 생성 실패: " + (error?.message || "알 수 없는 오류"));
    },
  });
}

export function useRenameSubutaiDocuFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: SubutaiDocuFolderDto }) =>
      subutaiDocuApi.updateFolder(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subutaiDocuFolders"] });
      toast.success("폴더명이 변경되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

export function useDeleteSubutaiDocuFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subutaiDocuApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subutaiDocuFolders"] });
      toast.success("폴더가 삭제되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

// Post hooks
export function useAllSubutaiDocuPosts() {
  return useQuery({
    queryKey: ["subutaiDocuPosts"],
    queryFn: () => subutaiDocuApi.getAllPosts(),
  });
}

export function useSubutaiDocuPosts(folderId: number | null) {
  return useQuery({
    queryKey: ["subutaiDocuPosts", folderId],
    queryFn: () => subutaiDocuApi.getPostsByFolder(folderId!),
    enabled: !!folderId,
  });
}

export function useSubutaiDocuPostDetail(
  postId: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ["subutaiDocuPost", postId],
    queryFn: () => subutaiDocuApi.getPost(postId!),
    enabled: !!postId && enabled,
  });
}

export function useSaveSubutaiDocuMutation(
  _folderId: number | null,
  postId: number | null,
  onSuccess?: (newId: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubutaiDocuPostDto) => subutaiDocuApi.savePost(dto),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["subutaiDocuPosts"] });
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: ["subutaiDocuPost", postId],
        });
      }
      toast.success("저장되었습니다");
      if (onSuccess) onSuccess(newId);
    },
  });
}

export function useDeleteSubutaiDocuMutation(
  _folderId: number | null,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subutaiDocuApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subutaiDocuPosts"] });
      toast.success("삭제되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

// Comment hooks
export function useSubutaiDocuComments(postId: number | null) {
  return useQuery({
    queryKey: ["subutaiDocuComments", postId],
    queryFn: () => subutaiDocuApi.getComments(postId!),
    enabled: !!postId,
  });
}

export function useCreateSubutaiDocuCommentMutation(postId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubutaiDocuCommentDto) =>
      subutaiDocuApi.createComment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subutaiDocuComments", postId],
      });
      toast.success("댓글이 작성되었습니다");
    },
  });
}

export function useDeleteSubutaiDocuCommentMutation(postId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subutaiDocuApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subutaiDocuComments", postId],
      });
      toast.success("댓글이 삭제되었습니다");
    },
  });
}

// Tag hooks
export function useSubutaiDocuTags(postId: number | null) {
  return useQuery({
    queryKey: ["subutaiDocuTags", postId],
    queryFn: () => subutaiDocuApi.getTags(postId!),
    enabled: !!postId,
  });
}

export function useSaveSubutaiDocuTagsMutation(postId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tags: string[]) => subutaiDocuApi.saveTags(postId!, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subutaiDocuTags", postId] });
      toast.success("태그가 저장되었습니다");
    },
  });
}
