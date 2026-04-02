import { useState, useMemo, useRef, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Search,
  X,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { toast } from "sonner";
import { useQueries } from "@tanstack/react-query";
import {
  usePromptFolders,
  usePromptDetail,
  useSavePromptMutation,
  useDeletePromptMutation,
  useCreatePromptFolderMutation,
  useRenamePromptFolderMutation,
  useDeletePromptFolderMutation,
} from "@/features/prompt/usePrompt";
import { promptApi } from "@/entities/prompt/promptApi";
import type { PromptFolder, Prompt } from "@/entities/prompt/prompt.types";
import { buildPromptTree, parseTags } from "@/entities/prompt/prompt.types";

// ── Context Menu Types ──────────────────────────────────────────────────────

type FolderCtxMenu = {
  x: number;
  y: number;
  folderId: number;
  folderName: string;
} | null;

type PromptCtxMenu = {
  x: number;
  y: number;
  promptId: number;
  promptTitle: string;
} | null;

// ── FolderContextMenu ───────────────────────────────────────────────────────

function FolderContextMenu({
  menu,
  onClose,
  onAddSubFolder,
  onAddPrompt,
  onRename,
  onDelete,
}: {
  menu: FolderCtxMenu;
  onClose: () => void;
  onAddSubFolder: (parentId: number) => void;
  onAddPrompt: (folderId: number) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number, name: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!menu) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-card border border-border rounded shadow-xl py-1 min-w-[180px] text-sm"
      style={{ top: menu.y, left: menu.x }}
    >
      <button
        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
        onClick={() => {
          onAddSubFolder(menu.folderId);
          onClose();
        }}
      >
        <span>📁</span> 하위 폴더 추가
      </button>
      <button
        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
        onClick={() => {
          onAddPrompt(menu.folderId);
          onClose();
        }}
      >
        <span>📄</span> 새 프롬프트 추가
      </button>
      <div className="border-t border-border my-1" />
      <button
        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
        onClick={() => {
          onRename(menu.folderId, menu.folderName);
          onClose();
        }}
      >
        <span>✏️</span> 이름 변경
      </button>
      <button
        className="w-full text-left px-3 py-2 hover:bg-destructive/10 text-destructive flex items-center gap-2"
        onClick={() => {
          onDelete(menu.folderId, menu.folderName);
          onClose();
        }}
      >
        <span>🗑️</span> 폴더 삭제
      </button>
    </div>
  );
}

// ── PromptContextMenu ───────────────────────────────────────────────────────

function PromptContextMenu({
  menu,
  onClose,
  onDelete,
}: {
  menu: PromptCtxMenu;
  onClose: () => void;
  onDelete: (id: number, title: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!menu) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-card border border-border rounded shadow-xl py-1 min-w-[160px] text-sm"
      style={{ top: menu.y, left: menu.x }}
    >
      <button
        className="w-full text-left px-3 py-2 hover:bg-destructive/10 text-destructive flex items-center gap-2"
        onClick={() => {
          onDelete(menu.promptId, menu.promptTitle);
          onClose();
        }}
      >
        <span>🗑️</span> 프롬프트 삭제
      </button>
    </div>
  );
}

// ── PromptPage ──────────────────────────────────────────────────────────────

