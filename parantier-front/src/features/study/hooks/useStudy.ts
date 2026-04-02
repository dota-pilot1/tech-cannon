import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyApi } from "../api/studyApi";
import type {
  StudyPostRequest,
  StudyCommentRequest,
  StudyCategoryRequest,
} from "../types/study.types";
import { toast } from "sonner";

// 카테고리 트리 조회
export function useStudyCategoryTree(ownerId?: number) {
  return useQuery({
    queryKey: ["study-categories", ownerId ?? null],
    queryFn: () => studyApi.getCategories(ownerId),
  });
}

// 카테고리 생성
export function useCreateStudyCategory(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: StudyCategoryRequest) => studyApi.createCategory(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-categories"] });
      toast.success("카테고리가 추가되었습니다");
      onSuccess?.();
    },
    onError: () => toast.error("카테고리 추가 실패"),
  });
}

// 카테고리 수정
export function useUpdateStudyCategory(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: StudyCategoryRequest }) =>
      studyApi.updateCategory(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-categories"] });
      toast.success("카테고리가 수정되었습니다");
      onSuccess?.();
    },
    onError: () => toast.error("카테고리 수정 실패"),
  });
}

// 카테고리 삭제
export function useDeleteStudyCategory(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studyApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-categories"] });
      queryClient.invalidateQueries({ queryKey: ["study-posts"] });
      toast.success("카테고리가 삭제되었습니다");
      onSuccess?.();
    },
    onError: () => toast.error("카테고리 삭제 실패"),
  });
}

// 게시글 목록 조회
export function useStudyPosts(
  categoryId: number | null,
  keyword?: string,
  isPublic?: boolean,
) {
  return useQuery({
    queryKey: ["study-posts", categoryId, keyword, isPublic ?? null],
    queryFn: () => studyApi.getPosts(categoryId!, keyword, isPublic),
    enabled: !!categoryId,
  });
}

// 게시글 상세 조회
export function useStudyPost(postId: number | null) {
  return useQuery({
    queryKey: ["study-post", postId],
    queryFn: () => studyApi.getPost(postId!),
    enabled: !!postId,
  });
}

// 댓글 목록 조회
export function useStudyComments(postId: number | null) {
  return useQuery({
    queryKey: ["study-comments", postId],
    queryFn: () => studyApi.getComments(postId!),
    enabled: !!postId,
  });
}

// 게시글 생성
export function useCreateStudyPost(onSuccess: (id: number) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: StudyPostRequest) => studyApi.createPost(req),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["study-posts"] });
      toast.success("게시글이 저장되었습니다");
      onSuccess(id);
    },
    onError: () => toast.error("게시글 저장 실패"),
  });
}

// 게시글 수정
export function useUpdateStudyPost(postId: number, onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: Partial<StudyPostRequest>) =>
      studyApi.updatePost(postId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-posts"] });
      queryClient.invalidateQueries({ queryKey: ["study-post", postId] });
      toast.success("게시글이 수정되었습니다");
      onSuccess();
    },
    onError: () => toast.error("게시글 수정 실패"),
  });
}

// 게시글 삭제
export function useDeleteStudyPost(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studyApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-posts"] });
      toast.success("게시글이 삭제되었습니다");
      onSuccess();
    },
    onError: () => toast.error("게시글 삭제 실패"),
  });
}

// 댓글 생성
export function useCreateStudyComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: StudyCommentRequest) =>
      studyApi.createComment(postId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["study-post", postId] });
    },
    onError: () => toast.error("댓글 작성 실패"),
  });
}

// 댓글 삭제
export function useDeleteStudyComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      studyApi.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["study-post", postId] });
      toast.success("댓글이 삭제되었습니다");
    },
  });
}

// 좋아요 토글
export function useToggleStudyLike(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => studyApi.toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-post", postId] });
    },
  });
}
