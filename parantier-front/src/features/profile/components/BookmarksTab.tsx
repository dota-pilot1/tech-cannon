import { useState } from "react";
import {
  usePersonalBookmarks,
  useCreatePersonalBookmark,
  useDeletePersonalBookmark,
} from "@/features/personalBookmark/hooks/usePersonalBookmarks";
import { Bookmark, Plus, ExternalLink, Trash2, Tag, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

export function BookmarksTab() {
  const { data: bookmarks, isLoading, isError } = usePersonalBookmarks();
  const createBookmark = useCreatePersonalBookmark();
  const deleteBookmark = useDeletePersonalBookmark();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setCategory("");
    setShowForm(false);
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!url.trim()) {
      toast.error("URL을 입력해주세요.");
      return;
    }

    createBookmark.mutate(
      {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("즐겨찾기가 추가되었습니다.");
          resetForm();
        },
        onError: () => {
          toast.error("즐겨찾기 추가에 실패했습니다.");
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteBookmark.mutate(id, {
      onSuccess: () => toast.success("즐겨찾기가 삭제되었습니다."),
      onError: () => toast.error("즐겨찾기 삭제에 실패했습니다."),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Bookmark className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm">즐겨찾기 목록을 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 상단 추가 버튼 */}
      {!showForm && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            즐겨찾기 추가
          </Button>
        </div>
      )}

      {/* 추가 폼 */}
      {showForm && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-foreground">
              새 즐겨찾기 추가
            </p>
            <button
              onClick={resetForm}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                제목 <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="즐겨찾기 제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                URL <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  카테고리
                </label>
                <Input
                  placeholder="예: 개발, 디자인..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  설명
                </label>
                <Input
                  placeholder="간단한 설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              disabled={createBookmark.isPending}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={createBookmark.isPending}
            >
              {createBookmark.isPending ? "추가 중..." : "추가"}
            </Button>
          </div>
        </div>
      )}

      {/* 즐겨찾기 목록 */}
      {!bookmarks || bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Bookmark className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">즐겨찾기가 없습니다.</p>
          <p className="text-xs mt-1 opacity-70">
            위의 &apos;즐겨찾기 추가&apos; 버튼으로 추가해보세요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <Bookmark className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => window.open(bookmark.url, "_blank")}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate text-left"
                  >
                    {bookmark.title}
                  </button>
                  {bookmark.category && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                      <Tag className="w-3 h-3" />
                      {bookmark.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {bookmark.url}
                </p>
                {bookmark.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {bookmark.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => window.open(bookmark.url, "_blank")}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="새 탭에서 열기"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  disabled={deleteBookmark.isPending}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