export function PromptPage() {
  const { confirm, ConfirmDialog } = useConfirm();

  // 폴더 데이터
  const { data: folders = [] } = usePromptFolders();
  const { roots, children: folderChildren } = useMemo(
    () => buildPromptTree(folders),
    [folders],
  );

  // UI 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set(),
  );

  // 사이드바 리사이즈
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizing = useRef(false);

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  // 폴더 인라인 편집
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  // 인라인 입력 (폴더 생성)
  const [inlineFolderInput, setInlineFolderInput] = useState<{
    parentId: number | null;
  } | null>(null);
  const [inlineFolderName, setInlineFolderName] = useState("");

  // 인라인 입력 (프롬프트 생성)
  const [inlinePromptInput, setInlinePromptInput] = useState<{
    folderId: number;
  } | null>(null);
  const [inlinePromptTitle, setInlinePromptTitle] = useState("");

  // 컨텍스트 메뉴
  const [folderCtxMenu, setFolderCtxMenu] = useState<FolderCtxMenu>(null);
  const [promptCtxMenu, setPromptCtxMenu] = useState<PromptCtxMenu>(null);

  // 복사 완료 애니메이션
  const [copied, setCopied] = useState(false);

  // ── 확장된 폴더의 프롬프트 목록 조회 ────────────────────────────────────

  const promptsQueries = useQueries({
    queries: Array.from(expandedFolders).map((folderId) => ({
      queryKey: ["prompts", folderId],
      queryFn: () => promptApi.getPrompts(folderId),
      staleTime: 30000,
    })),
  });

  const promptsByFolder = useMemo(() => {
    const map = new Map<number, Prompt[]>();
    const expandedArray = Array.from(expandedFolders);
    expandedArray.forEach((folderId, index) => {
      const query = promptsQueries[index];
      if (query?.data) {
        map.set(folderId, query.data);
      }
    });
    return map;
  }, [promptsQueries, expandedFolders]);

  // ── Query / Mutation ─────────────────────────────────────────────────────

  const { data: promptDetail } = usePromptDetail(selectedPromptId);

  const saveMutation = useSavePromptMutation();
  const deleteMutation = useDeletePromptMutation();
  const createFolderMutation = useCreatePromptFolderMutation();
  const renameFolderMutation = useRenamePromptFolderMutation();
  const deleteFolderMutation = useDeletePromptFolderMutation();

  // ── Sidebar Resize ───────────────────────────────────────────────────────

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      setSidebarWidth(Math.max(200, Math.min(600, e.clientX - 24)));
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "default";
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFolderClick = (id: number) => {
    setSelectedFolderId(id);
    setSelectedPromptId(null);
    setIsEditing(false);
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
    setSelectedFolderId(null);
    setIsEditing(false);
  };

  const openNewPrompt = (folderId: number) => {
    setInlinePromptInput({ folderId });
    setInlinePromptTitle("");
    setExpandedFolders((p) => new Set(p).add(folderId));
  };

  const handleCreatePrompt = () => {
    const trimmedTitle = inlinePromptTitle.trim();
    if (!trimmedTitle) {
      toast.error("프롬프트 제목을 입력하세요");
      return;
    }
    if (!inlinePromptInput) return;

    saveMutation.mutate(
      {
        folderId: inlinePromptInput.folderId,
        title: trimmedTitle,
        content: "",
        isPinned: false,
        tags: [],
      },
      {
        onSuccess: (newId) => {
          setInlinePromptInput(null);
          setInlinePromptTitle("");
          setSelectedPromptId(newId);
          setIsEditing(true);
          setFormTitle(trimmedTitle);
          setFormContent("");
          setFormTags("");
          setFormIsPinned(false);
        },
      },
    );
  };

  const handleEdit = () => {
    if (!promptDetail) return;
    setFormTitle(promptDetail.title);
    setFormContent(promptDetail.content ?? "");
    setFormTags(promptDetail.tags ?? "");
    setFormIsPinned(promptDetail.isPinned ?? false);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("제목을 입력하세요");
      return;
    }
    const folderId = promptDetail?.folderId ?? selectedFolderId ?? null;
    if (!folderId) {
      toast.error("폴더를 선택하세요");
      return;
    }

    saveMutation.mutate(
      {
        id: selectedPromptId ?? undefined,
        folderId,
        title: formTitle.trim(),
        content: formContent,
        isPinned: formIsPinned,
        tags: formTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      {
        onSuccess: (newId) => {
          setSelectedPromptId(newId);
          setIsEditing(false);
          toast.success("저장되었습니다");
        },
      },
    );
  };

  const handleCopy = async () => {
    if (!promptDetail?.content) return;
    try {
      await navigator.clipboard.writeText(promptDetail.content);
      setCopied(true);
      toast.success("복사됨!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (!selectedPromptId) return;
    const ok = await confirm({
      title: "삭제 확인",
      description: "이 프롬프트를 삭제하시겠습니까?",
      variant: "destructive",
    });
    if (ok) {
      deleteMutation.mutate(selectedPromptId, {
        onSuccess: () => {
          setSelectedPromptId(null);
          setIsEditing(false);
        },
      });
    }
  };

  const handleDeleteFolder = async (id: number, name: string) => {
    const ok = await confirm({
      title: "폴더 삭제",
      description: `"${name}" 폴더와 하위 프롬프트가 모두 삭제됩니다.`,
      variant: "destructive",
    });
    if (ok) {
      deleteFolderMutation.mutate(id, {
        onSuccess: () => {
          setSelectedFolderId(null);
          setSelectedPromptId(null);
        },
      });
    }
  };

  const handleCreateFolder = () => {
    const trimmedName = inlineFolderName.trim();
    if (!trimmedName) {
      toast.error("폴더명을 입력하세요");
      return;
    }
    createFolderMutation.mutate(
      {
        name: trimmedName,
        parentId: inlineFolderInput?.parentId ?? null,
      },
      {
        onSuccess: () => {
          const parentId = inlineFolderInput?.parentId ?? null;
          setInlineFolderInput(null);
          setInlineFolderName("");
          if (parentId !== null)
            setExpandedFolders((p) => new Set(p).add(parentId));
        },
      },
    );
  };

  const openInlineFolderInput = (parentId: number | null) => {
    setInlineFolderInput({ parentId });
    setInlineFolderName("");
    if (parentId !== null) setExpandedFolders((p) => new Set(p).add(parentId));
  };

  const handleTogglePin = async () => {
    if (!promptDetail || !selectedPromptId) return;
    saveMutation.mutate(
      {
        id: selectedPromptId,
        folderId: promptDetail.folderId,
        title: promptDetail.title,
        content: promptDetail.content,
        isPinned: !promptDetail.isPinned,
        tags: parseTags(promptDetail.tags),
      },
      {
        onSuccess: () => {
          toast.success(
            promptDetail.isPinned ? "핀을 해제했습니다" : "핀으로 고정했습니다",
          );
        },
      },
    );
  };

  // ── Inline Input Renderers ────────────────────────────────────────────────

  const renderInlineFolderInput = (depth: number) => (
    <div
      className={cn(
        "flex items-center gap-2 py-1 px-3",
        depth > 0 ? "ml-4" : "",
      )}
    >
      <FolderOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={inlineFolderName}
        onChange={(e) => setInlineFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") handleCreateFolder();
          if (e.key === "Escape") {
            setInlineFolderInput(null);
            setInlineFolderName("");
          }
        }}
        placeholder="이름 입력 후 Enter"
        className="flex-1 border border-ring rounded px-1.5 py-0.5 text-xs min-w-0 focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
      />
    </div>
  );

  const renderInlinePromptInput = (depth: number) => (
    <div
      className={cn(
        "flex items-center gap-2 py-1 px-3",
        depth > 0 ? "ml-4" : "",
      )}
    >
      <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={inlinePromptTitle}
        onChange={(e) => setInlinePromptTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") handleCreatePrompt();
          if (e.key === "Escape") {
            setInlinePromptInput(null);
            setInlinePromptTitle("");
          }
        }}
        placeholder="제목 입력 후 Enter"
        className="flex-1 border border-ring rounded px-1.5 py-0.5 text-xs min-w-0 focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
      />
    </div>
  );

  // ── Folder Renderer ───────────────────────────────────────────────────────

  const renderFolder = (folder: PromptFolder, depth = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const isExpanded = expandedFolders.has(folder.id);
    const subFolders = folderChildren[folder.id] ?? [];
    const isEditingThis = editingFolderId === folder.id;

    return (
      <div key={folder.id} className={depth > 0 ? "ml-4" : ""}>
        {/* 폴더 행 */}
        <div
          className={cn(
            "group flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors",
            isSelected
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-accent",
          )}
          onClick={() => handleFolderClick(folder.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            setFolderCtxMenu({
              x: e.clientX,
              y: e.clientY,
              folderId: folder.id,
              folderName: folder.name,
            });
          }}
        >
          <span className="shrink-0 text-xs">{isExpanded ? "▼" : "▶"}</span>
          <FolderOpen
            className={cn(
              "w-4 h-4 shrink-0",
              isSelected ? "text-primary-foreground" : "text-muted-foreground",
            )}
          />
          {isEditingThis ? (
            <input
              autoFocus
              value={editingFolderName}
              onChange={(e) => setEditingFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === "Enter")
                  renameFolderMutation.mutate(
                    { id: folder.id, name: editingFolderName },
                    { onSuccess: () => setEditingFolderId(null) },
                  );
                if (e.key === "Escape") setEditingFolderId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 border rounded px-1 py-0 text-xs min-w-0 text-foreground bg-background"
            />
          ) : (
            <span className="flex-1 truncate min-w-0 text-sm">
              {folder.name}
            </span>
          )}
          {!isEditingThis && (
            <div className="hidden group-hover:flex gap-0.5 shrink-0">
              <button
                className={cn(
                  "text-xs px-1 rounded",
                  isSelected
                    ? "text-primary-foreground/70 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-primary",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  openNewPrompt(folder.id);
                }}
                title="새 프롬프트"
              >
                +
              </button>
              <button
                className={cn(
                  "text-xs px-1 rounded",
                  isSelected
                    ? "text-primary-foreground/70 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolderId(folder.id);
                  setEditingFolderName(folder.name);
                }}
                title="이름 변경"
              >
                ✏️
              </button>
              <button
                className={cn(
                  "text-xs px-1 rounded",
                  isSelected
                    ? "text-primary-foreground/70 hover:text-destructive"
                    : "text-muted-foreground hover:text-destructive",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id, folder.name);
                }}
                title="삭제"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* 확장된 내용 */}
        {isExpanded && (
          <>
            {subFolders.map((sub: PromptFolder) =>
              renderFolder(sub, depth + 1),
            )}
            {inlineFolderInput?.parentId === folder.id &&
              renderInlineFolderInput(depth + 1)}
            {inlinePromptInput?.folderId === folder.id &&
              renderInlinePromptInput(depth + 1)}
            {(promptsByFolder.get(folder.id) ?? []).map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => handlePromptClick(prompt)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPromptCtxMenu({
                    x: Math.min(e.clientX, window.innerWidth - 180),
                    y: Math.min(e.clientY, window.innerHeight - 80),
                    promptId: prompt.id,
                    promptTitle: prompt.title,
                  });
                }}
                className={cn(
                  "ml-4 flex items-center gap-2 py-2 px-3 rounded cursor-pointer text-sm transition-colors",
                  selectedPromptId === prompt.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent text-foreground",
                )}
              >
                <FileText
                  className={cn(
                    "w-4 h-4 shrink-0",
                    selectedPromptId === prompt.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                />
                {prompt.isPinned && (
                  <span className="shrink-0 text-xs">📌</span>
                )}
                <span className="truncate min-w-0">{prompt.title}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-6">
      <ConfirmDialog />

      {/* 컨텍스트 메뉴 */}
      <PromptContextMenu
        menu={promptCtxMenu}
        onClose={() => setPromptCtxMenu(null)}
        onDelete={async (id, title) => {
          const ok = await confirm({
            title: "프롬프트 삭제",
            description: `"${title}" 프롬프트를 삭제하시겠습니까?`,
            variant: "destructive",
          });
          if (ok) {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                if (selectedPromptId === id) {
                  setSelectedPromptId(null);
                  setIsEditing(false);
                }
              },
            });
          }
        }}
      />
      <FolderContextMenu
        menu={folderCtxMenu}
        onClose={() => setFolderCtxMenu(null)}
        onAddSubFolder={(parentId) => openInlineFolderInput(parentId)}
        onAddPrompt={(folderId) => openNewPrompt(folderId)}
        onRename={(id, name) => {
          setEditingFolderId(id);
          setEditingFolderName(name);
        }}
        onDelete={(id, name) => handleDeleteFolder(id, name)}
      />

      {/* 헤더 */}
      <div className="bg-card rounded border mb-4">
        <div className="p-3 border-b bg-muted/30">
          <h1 className="text-lg font-bold text-foreground">프롬프트 관리</h1>
        </div>
      </div>

      <div
        className="flex items-stretch"
        style={{ minHeight: "calc(100vh - 120px)" }}
      >
        {/* ── 좌: 폴더 트리 사이드바 ────────────────────────────────── */}
        <div
          className="shrink-0 bg-card rounded border flex flex-col"
          style={{
            width: `${sidebarWidth}px`,
            maxHeight: "calc(100vh - 120px)",
          }}
        >
          {/* 검색 + 폴더 추가 */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b bg-muted/30">
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
              onClick={() => openInlineFolderInput(null)}
              className="px-2 py-0.5 text-xs bg-foreground text-background rounded hover:opacity-80 shrink-0 whitespace-nowrap"
            >
              + 폴더
            </button>
          </div>

          {/* 트리 목록 */}
          <div
            className="overflow-y-auto py-1"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {roots.length === 0 && !inlineFolderInput ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                + 폴더 버튼으로 추가하세요.
              </p>
            ) : searchQuery.trim() !== "" ? (
              // 검색 모드
              (() => {
                const q = searchQuery.trim().toLowerCase();
                const matchedFolders = folders.filter((f) =>
                  f.name.toLowerCase().includes(q),
                );
                const allPrompts = Array.from(
                  promptsByFolder.entries(),
                ).flatMap(([folderId, prompts]) =>
                  prompts
                    .filter((p) => p.title.toLowerCase().includes(q))
                    .map((p) => ({ ...p, folderId })),
                );
                return (
                  <div>
                    {matchedFolders.length > 0 && (
                      <>
                        <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-0.5 font-medium uppercase tracking-wide">
                          폴더
                        </p>
                        {matchedFolders.map((f: PromptFolder) => (
                          <div
                            key={f.id}
                            onClick={() => handleFolderClick(f.id)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded transition-colors",
                              selectedFolderId === f.id
                                ? "bg-primary text-primary-foreground font-medium"
                                : "hover:bg-accent",
                            )}
                          >
                            <FolderOpen
                              className={cn(
                                "w-4 h-4 shrink-0",
                                selectedFolderId === f.id
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span className="truncate">{f.name}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {allPrompts.length > 0 && (
                      <>
                        <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-0.5 font-medium uppercase tracking-wide">
                          프롬프트
                        </p>
                        {allPrompts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handlePromptClick(p)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded transition-colors",
                              selectedPromptId === p.id
                                ? "bg-primary text-primary-foreground font-medium"
                                : "hover:bg-accent text-foreground",
                            )}
                          >
                            <FileText
                              className={cn(
                                "w-4 h-4 shrink-0",
                                selectedPromptId === p.id
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground",
                              )}
                            />
                            {p.isPinned && (
                              <span className="shrink-0 text-xs">📌</span>
                            )}
                            <span className="truncate">{p.title}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {matchedFolders.length === 0 && allPrompts.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        검색 결과가 없습니다.
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              roots.map((f) => renderFolder(f))
            )}
            {/* 루트 레벨 인라인 폴더 생성 */}
            {!searchQuery.trim() &&
              inlineFolderInput?.parentId === null &&
              renderInlineFolderInput(0)}
          </div>
        </div>

        {/* ── 크기 조절 핸들 ────────────────────────────────────────── */}
        <div
          className="w-4 cursor-col-resize flex flex-col justify-center items-center group z-10 mx-[-2px]"
          onMouseDown={(e) => {
            e.preventDefault();
            isResizing.current = true;
            document.body.style.cursor = "col-resize";
          }}
        >
          <div className="w-[1px] h-full bg-border group-hover:bg-primary/50 group-active:bg-primary transition-colors" />
        </div>

        {/* ── 우: 메인 컨텐츠 영역 ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 bg-card rounded border flex flex-col">
          {/* 컨텐츠 헤더 */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
            <span className="font-medium text-sm text-foreground">
              {isEditing
                ? selectedPromptId
                  ? "프롬프트 편집"
                  : "새 프롬프트"
                : promptDetail
                  ? "프롬프트 상세"
                  : "프롬프트 선택"}
            </span>

            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="px-3 py-1 text-xs bg-foreground text-background rounded hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/70"
                  >
                    취소
                  </button>
                </>
              ) : promptDetail ? (
                <>
                  {/* 복사 버튼 */}
                  <button
                    onClick={handleCopy}
                    title="내용 복사"
                    className="px-2.5 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-accent flex items-center gap-1.5"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "복사됨" : "복사"}</span>
                  </button>
                  {/* 핀 토글 */}
                  <button
                    onClick={handleTogglePin}
                    title={promptDetail.isPinned ? "핀 해제" : "핀 고정"}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded flex items-center gap-1.5",
                      promptDetail.isPinned
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span>{promptDetail.isPinned ? "고정됨" : "고정"}</span>
                  </button>
                  {/* 편집 버튼 */}
                  <button
                    onClick={handleEdit}
                    className="px-2.5 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-accent flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>편집</span>
                  </button>
                  {/* 삭제 버튼 */}
                  <button
                    onClick={handleDelete}
                    className="px-2.5 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* 컨텐츠 본문 */}
          <div className="flex-1 overflow-y-auto p-5">
            {isEditing ? (
              /* ── 편집 모드 ────────────────────────────────────────── */
              <div className="flex flex-col gap-3 max-w-3xl">
                {/* 제목 */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    제목
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="프롬프트 제목을 입력하세요"
                    className="w-full border border-border rounded px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* 태그 */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    태그 <span className="font-normal">(쉼표로 구분)</span>
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="예: 코딩, SQL, 글쓰기"
                    className="w-full border border-border rounded px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* 핀 고정 */}
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none w-fit">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span>핀 고정</span>
                </label>

                {/* 컨텐츠 */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    내용
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="프롬프트 내용을 입력하세요..."
                    rows={20}
                    className="w-full border border-border rounded px-3 py-2 text-sm font-mono bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed"
                  />
                </div>

                {/* 하단 저장/취소 */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="px-4 py-1.5 text-sm bg-foreground text-background rounded hover:opacity-80 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/70"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : promptDetail ? (
              /* ── 뷰 모드 ─────────────────────────────────────────── */
              <div className="flex flex-col gap-4 max-w-3xl">
                {/* 제목 + 핀 뱃지 */}
                <div className="flex items-start gap-3">
                  <h2 className="text-xl font-semibold text-foreground leading-snug flex-1 min-w-0">
                    {promptDetail.title}
                  </h2>
                  {promptDetail.isPinned && (
                    <span className="shrink-0 inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium mt-0.5">
                      <Pin className="w-3 h-3" />
                      고정됨
                    </span>
                  )}
                </div>

                {/* 태그 */}
                {parseTags(promptDetail.tags).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {parseTags(promptDetail.tags).map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 메타 정보 */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground border-b border-border pb-3">
                  <span>작성자: {promptDetail.authorName}</span>
                  <span>·</span>
                  <span>
                    {new Date(promptDetail.updatedAt).toLocaleDateString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>

                {/* 내용 (pre 태그로 줄바꿈 보존) */}
                {promptDetail.content ? (
                  <div className="bg-muted/40 rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/60">
                      <span className="text-xs text-muted-foreground font-medium">
                        프롬프트 내용
                      </span>
                      <button
                        onClick={handleCopy}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "복사됨!" : "복사"}
                      </button>
                    </div>
                    <pre className="px-4 py-4 text-sm text-foreground whitespace-pre-wrap break-words font-mono leading-relaxed overflow-x-auto">
                      {promptDetail.content}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                    내용이 없습니다. 편집 버튼을 눌러 내용을 추가하세요.
                  </div>
                )}
              </div>
            ) : (
              /* ── 빈 상태 ─────────────────────────────────────────── */
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground gap-3">
                <FileText className="w-12 h-12 opacity-20" />
                <p className="text-sm">
                  {selectedFolderId
                    ? "폴더 hover 후 + 버튼으로 새 프롬프트 추가"
                    : "좌측에서 프롬프트를 선택하거나 폴더를 추가하세요."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
