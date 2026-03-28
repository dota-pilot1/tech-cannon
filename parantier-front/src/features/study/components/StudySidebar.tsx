import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  FilePlus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useStudyCategoryTree,
  useStudyPosts,
  useCreateStudyPost,
  useDeleteStudyPost,
  useUpdateStudyPost,
} from "../hooks/useStudy";
import { useConfirm } from "@/shared/hooks/useConfirm";
import type { StudyCategory, StudyPost } from "../types/study.types";

// ── Props ─────────────────────────────────────────────────────────────────────

interface StudySidebarProps {
  categoryId: number | null; // 현재 선택된 2차 카테고리 ID
  selectedPostId: number | null;
  onSelectPost: (id: number) => void; // 문서 클릭 → 뷰어
  onEditPost: (id: number) => void; // 문서 생성 직후 → 편집 모드
  onGoHome: () => void;
  onPostDeleted?: () => void;
}

// ── 컨텍스트 메뉴 (공용) ──────────────────────────────────────────────────────

interface MenuState {
  x: number;
  y: number;
}
interface CategoryMenuState extends MenuState {
  category: StudyCategory;
}
interface PostMenuState extends MenuState {
  post: StudyPost;
}

function useContextMenuClose(
  ref: React.RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onClose]);
}

// 2차 카테고리 우클릭 메뉴
function CategoryContextMenu({
  menu,
  onAddDoc,
  onClose,
}: {
  menu: CategoryMenuState;
  onAddDoc: (cat: StudyCategory) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useContextMenuClose(ref, onClose);
  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: menu.y, left: menu.x, zIndex: 9999 }}
      className="min-w-[160px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm"
    >
      <button
        onClick={() => {
          onAddDoc(menu.category);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 text-foreground transition-colors"
      >
        <FilePlus className="w-3.5 h-3.5 text-muted-foreground" />
        문서 추가
      </button>
    </div>
  );
}

// 문서 우클릭 메뉴
function PostContextMenu({
  menu,
  onAddDoc,
  onRename,
  onDelete,
  onClose,
}: {
  menu: PostMenuState;
  onAddDoc: (post: StudyPost) => void;
  onRename: (post: StudyPost) => void;
  onDelete: (post: StudyPost) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useContextMenuClose(ref, onClose);
  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: menu.y, left: menu.x, zIndex: 9999 }}
      className="min-w-[160px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm"
    >
      <button
        onClick={() => {
          onAddDoc(menu.post);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 text-foreground transition-colors"
      >
        <FilePlus className="w-3.5 h-3.5 text-muted-foreground" />
        문서 추가
      </button>
      <div className="my-1 border-t border-border" />
      <button
        onClick={() => {
          onRename(menu.post);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 text-foreground transition-colors"
      >
        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        이름 변경
      </button>
      <div className="my-1 border-t border-border" />
      <button
        onClick={() => {
          onDelete(menu.post);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-destructive/10 text-destructive transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        삭제
      </button>
    </div>
  );
}

// ── 인라인 제목 입력창 ────────────────────────────────────────────────────────

function InlineDocInput({
  depth,
  onConfirm,
  onCancel,
}: {
  depth: number;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div
      className="flex items-center gap-1.5 py-1"
      style={{ paddingLeft: `${(depth + 1) * 16 + 4}px`, paddingRight: "8px" }}
    >
      <span className="text-xs shrink-0">📝</span>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") {
            const v = value.trim();
            if (v) onConfirm(v);
            else onCancel();
          }
          if (e.key === "Escape") onCancel();
        }}
        onBlur={() => {
          const v = value.trim();
          if (v) onConfirm(v);
          else onCancel();
        }}
        placeholder="제목 입력 후 Enter"
        className="flex-1 border border-blue-400 rounded px-1.5 py-0.5 text-xs min-w-0
                   focus:outline-none focus:ring-1 focus:ring-blue-400 bg-background text-foreground"
      />
    </div>
  );
}

// ── 인라인 이름 변경 입력창 ───────────────────────────────────────────────────

function InlineRenameInput({
  initialValue,
  onConfirm,
  onCancel,
}: {
  initialValue: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Enter") {
          const v = value.trim();
          if (v) onConfirm(v);
          else onCancel();
        }
        if (e.key === "Escape") onCancel();
      }}
      onBlur={() => {
        const v = value.trim();
        if (v) onConfirm(v);
        else onCancel();
      }}
      onClick={(e) => e.stopPropagation()}
      className="flex-1 min-w-0 px-1 py-0 text-sm bg-background border border-ring rounded
                 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

// ── 2차 카테고리 섹션 ─────────────────────────────────────────────────────────

interface CategorySectionProps {
  sub: StudyCategory;
  isExpanded: boolean;
  isActive: boolean;
  selectedPostId: number | null;
  renamingPostId: number | null;
  inlineDocCategoryId: number | null; // 인라인 입력 열린 카테고리 ID
  onToggle: () => void;
  onSelectPost: (id: number) => void;
  onCategoryContextMenu: (e: React.MouseEvent, cat: StudyCategory) => void;
  onPostContextMenu: (e: React.MouseEvent, post: StudyPost) => void;
  onRenameConfirm: (id: number, title: string) => void;
  onRenameCancel: () => void;
  onInlineDocConfirm: (categoryId: number, title: string) => void;
  onInlineDocCancel: () => void;
}

