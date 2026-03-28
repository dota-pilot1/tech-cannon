import { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useStudyCategoryTree,
  useStudyPosts,
  useCreateStudyPost,
  useDeleteStudyPost,
  useUpdateStudyPost,
  useCreateStudyCategory,
  useDeleteStudyCategory,
  useUpdateStudyCategory,
} from "../hooks/useStudy";
import { useConfirm } from "@/shared/hooks/useConfirm";
import type { StudyCategory, StudyPost } from "../types/study.types";

// ── Props ─────────────────────────────────────────────────────────────────────

interface StudySidebarProps {
  categoryId: number | null;
  selectedPostId: number | null;
  onSelectPost: (id: number) => void;
  onEditPost: (id: number) => void;
  onGoHome: () => void;
  onPostDeleted?: () => void;
}

// ── 컨텍스트 메뉴 공통 훅 ────────────────────────────────────────────────────

function useCtxClose(
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
  }, [onClose]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── 폴더(카테고리) 컨텍스트 메뉴 ─────────────────────────────────────────────

interface FolderCtxProps {
  x: number;
  y: number;
  onAddDoc: () => void;
  onAddFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function FolderContextMenu({
  x,
  y,
  onAddDoc,
  onAddFolder,
  onRename,
  onDelete,
  onClose,
}: FolderCtxProps) {
  const ref = useRef<HTMLDivElement>(null);
  useCtxClose(ref, onClose);
  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: y, left: x, zIndex: 9999 }}
      className="min-w-[160px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm"
    >
      <button
        onClick={() => {
          onAddDoc();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 text-foreground transition-colors"
      >
        <FilePlus className="w-3.5 h-3.5 text-muted-foreground" />
        문서 추가
      </button>
      <button
        onClick={() => {
          onAddFolder();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted/60 text-foreground transition-colors"
      >
        <FolderPlus className="w-3.5 h-3.5 text-muted-foreground" />
        하위 폴더 추가
      </button>
      <div className="my-1 border-t border-border" />
      <button
        onClick={() => {
          onRename();
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
          onDelete();
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

// ── 문서 컨텍스트 메뉴 ───────────────────────────────────────────────────────

interface PostCtxProps {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function PostContextMenu({ x, y, onRename, onDelete, onClose }: PostCtxProps) {
  const ref = useRef<HTMLDivElement>(null);
  useCtxClose(ref, onClose);
  return (
    <div
      ref={ref}
      style={{ position: "fixed", top: y, left: x, zIndex: 9999 }}
      className="min-w-[150px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm"
    >
      <button
        onClick={() => {
          onRename();
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
          onDelete();
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

// ── 인라인 입력창 (폴더명 / 문서 제목) ───────────────────────────────────────

function InlineInput({
  placeholder,
  onConfirm,
  onCancel,
  depth,
}: {
  placeholder: string;
  onConfirm: (v: string) => void;
  onCancel: () => void;
  depth: number;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 py-1"
      style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: "8px" }}
    >
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
        placeholder={placeholder}
        className="flex-1 border border-blue-400 rounded px-1.5 py-0.5 text-xs min-w-0
                   focus:outline-none focus:ring-1 focus:ring-blue-400 bg-background text-foreground"
      />
    </div>
  );
}

// ── 인라인 이름 변경 입력창 ───────────────────────────────────────────────────

function InlineRename({
  initialValue,
  onConfirm,
  onCancel,
}: {
  initialValue: string;
  onConfirm: (v: string) => void;
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
      className="flex-1 min-w-0 px-1 py-0 text-xs bg-background border border-ring rounded
                 text-foreground focus:outline-none"
    />
  );
}

// ── 재귀 트리 노드 ────────────────────────────────────────────────────────────

interface TreeNodeProps {
  cat: StudyCategory;
  depth: number;
  selectedPostId: number | null;
  // 공유 상태 (최상위에서 관리)
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  inlineState: InlineState | null;
  setInlineState: (s: InlineState | null) => void;
  renamingPost: { id: number } | null;
  setRenamingPost: (v: { id: number } | null) => void;
  renamingCat: { id: number } | null;
  setRenamingCat: (v: { id: number } | null) => void;
  ctxMenu: CtxMenuState | null;
  setCtxMenu: (v: CtxMenuState | null) => void;
  // 액션
  onSelectPost: (id: number) => void;
  onEditPost: (id: number) => void;
  onDeletePost: (post: StudyPost) => void;
  onRenamePostConfirm: (id: number, title: string) => void;
  onDeleteCat: (cat: StudyCategory) => void;
  onRenameCatConfirm: (id: number, name: string) => void;
  onCreateFolder: (parentId: number, name: string) => void;
  onCreateDoc: (categoryId: number, title: string) => void;
}

type InlineState =
  | { type: "folder"; parentId: number }
  | { type: "doc"; categoryId: number };

type CtxMenuState =
  | { kind: "folder"; x: number; y: number; cat: StudyCategory }
  | { kind: "post"; x: number; y: number; post: StudyPost };

function TreeNode({
  cat,
  depth,
  selectedPostId,
  expandedIds,
  onToggle,
  inlineState,
  setInlineState,
  renamingPost,
  setRenamingPost,
  renamingCat,
  setRenamingCat,
  ctxMenu,
  setCtxMenu,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onRenamePostConfirm,
  onDeleteCat,
  onRenameCatConfirm,
  onCreateFolder,
  onCreateDoc,
}: TreeNodeProps) {
  const isExpanded = expandedIds.has(cat.id);
  const { data: posts = [] } = useStudyPosts(isExpanded ? cat.id : null);

  const pl = depth * 12 + 8;
  const isRenamingThis = renamingCat?.id === cat.id;

  const openCtx = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 170);
    const y = Math.min(e.clientY, window.innerHeight - 160);
    setCtxMenu({ kind: "folder", x, y, cat });
  };

  return (
    <div>
      {/* 폴더 행 */}
      <div
        onClick={() => onToggle(cat.id)}
        onContextMenu={openCtx}
        style={{ paddingLeft: `${pl}px`, paddingRight: "4px" }}
        className="group flex items-center gap-1.5 py-1.5 cursor-pointer select-none
                   hover:bg-muted/50 transition-colors"
      >
        <span className="shrink-0 text-muted-foreground w-3">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </span>
        <span className="shrink-0 text-sm leading-none">
          {cat.icon || "📁"}
        </span>
        {isRenamingThis ? (
          <InlineRename
            initialValue={cat.name}
            onConfirm={(name) => {
              onRenameCatConfirm(cat.id, name);
              setRenamingCat(null);
            }}
            onCancel={() => setRenamingCat(null)}
          />
        ) : (
          <span className="flex-1 truncate text-sm text-foreground">
            {cat.name}
          </span>
        )}
        {/* hover 액션 버튼 */}
        {!isRenamingThis && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openCtx(e);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground
                       hover:text-foreground transition-all shrink-0"
          >
            <span className="text-[10px]">•••</span>
          </button>
        )}
      </div>

      {/* 펼쳐진 내용 */}
      {isExpanded && (
        <div>
          {/* 하위 폴더 재귀 */}
          {(cat.children ?? []).map((child) => (
            <TreeNode
              key={child.id}
              cat={child}
              depth={depth + 1}
              selectedPostId={selectedPostId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              inlineState={inlineState}
              setInlineState={setInlineState}
              renamingPost={renamingPost}
              setRenamingPost={setRenamingPost}
              renamingCat={renamingCat}
              setRenamingCat={setRenamingCat}
              ctxMenu={ctxMenu}
              setCtxMenu={setCtxMenu}
              onSelectPost={onSelectPost}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              onRenamePostConfirm={onRenamePostConfirm}
              onDeleteCat={onDeleteCat}
              onRenameCatConfirm={onRenameCatConfirm}
              onCreateFolder={onCreateFolder}
              onCreateDoc={onCreateDoc}
            />
          ))}

          {/* 인라인 폴더 추가 입력 */}
          {inlineState?.type === "folder" &&
            inlineState.parentId === cat.id && (
              <InlineInput
                depth={depth + 1}
                placeholder="폴더명 입력 후 Enter"
                onConfirm={(name) => {
                  onCreateFolder(cat.id, name);
                  setInlineState(null);
                }}
                onCancel={() => setInlineState(null)}
              />
            )}

          {/* 문서 목록 */}
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const x = Math.min(e.clientX, window.innerWidth - 160);
                const y = Math.min(e.clientY, window.innerHeight - 100);
                setCtxMenu({ kind: "post", x, y, post });
              }}
              style={{
                paddingLeft: `${(depth + 1) * 12 + 8}px`,
                paddingRight: "8px",
              }}
              className={cn(
                "flex items-center gap-1.5 py-1.5 cursor-pointer select-none text-sm transition-colors",
                selectedPostId === post.id
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              <span className="shrink-0 text-[10px]">📄</span>
              {renamingPost?.id === post.id ? (
                <InlineRename
                  initialValue={post.title}
                  onConfirm={(title) => {
                    onRenamePostConfirm(post.id, title);
                    setRenamingPost(null);
                  }}
                  onCancel={() => setRenamingPost(null)}
                />
              ) : (
                <span className="truncate flex-1">{post.title}</span>
              )}
              {post.isPinned && renamingPost?.id !== post.id && (
                <span className="shrink-0 text-[10px]">📌</span>
              )}
            </div>
          ))}

          {/* 인라인 문서 추가 입력 */}
          {inlineState?.type === "doc" && inlineState.categoryId === cat.id && (
            <InlineInput
              depth={depth + 1}
              placeholder="제목 입력 후 Enter"
              onConfirm={(title) => {
                onCreateDoc(cat.id, title);
                setInlineState(null);
              }}
              onCancel={() => setInlineState(null)}
            />
          )}

          {/* 아무것도 없을 때 */}
          {(cat.children ?? []).length === 0 &&
            posts.length === 0 &&
            inlineState?.type !== "folder" &&
            inlineState?.type !== "doc" && (
              <div
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
                className="py-1.5"
              >
                <button
                  onClick={() => {
                    setInlineState({ type: "doc", categoryId: cat.id });
                  }}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  + 첫 문서 추가하기
                </button>
              </div>
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

  // 현재 선택된 2차 카테고리 찾기
  const selectedCat = (() => {
    if (!categoryId) return null;
    for (const root of allCategories) {
      const found = root.children?.find((c) => c.id === categoryId);
      if (found) return found;
    }
    return allCategories.find((c) => c.id === categoryId) ?? null;
  })();

  // 트리 상태
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    new Set(categoryId ? [categoryId] : []),
  );
  const [inlineState, setInlineState] = useState<InlineState | null>(null);
  const [renamingPost, setRenamingPost] = useState<{ id: number } | null>(null);
  const [renamingCat, setRenamingCat] = useState<{ id: number } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);

  const toggleExpand = (id: number) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // ── mutations ──────────────────────────────────────────────────────────────

  const createPost = useCreateStudyPost((newId) => {
    setInlineState(null);
    onEditPost(newId);
  });

  const deletePost = useDeleteStudyPost(() => {
    onPostDeleted?.();
  });
  const updatePost = useUpdateStudyPost(renamingPost?.id ?? 0, () =>
    setRenamingPost(null),
  );

  const createCategory = useCreateStudyCategory();
  const deleteCategory = useDeleteStudyCategory();
  const updateCategory = useUpdateStudyCategory();

  // ── 핸들러 ────────────────────────────────────────────────────────────────

  const handleCreateDoc = (catId: number, title: string) => {
    setExpandedIds((p) => new Set([...p, catId]));
    createPost.mutate({
      categoryId: catId,
      title,
      content: "",
      isPublic: true,
    });
  };

  const handleCreateFolder = (parentId: number, name: string) => {
    setExpandedIds((p) => new Set([...p, parentId]));
    createCategory.mutate(
      { name, parentId, orderNum: null },
      { onSuccess: () => setInlineState(null) },
    );
  };

  const handleRenamePostConfirm = (_id: number, title: string) => {
    updatePost.mutate({ title });
  };

  const handleRenameCatConfirm = (catId: number, name: string) => {
    updateCategory.mutate(
      { id: catId, req: { name } },
      { onSuccess: () => setRenamingCat(null) },
    );
  };

  const handleDeletePost = async (post: StudyPost) => {
    const ok = await confirm({
      title: "문서 삭제",
      description: `"${post.title}"을(를) 삭제하시겠습니까?`,
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    deletePost.mutate(post.id);
    if (selectedPostId === post.id) onPostDeleted?.();
  };

  const handleDeleteCat = async (cat: StudyCategory) => {
    const ok = await confirm({
      title: "폴더 삭제",
      description: `"${cat.name}" 폴더와 하위 모든 문서가 삭제됩니다. 계속하시겠습니까?`,
      confirmText: "삭제",
      variant: "destructive",
    });
    if (!ok) return;
    deleteCategory.mutate(cat.id);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ConfirmDialog />

      {/* 폴더 컨텍스트 메뉴 */}
      {ctxMenu?.kind === "folder" && (
        <FolderContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onAddDoc={() => {
            setExpandedIds((p) => new Set([...p, ctxMenu.cat.id]));
            setInlineState({ type: "doc", categoryId: ctxMenu.cat.id });
          }}
          onAddFolder={() => {
            setExpandedIds((p) => new Set([...p, ctxMenu.cat.id]));
            setInlineState({ type: "folder", parentId: ctxMenu.cat.id });
          }}
          onRename={() => setRenamingCat({ id: ctxMenu.cat.id })}
          onDelete={() => handleDeleteCat(ctxMenu.cat)}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* 문서 컨텍스트 메뉴 */}
      {ctxMenu?.kind === "post" && (
        <PostContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onRename={() => setRenamingPost({ id: ctxMenu.post.id })}
          onDelete={() => handleDeletePost(ctxMenu.post)}
          onClose={() => setCtxMenu(null)}
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

        {/* 주제 헤더 */}
        {selectedCat && (
          <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
            <span className="text-sm font-medium text-foreground truncate flex-1">
              {selectedCat.icon || "📁"} {selectedCat.name}
            </span>
          </div>
        )}

        {/* 트리 목록 */}
        <div className="flex-1 overflow-y-auto py-1">
          {!selectedCat ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              카테고리를 선택하세요.
            </p>
          ) : (
            <TreeNode
              cat={selectedCat}
              depth={0}
              selectedPostId={selectedPostId}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
              inlineState={inlineState}
              setInlineState={setInlineState}
              renamingPost={renamingPost}
              setRenamingPost={setRenamingPost}
              renamingCat={renamingCat}
              setRenamingCat={setRenamingCat}
              ctxMenu={ctxMenu}
              setCtxMenu={setCtxMenu}
              onSelectPost={onSelectPost}
              onEditPost={onEditPost}
              onDeletePost={handleDeletePost}
              onRenamePostConfirm={handleRenamePostConfirm}
              onDeleteCat={handleDeleteCat}
              onRenameCatConfirm={handleRenameCatConfirm}
              onCreateFolder={handleCreateFolder}
              onCreateDoc={handleCreateDoc}
            />
          )}
        </div>
      </aside>
    </>
  );
}
