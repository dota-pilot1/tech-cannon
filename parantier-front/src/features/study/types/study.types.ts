export interface StudyCategory {
  id: number;
  name: string;
  parentId: number | null;
  icon: string | null;
  description: string | null;
  orderNum: number;
  depth: number;
  children: StudyCategory[];
}

export interface StudyPost {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  content?: string; // 상세 조회 시에만 포함
  authorId: number;
  authorName: string;
  isPublic: boolean;
  viewCount: number;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyComment {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyCategoryRequest {
  name: string;
  parentId?: number | null;
  icon?: string | null;
  description?: string | null;
  orderNum?: number | null;
}

export interface StudyPostRequest {
  categoryId: number;
  title: string;
  content: string;
  isPublic?: boolean;
}

export interface StudyCommentRequest {
  content: string;
}

export interface StudyLikeResponse {
  liked: boolean;
  likeCount: number;
}
