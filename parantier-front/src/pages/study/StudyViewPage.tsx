import { useState } from "react";
import { StudySidebar } from "@/features/study/components/StudySidebar";
import { StudyPostDetail } from "@/features/study/components/StudyPostDetail";
import { useStudyPost } from "@/features/study/hooks/useStudy";

interface StudyViewPageProps {
  postId: number | null;
  categoryId: number | null;
  isNewMode: boolean;
  onSelectPost: (id: number) => void;
  onGoHome: () => void;
}

export function StudyViewPage({
  postId,
  categoryId,
  isNewMode,
  onSelectPost,
  onGoHome,
}: StudyViewPageProps) {
  const [isEditing, setIsEditing] = useState(isNewMode);
  const [editingPostId, setEditingPostId] = useState<number | null>(
    isNewMode ? null : postId,
  );

  const { data: currentPost } = useStudyPost(postId);
  const effectiveCategoryId = currentPost?.categoryId ?? categoryId;

  // 사이드바에서 문서 클릭 → 뷰어 모드
  const handleSelectPost = (id: number) => {
    setIsEditing(false);
    setEditingPostId(null);
    onSelectPost(id);
  };

  // 사이드바에서 문서 생성 직후 → 편집 모드
  const handleEditPost = (id: number) => {
    setEditingPostId(id);
    setIsEditing(true);
    onSelectPost(id); // URL도 업데이트
  };

  const handleSaved = (id: number) => {
    setIsEditing(false);
    setEditingPostId(null);
    onSelectPost(id);
  };

  const handleDeleted = () => {
    setIsEditing(false);
    setEditingPostId(null);
    onGoHome();
  };

  // 읽기 모드에서 편집 버튼 클릭
  const handleToggleEdit = (editing: boolean) => {
    setIsEditing(editing);
    if (editing) setEditingPostId(postId);
    else setEditingPostId(null);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <StudySidebar
        categoryId={effectiveCategoryId}
        selectedPostId={isEditing ? editingPostId : postId}
        onSelectPost={handleSelectPost}
        onEditPost={handleEditPost}
        onGoHome={onGoHome}
        onPostDeleted={handleDeleted}
      />

      <StudyPostDetail
        postId={isEditing ? editingPostId : postId}
        categoryId={effectiveCategoryId}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
