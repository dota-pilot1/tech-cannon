import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { NoteHomePage } from "./NoteHomePage";
import { NoteViewPage } from "./NoteViewPage";

export function NotePage() {
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
    navigate({
      to: "/note",
      search: { categoryId: String(catId) },
    });
  };

  const clearPost = () => {
    setPostId(null);
    if (categoryId) {
      navigate({
        to: "/note",
        search: { categoryId: String(categoryId) },
      });
    }
  };

  const goToPost = (id: number, catId?: number) => {
    setPostId(id);
    if (catId) setCategoryId(catId);
    navigate({
      to: "/note",
      search: { postId: String(id) },
    });
  };

  const goHome = () => {
    setPostId(null);
    setCategoryId(null);
    navigate({ to: "/note" });
  };

  if (isViewPage) {
    return (
      <NoteViewPage
        postId={postId}
        categoryId={categoryId}
        isNewMode={false}
        onSelectPost={goToPost}
        onGoHome={goHome}
        onClearPost={clearPost}
      />
    );
  }

  return <NoteHomePage onSelectCategory={goToCategory} />;
}
