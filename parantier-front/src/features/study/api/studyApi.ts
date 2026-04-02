import { apiClient } from "@/shared/api/client";
import type {
  StudyCategory,
  StudyPost,
  StudyComment,
  StudyPostRequest,
  StudyCategoryRequest,
  StudyCommentRequest,
  StudyLikeResponse,
} from "../types/study.types";

export const studyApi = {
  // 카테고리
  getCategories: async (ownerId?: number): Promise<StudyCategory[]> => {
    const { data } = await apiClient.get("/study/categories", {
      params: { ownerId: ownerId ?? undefined },
    });
    return data;
  },

  createCategory: async (req: StudyCategoryRequest): Promise<number> => {
    const { data } = await apiClient.post("/study/categories", req);
    return data;
  },

  updateCategory: async (
    id: number,
    req: StudyCategoryRequest,
  ): Promise<void> => {
    await apiClient.put(`/study/categories/${id}`, req);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/study/categories/${id}`);
  },

  // 게시글
  getPosts: async (
    categoryId: number,
    keyword?: string,
    isPublic?: boolean,
  ): Promise<StudyPost[]> => {
    const { data } = await apiClient.get("/study/posts", {
      params: {
        categoryId,
        keyword: keyword || undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
      },
    });
    return data;
  },

  getPost: async (id: number): Promise<StudyPost> => {
    const { data } = await apiClient.get(`/study/posts/${id}`);
    return data;
  },

  createPost: async (req: StudyPostRequest): Promise<number> => {
    const { data } = await apiClient.post("/study/posts", req);
    return data;
  },

  updatePost: async (
    id: number,
    req: Partial<StudyPostRequest>,
  ): Promise<void> => {
    await apiClient.put(`/study/posts/${id}`, req);
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/study/posts/${id}`);
  },

  togglePin: async (id: number): Promise<void> => {
    await apiClient.post(`/study/posts/${id}/pin`);
  },

  // 댓글
  getComments: async (postId: number): Promise<StudyComment[]> => {
    const { data } = await apiClient.get(`/study/posts/${postId}/comments`);
    return data;
  },

  createComment: async (
    postId: number,
    req: StudyCommentRequest,
  ): Promise<number> => {
    const { data } = await apiClient.post(
      `/study/posts/${postId}/comments`,
      req,
    );
    return data;
  },

  deleteComment: async (postId: number, commentId: number): Promise<void> => {
    await apiClient.delete(`/study/posts/${postId}/comments/${commentId}`);
  },

  // 좋아요
  toggleLike: async (postId: number): Promise<StudyLikeResponse> => {
    const { data } = await apiClient.post(`/study/posts/${postId}/like`);
    return data;
  },
};
