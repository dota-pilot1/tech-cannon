import { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
  Search,
  X,
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
      style={{ paddingLeft: `${depth * 16 + 8}px`, paddingRight: "8px" }}
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
  setExpandedIds: (fn: (prev: Set<number>) => Set<number>) => void;
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
  // 현재 선택된 카테고리
  selectedCatId?: number | null;
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
  setExpandedIds,
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
  selectedCatId,
}: TreeNodeProps) {
  const isExpanded = expandedIds.has(cat.id);
  const { data: posts = [] } = useStudyPosts(isExpanded ? cat.id : null);

  const pl = depth * 14 + 8;
  const isRenamingThis = renamingCat?.id === cat.id;
  const isSelected = selectedCatId === cat.id;

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
        className={cn(
          "group flex items-center gap-1 py-1.5 cursor-pointer rounded text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-muted/50",
        )}
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
          <span className="flex-1 truncate text-sm">{cat.name}</span>
        )}
        {/* hover 액션 버튼 */}
        {!isRenamingThis && (
          <div className="hidden group-hover:flex gap-0.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedIds((p) => new Set([...p, cat.id]));
                if (!expandedIds.has(cat.id)) onToggle(cat.id);
                setInlineState({ type: "doc", categoryId: cat.id });
              }}
              className="text-xs text-muted-foreground hover:text-primary px-1"
              title="새 문서"
            >
              +
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenamingCat({ id: cat.id });
              }}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
              title="이름 변경"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCat(cat);
              }}
              className="text-xs text-muted-foreground hover:text-destructive px-1"
              title="삭제"
            >
              🗑️
            </button>
          </div>
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
              selectedCatId={selectedCatId}
              setExpandedIds={setExpandedIds}
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
                paddingLeft: `${(depth + 1) * 14 + 8}px`,
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
  onPostDeleted,
}: StudySidebarProps) {
  const { data: allCategories = [] } = useStudyCategoryTree();
  const { confirm, ConfirmDialog } = useConfirm();

  // 검색
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  // 검색 결과: 카테고리명 + 문서 제목 필터링
  const flattenCategories = (cats: StudyCategory[]): StudyCategory[] =>
    cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);

  const q = searchQuery.trim().toLowerCase();
  const matchedCats = q
    ? flattenCategories(allCategories).filter((c) =>
        c.name.toLowerCase().includes(q),
      )
    : [];

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
        {/* 헤더: 검색 + + 폴더 버튼 */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-1 flex-1 min-w-0 border rounded bg-background px-1.5 py-0.5">
            <Search className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(inputValue);
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  setInputValue("");
                  setSearchQuery("");
                }
              }}
              placeholder="검색 후 Enter..."
              className="flex-1 min-w-0 text-xs bg-transparent outline-none placeholder:text-muted-foreground/50"
            />
            {(inputValue || searchQuery) && (
              <button
                onClick={() => {
                  setInputValue("");
                  setSearchQuery("");
                }}
                className="text-muted-foreground hover:text-foreground shrink-0 leading-none"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setInlineState({ type: "folder", parentId: 0 })}
            className="px-2 py-0.5 text-xs bg-foreground text-background rounded hover:opacity-80 shrink-0 whitespace-nowrap"
          >
            + 폴더
          </button>
        </div>

        {/* 트리 목록 */}
        <div className="flex-1 overflow-y-auto py-1">
          {searchQuery.trim() !== "" ? (
            // 검색 모드
            matchedCats.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                검색 결과가 없습니다.
              </p>
            ) : (
              <div>
                <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-0.5 font-medium">
                  카테고리
                </p>
                {matchedCats.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setExpandedIds((p) => new Set([...p, c.id]));
                      setSearchQuery("");
                      setInputValue("");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer rounded transition-colors",
                      categoryId === c.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/50",
                    )}
                  >
                    <span>{c.icon || "📁"}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            )
          ) : allCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              + 폴더 버튼으로 추가하세요.
            </p>
          ) : (
            // 전체 트리 표시
            <>
              {allCategories.map((cat) => (
                <TreeNode
                  key={cat.id}
                  cat={cat}
                  depth={0}
                  selectedPostId={selectedPostId}
                  selectedCatId={categoryId}
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
                  setExpandedIds={setExpandedIds}
                />
              ))}
              {/* 최상위 인라인 폴더 추가 */}
              {inlineState?.type === "folder" && inlineState.parentId === 0 && (
                <InlineInput
                  depth={0}
                  placeholder="폴더명 입력 후 Enter"
                  onConfirm={(name) => {
                    createCategory.mutate(
                      { name, parentId: null, orderNum: null },
                      { onSuccess: () => setInlineState(null) },
                    );
                  }}
                  onCancel={() => setInlineState(null)}
                />
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
