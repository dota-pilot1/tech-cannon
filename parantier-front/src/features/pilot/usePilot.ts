import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi as pilotApi } from "@/entities/pilot/pilotApi";
import type {
  TaskFolderDto,
  TaskPostDto,
  TaskCommentDto,
} from "@/entities/pilot/pilot.types";
import { toast } from "sonner";

// Folder hooks
export function usePilotFolders() {
  return useQuery({
    queryKey: ["pilotFolders"],
    queryFn: () => pilotApi.getFolders(),
  });
}

export function useCreateFolderMutation(
  onSuccess?: (parentId: number | null) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: TaskFolderDto) => pilotApi.createFolder(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pilotFolders"] });
      toast.success("폴더가 생성되었습니다");
      if (onSuccess) onSuccess(variables.parentId);
    },
    onError: (error: unknown) => {
      console.error("[useCreateFolderMutation] 에러:", error);
      toast.error(
        "폴더 생성 실패: " + ((error as Error)?.message || "알 수 없는 오류"),
      );
    },
  });
}

export function useRenameFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: TaskFolderDto }) =>
      pilotApi.updateFolder(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotFolders"] });
      toast.success("폴더명이 변경되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

export function useDeleteFolderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pilotApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotFolders"] });
      toast.success("폴더가 삭제되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

// Post hooks
export function useAllPilotPosts() {
  return useQuery({
    queryKey: ["pilotPosts"],
    queryFn: () => pilotApi.getAllPosts(),
  });
}

export function usePilotPosts(folderId: number | null) {
  return useQuery({
    queryKey: ["pilotPosts", folderId],
    queryFn: () => pilotApi.getPostsByFolder(folderId!),
    enabled: !!folderId,
  });
}

export function usePilotPostDetail(postId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["pilotPost", postId],
    queryFn: () => pilotApi.getPost(postId!),
    enabled: !!postId && enabled,
  });
}

export function useSavePilotMutation(
  _folderId: number | null,
  postId: number | null,
  onSuccess?: (newId: number) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: TaskPostDto) => pilotApi.savePost(dto),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["pilotPosts"] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["pilotPost", postId] });
      }
      toast.success("저장되었습니다");
      if (onSuccess) onSuccess(newId);
    },
  });
}

export function useDeletePilotMutation(
  _folderId: number | null,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pilotApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotPosts"] });
      toast.success("삭제되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

// Comment hooks
export function usePilotComments(postId: number | null) {
  return useQuery({
    queryKey: ["pilotComments", postId],
    queryFn: () => pilotApi.getComments(postId!),
    enabled: !!postId,
  });
}

export function useCreateCommentMutation(postId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: TaskCommentDto) => pilotApi.createComment(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotComments", postId] });
      toast.success("댓글이 작성되었습니다");
    },
  });
}

export function useDeleteCommentMutation(postId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pilotApi.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotComments", postId] });
      toast.success("댓글이 삭제되었습니다");
    },
  });
}
