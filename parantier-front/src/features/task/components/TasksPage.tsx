import { useState, useMemo, useRef, useEffect } from "react";
import { FolderOpen, FileText, Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { toast } from "sonner";
import { useQueries } from "@tanstack/react-query";
import {
  useTaskFolders,
  useTaskPostDetail,
  useSaveTaskMutation,
  useDeleteTaskMutation,
  useCreateFolderMutation,
  useRenameFolderMutation,
  useDeleteFolderMutation,
} from "../hooks/useTask";
import { taskApi } from "../api/taskApi";
import type {
  TaskFolder,
  TaskPost,
  TaskBlock,
  BlockType,
} from "../types/task.types";
import { buildTree, TYPE_META } from "../types/task.types";
import TaskBlockEditor from "./TaskBlockEditor";
import TaskBlockViewer from "./TaskBlockViewer";

// 폴더 컨텍스트 메뉴
type FolderCtxMenu = {
  x: number;
  y: number;
  folderId: number;
  folderName: string;
} | null;

function FolderContextMenu({
  menu,
  onClose,
  onAddSubFolder,
  onAddDoc,
  onRename,
  onDelete,
}: {
  menu: FolderCtxMenu;
  onClose: () => void;
  onAddSubFolder: (parentId: number) => void;
  onAddDoc: (folderId: number) => void;
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
      className="fixed z-50 bg-white border rounded shadow-xl py-1 min-w-[180px] text-sm"
      style={{ top: menu.y, left: menu.x }}
    >
      <button
        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onAddDoc(menu.folderId);
          onClose();
        }}
      >
        <span>📄</span> 새 문서 추가
      </button>
      <button
        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onAddSubFolder(menu.folderId);
          onClose();
        }}
      >
        <span>📁</span> 하위 폴더 추가
      </button>
      <div className="border-t my-1" />
      <button
        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => {
          onRename(menu.folderId, menu.folderName);
          onClose();
        }}
      >
        <span>✏️</span> 이름 변경
      </button>
      <button
        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
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

