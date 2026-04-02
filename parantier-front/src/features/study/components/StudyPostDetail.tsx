import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Loader2, Edit2, Trash2, Pin, ThumbsUp, Eye } from "lucide-react";
import {
  useStudyPost,
  useCreateStudyPost,
  useUpdateStudyPost,
  useDeleteStudyPost,
  useToggleStudyLike,
} from "../hooks/useStudy";
import { StudyCommentList } from "./StudyCommentList";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { useConfirm } from "@/shared/hooks/useConfirm";
import TaskBlockEditor from "@/features/task/components/TaskBlockEditor";
import TaskBlockViewer from "@/features/task/components/TaskBlockViewer";
import type { TaskBlock } from "@/features/task/types/task.types";
import type { StudyPost } from "../types/study.types";

// content 필드에 블록 배열을 JSON으로 직렬화/역직렬화
function parseBlocks(content: string | undefined): TaskBlock[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    // 구버전 단일 Lexical JSON 문자열인 경우 NOTE 블록 하나로 래핑
    return [{ blockType: "NOTE", content }];
  } catch {
    // plain text면 NOTE 블록으로 래핑
    if (content.trim()) return [{ blockType: "NOTE", content }];
    return [];
  }
}

function stringifyBlocks(blocks: TaskBlock[]): string {
  return JSON.stringify(blocks);
}

// ── 편집 폼 ──────────────────────────────────────────────────────────────────

interface StudyPostEditFormProps {
  post: StudyPost | undefined;
  categoryId: number | null;
  postId: number | null;
  onSaved: (id: number) => void;
  onCancel: () => void;
  isPersonal?: boolean;
}

function StudyPostEditForm({
  post,
  categoryId,
  postId,
  onSaved,
  onCancel,
  isPersonal,
}: StudyPostEditFormProps) {
  const [formTitle, setFormTitle] = useState(post?.title ?? "");
  const [blocks, setBlocks] = useState<TaskBlock[]>(() =>
    parseBlocks(post?.content),
  );

  const createPost = useCreateStudyPost(onSaved);
  const updatePost = useUpdateStudyPost(postId!, onCancel);

  const isPending = createPost.isPending || updatePost.isPending;

  const handleSave = () => {
    if (!formTitle.trim()) return;
    const content = stringifyBlocks(blocks);
    if (postId) {
      updatePost.mutate({ title: formTitle.trim(), content });
    } else {
      if (!categoryId) return;
      createPost.mutate({
        categoryId,
        title: formTitle.trim(),
        content,
        isPublic: isPersonal ? false : true,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
        <span className="text-sm font-semibold text-foreground">
          {postId ? "문서 편집" : "새 문서"}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/70 transition-colors"
          >
            취소
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <TaskBlockEditor
          title={formTitle}
          setTitle={setFormTitle}
          blocks={blocks}
          setBlocks={setBlocks}
        />
      </div>
    </div>
  );
}

// ── 읽기 뷰 ──────────────────────────────────────────────────────────────────

interface StudyPostViewProps {
  post: StudyPost;
  isAuthor: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleLike: () => void;
  isPersonal?: boolean;
}

function StudyPostView({
  post,
  isAuthor,
  isAdmin,
  onEdit,
  onDelete,
  onToggleLike,
  isPersonal,
}: StudyPostViewProps) {
  // TaskBlockViewer가 TaskPost 형태를 기대하므로 변환
  const taskPost = {
    id: post.id,
    folderId: post.categoryId,
    title: post.title,
    authorId: post.authorId,
    authorName: post.authorName,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    blocks: parseBlocks(post.content),
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          {post.isPinned && <Pin className="w-3.5 h-3.5 text-primary" />}
          <span className="text-sm font-semibold text-foreground truncate">
            {post.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* 메타 정보 */}
          {!isPersonal && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
              <Eye className="w-3 h-3" />
              {post.viewCount}
            </span>
          )}
          {/* 좋아요 — 내 노트에서는 숨김 */}
          {!isPersonal && (
            <button
              onClick={onToggleLike}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-colors",
                post.isLikedByMe
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{post.likeCount}</span>
            </button>
          )}
          {/* 편집/삭제 */}
          {(isAuthor || isAdmin) && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/70 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                편집
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* 작성자 / 날짜 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {post.authorName}
            </span>
            <span>·</span>
            <span>{post.createdAt.slice(0, 10)}</span>
          </div>

          {/* 블록 뷰어 */}
          <TaskBlockViewer post={taskPost} />

          {/* 댓글 — 내 노트에서는 숨김 */}
          {!isPersonal && (
            <div className="border-t pt-4">
              <StudyCommentList postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

interface StudyPostDetailProps {
  postId: number | null;
  categoryId: number | null;
  isEditing: boolean;
  onToggleEdit: (editing: boolean) => void;
  onSaved: (id: number) => void;
  onDeleted: () => void;
  isPersonal?: boolean;
}

export function StudyPostDetail({
  postId,
  categoryId,
  isEditing,
  onToggleEdit,
  onSaved,
  onDeleted,
  isPersonal,
}: StudyPostDetailProps) {
  const { data: post, isLoading, isError } = useStudyPost(postId);
  const currentUser = useStore(authStore, (state) => state.user);
  const { confirm, ConfirmDialog } = useConfirm();

  const deletePost = useDeleteStudyPost(onDeleted);
  const toggleLike = useToggleStudyLike(postId!);

  const handleDelete = async () => {
    if (!postId) return;
    const ok = await confirm({
      title: "문서 삭제",
      description: "정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      confirmText: "삭제",
      variant: "destructive",
    });
    if (ok) deletePost.mutate(postId);
  };

  const isAuthor = !!(currentUser && post && currentUser.id === post.authorId);
  const isAdmin = currentUser?.role === "ROLE_ADMIN";

  // ── 빈 상태
  if (!isEditing && !postId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/10">
        <span className="text-2xl">📄</span>
        <p>좌측에서 문서를 선택하거나 새 문서를 추가하세요.</p>
      </div>
    );
  }

  // ── 로딩
  if (!isEditing && postId && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── 에러
  if (!isEditing && postId && isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 bg-background text-sm text-muted-foreground">
        <p>문서를 불러오지 못했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />

      {isEditing ? (
        <StudyPostEditForm
          key={postId ?? "new"}
          post={post}
          categoryId={categoryId}
          postId={postId}
          onSaved={onSaved}
          onCancel={() => onToggleEdit(false)}
          isPersonal={isPersonal}
        />
      ) : post ? (
        <StudyPostView
          post={post}
          isAuthor={isAuthor}
          isAdmin={isAdmin}
          onEdit={() => onToggleEdit(true)}
          onDelete={handleDelete}
          onToggleLike={() => toggleLike.mutate()}
          isPersonal={isPersonal}
        />
      ) : null}
    </>
  );
}
