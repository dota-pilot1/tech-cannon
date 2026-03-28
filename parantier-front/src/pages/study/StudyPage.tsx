import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { StudyHomePage } from "./StudyHomePage";
import { StudyViewPage } from "./StudyViewPage";

export function StudyPage() {
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(window.location.search);
  const initialPostId = searchParams.get("postId")
    ? Number(searchParams.get("postId"))
    : null;
  const initialCategoryId = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : null;

  const [postId, setPostId] = useState<number | null>(initialPostId);
  const [categoryId, setCategoryId] = useState<number | null>(
    initialCategoryId,
  );

  const isViewPage = !!postId || !!categoryId;

  const goToCategory = (catId: number) => {
    setCategoryId(catId);
    setPostId(null);
    navigate({ to: "/study", search: { categoryId: String(catId) } });
  };

  const goToPost = (id: number, catId?: number) => {
    setPostId(id);
    if (catId) setCategoryId(catId);
    navigate({ to: "/study", search: { postId: String(id) } });
  };

  const goHome = () => {
    setPostId(null);
    setCategoryId(null);
    navigate({ to: "/study", search: {} });
  };

  if (isViewPage) {
    return (
      <StudyViewPage
        postId={postId}
        categoryId={categoryId}
        isNewMode={false}
        onSelectPost={goToPost}
        onGoHome={goHome}
      />
    );
  }

  return <StudyHomePage onSelectCategory={goToCategory} />;
}