function CategorySection({
  sub,
  isExpanded,
  isActive,
  selectedPostId,
  renamingPostId,
  inlineDocCategoryId,
  onToggle,
  onSelectPost,
  onCategoryContextMenu,
  onPostContextMenu,
  onRenameConfirm,
  onRenameCancel,
  onInlineDocConfirm,
  onInlineDocCancel,
}: CategorySectionProps) {
  const { data: posts = [], isLoading } = useStudyPosts(
    isExpanded ? sub.id : null,
  );

  return (
    <div>
      {/* 2차 카테고리 헤더 */}
      <div
        onClick={onToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          onCategoryContextMenu(e, sub);
        }}
        className={cn(
          "group flex items-center gap-2 px-3 py-2 cursor-pointer select-none",
          "hover:bg-muted/50 transition-colors",
          isActive && "bg-muted/30",
        )}
      >
        <span className="shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </span>
        <span className="shrink-0 text-base leading-none">
          {sub.icon || "📁"}
        </span>
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          {sub.name}
        </span>
        {/* hover 시 + 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCategoryContextMenu(e, sub);
          }}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded
                     text-muted-foreground hover:text-primary transition-all"
          title="문서 추가"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 펼쳐진 경우: 게시글 목록 + 인라인 입력 */}
      {isExpanded && (
        <div>
          {isLoading ? (
            <div className="px-4 py-2 space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-5 rounded bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onPostContextMenu(e, post);
                  }}
                  className={cn(
                    "flex items-center gap-2 pl-9 pr-3 py-1.5",
                    "text-sm cursor-pointer transition-colors select-none",
                    selectedPostId === post.id
                      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  <span className="shrink-0 text-[11px]">📄</span>
                  {renamingPostId === post.id ? (
                    <InlineRenameInput
                      initialValue={post.title}
                      onConfirm={(title) => onRenameConfirm(post.id, title)}
                      onCancel={onRenameCancel}
                    />
                  ) : (
                    <span className="truncate flex-1">{post.title}</span>
                  )}
                  {renamingPostId !== post.id && post.isPinned && (
                    <span className="shrink-0 text-[10px]">📌</span>
                  )}
                </div>
              ))}

              {/* 인라인 문서 제목 입력창 */}
              {inlineDocCategoryId === sub.id && (
                <InlineDocInput
                  depth={0}
                  onConfirm={(title) => onInlineDocConfirm(sub.id, title)}
                  onCancel={onInlineDocCancel}
                />
              )}

              {/* 문서가 없고 인라인 입력도 없을 때 */}
              {posts.length === 0 && inlineDocCategoryId !== sub.id && (
                <div className="pl-9 pr-3 py-1.5">
                  <button
                    onClick={() =>
                      onCategoryContextMenu(
                        { clientX: 0, clientY: 0 } as React.MouseEvent,
                        sub,
                      )
                    }
                    className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    + 첫 문서 작성하기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── 메인 사이드바 ─────────────────────────────────────────────────────────────

export function StudySidebar({
  categoryId,
  selectedPostId,
  onSelectPost,
  onEditPost,
  onGoHome,
  onPostDeleted,
}: StudySidebarProps) {
  const { data: allCategories = [] } = useStudyCategoryTree();
  const { confirm, ConfirmDialog } = useConfirm();

  // 컨텍스트 메뉴 상태
  const [categoryMenu, setCategoryMenu] = useState<CategoryMenuState | null>(
    null,
  );
  const [postMenu, setPostMenu] = useState<PostMenuState | null>(null);

  // 인라인 문서 입력 열린 카테고리 ID
  const [inlineDocCategoryId, setInlineDocCategoryId] = useState<number | null>(
    null,
  );

  // 이름 변경 중인 postId
  const [renamingPostId, setRenamingPostId] = useState<number | null>(null);

  // 현재 categoryId가 속한 1차 카테고리 & 형제 2차 카테고리
  const { parentCategory, siblings } = (() => {
    if (!categoryId)
      return { parentCategory: null, siblings: [] as StudyCategory[] };
    for (const root of allCategories) {
      const found = root.children?.find((c) => c.id === categoryId);
      if (found) return { parentCategory: root, siblings: root.children ?? [] };
    }
    const rootFound = allCategories.find((c) => c.id === categoryId);
    if (rootFound)
      return { parentCategory: rootFound, siblings: rootFound.children ?? [] };
    return { parentCategory: null, siblings: [] as StudyCategory[] };
  })();

  // ── mutations ──────────────────────────────────────────────────────────────

  const createPost = useCreateStudyPost((newId) => {
    setInlineDocCategoryId(null);
    onEditPost(newId); // 생성 후 바로 본문 편집 진입
  });

  const deletePost = useDeleteStudyPost(() => {
    onPostDeleted?.();
  });

  const updatePost = useUpdateStudyPost(renamingPostId ?? 0, () => {
    setRenamingPostId(null);
  });

  // ── 카테고리 컨텍스트 메뉴 ────────────────────────────────────────────────

  const openCategoryMenu = useCallback(
    (e: React.MouseEvent, cat: StudyCategory) => {
      e.preventDefault();
      e.stopPropagation();
      // + 버튼 클릭 시 직접 인라인 열기
      if (e.clientX === 0 && e.clientY === 0) {
        setInlineDocCategoryId(cat.id);
        return;
      }
      const x = Math.min(e.clientX, window.innerWidth - 170);
      const y = Math.min(e.clientY, window.innerHeight - 80);
      setCategoryMenu({ x, y, category: cat });
    },
    [],
  );

  const handleCategoryAddDoc = useCallback((cat: StudyCategory) => {
    setInlineDocCategoryId(cat.id);
  }, []);

  // ── 문서 컨텍스트 메뉴 ────────────────────────────────────────────────────

  const openPostMenu = useCallback((e: React.MouseEvent, post: StudyPost) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 170);
    const y = Math.min(e.clientY, window.innerHeight - 120);
    setPostMenu({ x, y, post });
  }, []);

  const handlePostAddDoc = useCallback((post: StudyPost) => {
    setInlineDocCategoryId(post.categoryId);
  }, []);

  const handleRenameStart = useCallback((post: StudyPost) => {
    setRenamingPostId(post.id);
  }, []);

  const handleRenameConfirm = useCallback(
    (id: number, title: string) => {
      if (renamingPostId !== id) return;
      updatePost.mutate({ title });
    },
    [renamingPostId, updatePost],
  );

  const handleRenameCancel = useCallback(() => setRenamingPostId(null), []);

  const handleDeletePost = useCallback(
    async (post: StudyPost) => {
      const ok = await confirm({
        title: "문서 삭제",
        description: `"${post.title}"을(를) 삭제하시겠습니까?`,
        confirmText: "삭제",
        variant: "destructive",
      });
      if (!ok) return;
      deletePost.mutate(post.id);
      if (selectedPostId === post.id) onPostDeleted?.();
    },
    [confirm, deletePost, selectedPostId, onPostDeleted],
  );

  // ── 인라인 문서 생성 ──────────────────────────────────────────────────────

  const handleInlineDocConfirm = useCallback(
    (catId: number, title: string) => {
      createPost.mutate({
        categoryId: catId,
        title,
        content: "",
        isPublic: true,
      });
    },
    [createPost],
  );

  const handleInlineDocCancel = useCallback(() => {
    setInlineDocCategoryId(null);
  }, []);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ConfirmDialog />

      {categoryMenu && (
        <CategoryContextMenu
          menu={categoryMenu}
          onAddDoc={handleCategoryAddDoc}
          onClose={() => setCategoryMenu(null)}
        />
      )}

      {postMenu && (
        <PostContextMenu
          menu={postMenu}
          onAddDoc={handlePostAddDoc}
          onRename={handleRenameStart}
          onDelete={handleDeletePost}
          onClose={() => setPostMenu(null)}
        />
      )}

      <aside className="w-60 border-r bg-background flex flex-col shrink-0 overflow-hidden">
        {/* ← 목록으로 */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground
                     hover:text-foreground hover:bg-muted/50 border-b transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </button>

        {/* 상단 브레드크럼: 1차 카테고리 → 2차 카테고리 */}
        {parentCategory && (
          <div className="px-4 py-2.5 border-b bg-muted/30 shrink-0">
            <p className="text-xs text-muted-foreground mb-0.5">
              {parentCategory.icon || "📁"} {parentCategory.name}
            </p>
            {(() => {
              const selectedSub = siblings.find((s) => s.id === categoryId);
              return selectedSub ? (
                <p className="text-sm font-semibold text-foreground truncate">
                  {selectedSub.icon || "📁"} {selectedSub.name}
                </p>
              ) : null;
            })()}
          </div>
        )}

        {/* 선택된 2차 카테고리 하위 문서 목록만 표시 */}
        <div className="flex-1 overflow-y-auto py-1">
          {(() => {
            const selectedSub = siblings.find((s) => s.id === categoryId);
            if (!selectedSub) {
              return (
                <p className="text-xs text-muted-foreground text-center py-6">
                  카테고리를 선택하세요.
                </p>
              );
            }
            return (
              <CategorySection
                key={selectedSub.id}
                sub={selectedSub}
                isExpanded={true}
                isActive={true}
                selectedPostId={selectedPostId}
                renamingPostId={renamingPostId}
                inlineDocCategoryId={inlineDocCategoryId}
                onToggle={() => {}}
                onSelectPost={onSelectPost}
                onCategoryContextMenu={openCategoryMenu}
                onPostContextMenu={openPostMenu}
                onRenameConfirm={handleRenameConfirm}
                onRenameCancel={handleRenameCancel}
                onInlineDocConfirm={handleInlineDocConfirm}
                onInlineDocCancel={handleInlineDocCancel}
              />
            );
          })()}
        </div>
      </aside>
    </>
  );
}