export default function TasksPage() {
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: folders = [] } = useTaskFolders();
  const { roots, children: folderChildren } = useMemo(
    () => buildTree(folders),
    [folders],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set(),
  );

  const [sidebarWidth, setSidebarWidth] = useState(250);
  const isResizing = useRef(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [blocks, setBlocks] = useState<TaskBlock[]>([]);

  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [inlineFolderInput, setInlineFolderInput] = useState<{
    parentId: number | null;
  } | null>(null);
  const [inlineFolderName, setInlineFolderName] = useState("");
  const [inlineDocInput, setInlineDocInput] = useState<{
    folderId: number;
  } | null>(null);
  const [inlineDocTitle, setInlineDocTitle] = useState("");
  const [folderCtxMenu, setFolderCtxMenu] = useState<FolderCtxMenu>(null);

  // 확장된 폴더들의 posts 조회
  const postsQueries = useQueries({
    queries: Array.from(expandedFolders).map((folderId) => ({
      queryKey: ["taskPosts", folderId],
      queryFn: () => taskApi.getPostsByFolder(folderId),
      staleTime: 30000, // 30초 동안 캐시 유지
    })),
  });

  // 폴더별 posts를 Map으로 변환
  const postsByFolder = useMemo(() => {
    const map = new Map<number, TaskPost[]>();
    const expandedArray = Array.from(expandedFolders);
    expandedArray.forEach((folderId, index) => {
      const query = postsQueries[index];
      if (query?.data) {
        map.set(folderId, query.data);
      }
    });
    return map;
  }, [postsQueries, expandedFolders]);

  const { data: postDetail } = useTaskPostDetail(selectedPostId, !isEditing);

  const saveMutation = useSaveTaskMutation(
    selectedFolderId,
    selectedPostId,
    (newId) => {
      setSelectedPostId(newId);
      setIsEditing(false);
    },
  );

  const deleteMutation = useDeleteTaskMutation(selectedFolderId, () => {
    setSelectedPostId(null);
    setIsEditing(false);
  });

  const createFolderMutation = useCreateFolderMutation((parentId) => {
    setInlineFolderInput(null);
    setInlineFolderName("");
    if (parentId !== null) setExpandedFolders((p) => new Set(p).add(parentId));
  });

  const renameFolderMutation = useRenameFolderMutation(() => {
    setEditingFolderId(null);
  });

  const deleteFolderMutation = useDeleteFolderMutation(() => {
    setSelectedFolderId(null);
    setSelectedPostId(null);
  });

  const createDocMutation = useSaveTaskMutation(
    inlineDocInput?.folderId ?? null,
    null,
    (newId) => {
      setInlineDocInput(null);
      setInlineDocTitle("");
      setSelectedPostId(newId);
      setIsEditing(false);
    },
  );

  // Sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      setSidebarWidth(Math.max(200, Math.min(800, e.clientX - 24)));
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

  const handleFolderClick = (id: number) => {
    setSelectedFolderId(id);
    setSelectedPostId(null);
    setIsEditing(false);
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePostClick = (post: TaskPost) => {
    setSelectedPostId(post.id);
    setSelectedFolderId(null);
    setIsEditing(false);
  };

  const openNewDoc = (folderId: number) => {
    setInlineDocInput({ folderId });
    setInlineDocTitle("");
    setExpandedFolders((p) => new Set(p).add(folderId));
  };

  const handleCreateDoc = () => {
    const trimmedTitle = inlineDocTitle.trim();
    if (!trimmedTitle) {
      toast.error("문서 제목을 입력하세요");
      return;
    }
    if (!inlineDocInput) return;

    createDocMutation.mutate({
      folderId: inlineDocInput.folderId,
      title: trimmedTitle,
      blocks: [{ blockType: "NOTE", content: "" }],
    });
  };

  const handleEdit = () => {
    if (!postDetail) return;
    setFormTitle(postDetail.title);
    setBlocks(
      postDetail.blocks?.length
        ? [...postDetail.blocks]
        : [{ blockType: "NOTE", content: "" }],
    );
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("제목을 입력하세요");
      return;
    }
    const folderId = selectedFolderId ?? postDetail?.folderId ?? null;
    if (!folderId) return;

    const refinedBlocks = blocks.map((b) => ({
      blockType: b.blockType,
      content: b.content,
    }));

    saveMutation.mutate({
      id: selectedPostId || undefined,
      folderId: folderId,
      title: formTitle,
      blocks: refinedBlocks,
    });
  };

  const handleDelete = async () => {
    if (!selectedPostId) return;
    const ok = await confirm({
      title: "삭제 확인",
      description: "이 Task를 삭제하시겠습니까?",
      variant: "destructive",
    });
    if (ok) deleteMutation.mutate(selectedPostId);
  };

  const handleDeleteFolder = async (id: number, name: string) => {
    const ok = await confirm({
      title: "폴더 삭제",
      description: `"${name}" 폴더와 하위 Task가 모두 삭제됩니다.`,
      variant: "destructive",
    });
    if (ok) deleteFolderMutation.mutate(id);
  };

  const handleCreateFolder = () => {
    const trimmedName = inlineFolderName.trim();
    console.log("[TasksPage] handleCreateFolder 호출:", {
      trimmedName,
      parentId: inlineFolderInput?.parentId,
    });

    if (!trimmedName) {
      console.log("[TasksPage] 폴더명이 비어있어서 취소");
      toast.error("폴더명을 입력하세요");
      return;
    }

    console.log("[TasksPage] createFolderMutation.mutate 호출");
    createFolderMutation.mutate({
      name: trimmedName,
      parentId: inlineFolderInput?.parentId ?? null,
    });
  };

  const openInlineFolderInput = (parentId: number | null) => {
    setInlineFolderInput({ parentId });
    setInlineFolderName("");
    if (parentId !== null) setExpandedFolders((p) => new Set(p).add(parentId));
  };

  // 인라인 폴더명 입력
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

  // 인라인 문서 제목 입력
  const renderInlineDocInput = (depth: number) => (
    <div
      className={cn(
        "flex items-center gap-2 py-1 px-3",
        depth > 0 ? "ml-4" : "",
      )}
    >
      <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={inlineDocTitle}
        onChange={(e) => setInlineDocTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") handleCreateDoc();
          if (e.key === "Escape") {
            setInlineDocInput(null);
            setInlineDocTitle("");
          }
        }}
        placeholder="제목 입력 후 Enter"
        className="flex-1 border border-ring rounded px-1.5 py-0.5 text-xs min-w-0 focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
      />
    </div>
  );

  // 폴더 렌더링
  const renderFolder = (folder: TaskFolder, depth = 0) => {
    const isSelected = selectedFolderId === folder.id;
    const isExpanded = expandedFolders.has(folder.id);
    const subFolders = folderChildren[folder.id] ?? [];
    const isEditingThis = editingFolderId === folder.id;

    return (
      <div key={folder.id} className={depth > 0 ? "ml-4" : ""}>
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
          <span className="shrink-0 text-sm">{isExpanded ? "▼" : "▶"}</span>
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
                  renameFolderMutation.mutate({
                    id: folder.id,
                    dto: { name: editingFolderName, parentId: folder.parentId },
                  });
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
                  openNewDoc(folder.id);
                }}
                title="새 문서"
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

        {isExpanded && (
          <>
            {subFolders.map((sub) => renderFolder(sub, depth + 1))}
            {inlineFolderInput?.parentId === folder.id &&
              renderInlineFolderInput(depth + 1)}
            {inlineDocInput?.folderId === folder.id &&
              renderInlineDocInput(depth + 1)}
            {(postsByFolder.get(folder.id) || []).map((post) => {
              return (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className={cn(
                    "ml-4 flex items-center gap-2 py-2 px-3 rounded cursor-pointer text-sm transition-colors",
                    selectedPostId === post.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-accent text-foreground",
                  )}
                >
                  <FileText
                    className={cn(
                      "w-4 h-4 shrink-0",
                      selectedPostId === post.id
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="truncate min-w-0">{post.title}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfirmDialog />
      <FolderContextMenu
        menu={folderCtxMenu}
        onClose={() => setFolderCtxMenu(null)}
        onAddSubFolder={(parentId) => openInlineFolderInput(parentId)}
        onAddDoc={(folderId) => openNewDoc(folderId)}
        onRename={(id, name) => {
          setEditingFolderId(id);
          setEditingFolderName(name);
        }}
        onDelete={(id, name) => handleDeleteFolder(id, name)}
      />

      <div className="bg-card rounded border mb-4">
        <div className="p-3 border-b bg-muted/30">
          <h1 className="text-lg font-bold text-foreground">Task 관리</h1>
        </div>
      </div>

      <div
        className="flex items-stretch"
        style={{ minHeight: "calc(100vh - 120px)" }}
      >
        {/* 좌: 트리 */}
        <div
          className="shrink-0 bg-card rounded border flex flex-col h-full"
          style={{
            width: `${sidebarWidth}px`,
            maxHeight: "calc(100vh - 120px)",
          }}
        >
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

          <div
            className="overflow-y-auto py-1"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {roots.length === 0 && !inlineFolderInput ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                + 폴더 버튼으로 추가하세요.
              </p>
            ) : searchQuery.trim() !== "" ? (
              // 검색 모드: 폴더명 + 문서 제목 필터링
              (() => {
                const q = searchQuery.trim().toLowerCase();
                const matchedFolders = folders.filter((f) =>
                  f.name.toLowerCase().includes(q),
                );
                const allPosts = Array.from(postsByFolder.entries()).flatMap(
                  ([folderId, posts]) =>
                    posts
                      .filter((p) => p.title.toLowerCase().includes(q))
                      .map((p) => ({ ...p, folderId })),
                );
                return (
                  <div>
                    {matchedFolders.length > 0 && (
                      <>
                        <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-0.5 font-medium">
                          폴더
                        </p>
                        {matchedFolders.map((f) => (
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
                    {allPosts.length > 0 && (
                      <>
                        <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-0.5 font-medium">
                          문서
                        </p>
                        {allPosts.map((p) => {
                          return (
                            <div
                              key={p.id}
                              onClick={() => handlePostClick(p)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded transition-colors",
                                selectedPostId === p.id
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "hover:bg-accent text-foreground",
                              )}
                            >
                              <FileText
                                className={cn(
                                  "w-4 h-4 shrink-0",
                                  selectedPostId === p.id
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground",
                                )}
                              />
                              <span className="truncate">{p.title}</span>
                            </div>
                          );
                        })}
                      </>
                    )}
                    {matchedFolders.length === 0 && allPosts.length === 0 && (
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
            {!searchQuery.trim() &&
              inlineFolderInput?.parentId === null &&
              renderInlineFolderInput(0)}
          </div>
        </div>

        {/* 크기 조절 핸들 */}
        <div
          className="w-4 cursor-col-resize flex flex-col justify-center items-center group z-10 mx-[-2px]"
          onMouseDown={(e) => {
            e.preventDefault();
            isResizing.current = true;
            document.body.style.cursor = "col-resize";
          }}
        >
          <div className="w-[1px] h-full bg-gray-200 group-hover:bg-blue-400 group-active:bg-blue-500 transition-colors"></div>
        </div>

        {/* 우: 상세 */}
        <div className="flex-1 min-w-0 bg-white rounded border">
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
            <span className="font-medium text-sm">
              {isEditing
                ? selectedPostId
                  ? "Task 편집"
                  : "새 Task"
                : "Task 상세"}
            </span>
            <div className="flex gap-1">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    취소
                  </button>
                </>
              ) : selectedPostId ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    편집
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="p-4">
            {isEditing ? (
              <TaskBlockEditor
                title={formTitle}
                setTitle={setFormTitle}
                blocks={blocks}
                setBlocks={setBlocks}
              />
            ) : postDetail ? (
              <TaskBlockViewer post={postDetail} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                {selectedFolderId
                  ? "폴더 우클릭 또는 + 버튼으로 새 문서 추가"
                  : "좌측에서 폴더를 선택하세요."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
