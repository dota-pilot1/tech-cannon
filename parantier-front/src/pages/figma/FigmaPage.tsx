import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { figmaApi } from "@/features/figma/api/figmaApi";
import type { FigmaCategory, FigmaLink } from "@/features/figma/api/figmaApi";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  GripVertical,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─────────────────────────────────────────────
// SortableItem 컴포넌트
// ─────────────────────────────────────────────
function SortableItem({
  id,
  children,
  isDragging,
}: {
  id: number;
  children: (dragHandleProps: Record<string, unknown>) => React.ReactNode;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Figma URL embed 변환
// ─────────────────────────────────────────────
function toFigmaEmbedUrl(url: string): string {
  if (url.includes("figma.com/embed")) return url;
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
}

// ─────────────────────────────────────────────
// 링크 수정 다이얼로그 (createPortal)
// ─────────────────────────────────────────────
function LinkEditDialog({
  link,
  onSave,
  onClose,
  isPending,
}: {
  link: FigmaLink;
  onSave: (title: string, url: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            링크 수정
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              제목
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="링크 제목..."
              className="w-full text-sm border border-input rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Figma URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.figma.com/design/..."
              className="w-full text-sm border border-input rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              const t = title.trim();
              const u = url.trim();
              if (t && u) onSave(t, u);
            }}
            disabled={isPending || !title.trim() || !url.trim()}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function FigmaPage() {
  const queryClient = useQueryClient();
  const { user } = useStore(authStore, (s) => s);
  const isAdmin = user?.role === "ROLE_ADMIN";

  // ── 사이드바 넓이 (localStorage 복원)
  const [cat1Width, setCat1Width] = useState(() => {
    const saved = localStorage.getItem("figma-cat1-width");
    return saved ? Number(saved) : 192;
  });
  const [cat2Width, setCat2Width] = useState(() => {
    const saved = localStorage.getItem("figma-cat2-width");
    return saved ? Number(saved) : 240;
  });
  const isResizing1 = useRef(false);
  const isResizing2 = useRef(false);

  const startResize1 = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing1.current = true;
      const startX = e.clientX;
      const startW = cat1Width;
      const onMove = (ev: MouseEvent) => {
        if (!isResizing1.current) return;
        const next = Math.min(320, Math.max(120, startW + ev.clientX - startX));
        setCat1Width(next);
        localStorage.setItem("figma-cat1-width", String(next));
      };
      const onUp = () => {
        isResizing1.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [cat1Width],
  );

  const startResize2 = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing2.current = true;
      const startX = e.clientX;
      const startW = cat2Width;
      const onMove = (ev: MouseEvent) => {
        if (!isResizing2.current) return;
        const next = Math.min(400, Math.max(140, startW + ev.clientX - startX));
        setCat2Width(next);
        localStorage.setItem("figma-cat2-width", String(next));
      };
      const onUp = () => {
        isResizing2.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [cat2Width],
  );

  // ── 선택 상태
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);

  // ── 카테고리 추가/수정 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // ── 링크 추가 상태
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // ── 링크 수정 다이얼로그
  const [editingLink, setEditingLink] = useState<FigmaLink | null>(null);

  // ─────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────
  const { data: categories = [] } = useQuery<FigmaCategory[]>({
    queryKey: ["figma", "categories"],
    queryFn: figmaApi.getCategories,
  });

  const { data: links = [] } = useQuery<FigmaLink[]>({
    queryKey: ["figma", "links", selectedCategoryId],
    queryFn: () => figmaApi.getLinks(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  // ─────────────────────────────────────────────
  // Mutations - 카테고리
  // ─────────────────────────────────────────────
  const addCategoryMutation = useMutation({
    mutationFn: (name: string) =>
      figmaApi.createCategory({
        name,
        icon: "Folder",
        emoji: "",
        orderNum: categories.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["figma", "categories"] });
      setIsAddingCategory(false);
      setNewCategoryName("");
      toast.success("카테고리가 추가되었습니다");
    },
    onError: () => toast.error("카테고리 추가 실패"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => {
      const cat = categories.find((c) => c.id === id);
      return figmaApi.updateCategory(id, {
        name,
        icon: cat?.icon ?? "Folder",
        emoji: cat?.emoji ?? "",
        orderNum: cat?.orderNum ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["figma", "categories"] });
      setEditingCategoryId(null);
      setEditingCategoryName("");
      toast.success("카테고리 이름이 변경됐습니다.");
    },
    onError: () => toast.error("카테고리 수정 실패"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => figmaApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["figma", "categories"] });
      setSelectedCategoryId(null);
      setSelectedLinkId(null);
      toast.success("카테고리가 삭제되었습니다");
    },
    onError: () => toast.error("카테고리 삭제 실패"),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      figmaApi.reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["figma", "categories"] });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  // ─────────────────────────────────────────────
  // Mutations - 링크
  // ─────────────────────────────────────────────
  const addLinkMutation = useMutation({
    mutationFn: (data: { title: string; url: string }) =>
      figmaApi.createLink({
        categoryId: selectedCategoryId!,
        title: data.title,
        url: data.url,
        orderNum: links.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["figma", "links", selectedCategoryId],
      });
      setIsAddingLink(false);
      setNewLinkTitle("");
      setNewLinkUrl("");
      toast.success("링크가 추가되었습니다");
    },
    onError: () => toast.error("링크 추가 실패"),
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({
      id,
      title,
      url,
    }: {
      id: number;
      title: string;
      url: string;
    }) => {
      const link = links.find((l) => l.id === id);
      return figmaApi.updateLink(id, {
        categoryId: selectedCategoryId!,
        title,
        url,
        orderNum: link?.orderNum ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["figma", "links", selectedCategoryId],
      });
      setEditingLink(null);
      toast.success("링크가 수정되었습니다");
    },
    onError: () => toast.error("링크 수정 실패"),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: number) => figmaApi.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["figma", "links", selectedCategoryId],
      });
      setSelectedLinkId(null);
      toast.success("링크가 삭제되었습니다");
    },
    onError: () => toast.error("링크 삭제 실패"),
  });

  const reorderLinkMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      figmaApi.reorderLinks(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["figma", "links", selectedCategoryId],
      });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  // ─────────────────────────────────────────────
  // DnD state & sensors
  // ─────────────────────────────────────────────
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [activeLinkId, setActiveLinkId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleCatDragStart = (e: DragStartEvent) =>
    setActiveCatId(e.active.id as number);
  const handleCatDragEnd = (e: DragEndEvent) => {
    setActiveCatId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = categories.findIndex((c) => c.id === active.id);
    const newIdx = categories.findIndex((c) => c.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(categories, oldIdx, newIdx);
    reorderCategoryMutation.mutate(
      reordered.map((c, i) => ({ id: c.id, orderNum: i })),
    );
  };

  const handleLinkDragStart = (e: DragStartEvent) =>
    setActiveLinkId(e.active.id as number);
  const handleLinkDragEnd = (e: DragEndEvent) => {
    setActiveLinkId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = links.findIndex((l) => l.id === active.id);
    const newIdx = links.findIndex((l) => l.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(links, oldIdx, newIdx);
    reorderLinkMutation.mutate(
      reordered.map((l, i) => ({ id: l.id, orderNum: i })),
    );
  };

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleCategoryClick = (id: number) => {
    setSelectedCategoryId(id);
    setSelectedLinkId(null);
    setIsAddingLink(false);
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const handleAddCategoryConfirm = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    addCategoryMutation.mutate(name);
  };

  const handleAddCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!e.nativeEvent.isComposing && !addCategoryMutation.isPending)
        handleAddCategoryConfirm();
    }
    if (e.key === "Escape") {
      setIsAddingCategory(false);
      setNewCategoryName("");
    }
  };

  const handleAddLinkConfirm = () => {
    const title = newLinkTitle.trim();
    const url = newLinkUrl.trim();
    if (!title || !url) return;
    addLinkMutation.mutate({ title, url });
  };

  // ─────────────────────────────────────────────
  // 선택된 카테고리 / 링크 정보
  // ─────────────────────────────────────────────
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedLink = links.find((l) => l.id === selectedLinkId);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-64px)] bg-muted/30 p-4">
      <div className="flex h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      {/* ───────────────────────────────────────────
          1차 사이드바: 카테고리 목록
      ─────────────────────────────────────────── */}
      <aside
        className="shrink-0 border-r border-border bg-muted/50 flex flex-col relative"
        style={{ width: cat1Width }}
      >
        {/* 헤더 */}
        <div
          className="px-4 border-b border-border flex items-center justify-between"
          style={{ minHeight: "49px" }}
        >
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              Figma
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              디자인 링크 모음
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="shrink-0 flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
              title="카테고리 추가"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 카테고리 목록 */}
        <nav className="flex-1 overflow-y-auto py-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleCatDragStart}
            onDragEnd={handleCatDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((cat) => (
                <SortableItem
                  key={cat.id}
                  id={cat.id}
                  isDragging={activeCatId === cat.id}
                >
                  {(dragHandleProps) => (
                    <div className="relative group">
                      {editingCategoryId === cat.id ? (
                        <div className="px-3 py-1.5 flex items-center gap-1 border-l-[3px] border-l-primary bg-primary/5">
                          <input
                            autoFocus
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) =>
                              setEditingCategoryName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                !e.nativeEvent.isComposing
                              ) {
                                const n = editingCategoryName.trim();
                                if (n)
                                  updateCategoryMutation.mutate({
                                    id: cat.id,
                                    name: n,
                                  });
                              }
                              if (e.key === "Escape") {
                                setEditingCategoryId(null);
                                setEditingCategoryName("");
                              }
                            }}
                            className="flex-1 min-w-0 text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <button
                            onClick={() => {
                              const n = editingCategoryName.trim();
                              if (n)
                                updateCategoryMutation.mutate({
                                  id: cat.id,
                                  name: n,
                                });
                            }}
                            disabled={updateCategoryMutation.isPending}
                            className="text-primary hover:text-primary/80 disabled:opacity-50 shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategoryId(null);
                              setEditingCategoryName("");
                            }}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-none border-l-[3px] pr-16 ${
                              selectedCategoryId === cat.id
                                ? "border-l-primary bg-background text-primary font-bold shadow-sm"
                                : "border-l-transparent text-foreground/60 hover:bg-background/60 hover:text-foreground"
                            }`}
                          >
                            {isAdmin && (
                              <span
                                {...dragHandleProps}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground shrink-0"
                              >
                                <GripVertical className="w-3 h-3" />
                              </span>
                            )}
                            <span className="truncate">{cat.name}</span>
                          </button>
                          {isAdmin && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategoryId(cat.id);
                                  setEditingCategoryName(cat.name);
                                }}
                                className="text-muted-foreground hover:text-foreground p-1 rounded"
                                title="이름 수정"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm(
                                      `"${cat.name}" 카테고리를 삭제할까요? 하위 링크가 모두 삭제됩니다.`,
                                    )
                                  ) {
                                    deleteCategoryMutation.mutate(cat.id);
                                  }
                                }}
                                className="text-muted-foreground hover:text-destructive p-1 rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </SortableItem>
              ))}
            </SortableContext>
            <DragOverlay>
              {activeCatId && (
                <div className="bg-card border border-border rounded px-3 py-2 text-sm shadow-lg opacity-90">
                  {categories.find((c) => c.id === activeCatId)?.name}
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* 카테고리 추가 인라인 입력 */}
          {isAddingCategory && (
            <div className="px-3 py-2 flex items-center gap-1">
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleAddCategoryKeyDown}
                placeholder="카테고리명..."
                className="flex-1 min-w-0 text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleAddCategoryConfirm}
                disabled={addCategoryMutation.isPending}
                className="text-primary hover:text-primary/80 disabled:opacity-50 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName("");
                }}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {categories.length === 0 && !isAddingCategory && (
            <p className="text-xs text-muted-foreground px-4 py-3">
              카테고리 없음
            </p>
          )}
        </nav>

        {/* 1차 리사이즈 핸들 */}
        <div
          onMouseDown={startResize1}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40 transition-colors z-10"
        />
      </aside>

      {/* ───────────────────────────────────────────
          2차 사이드바: 링크 목록
      ─────────────────────────────────────────── */}
      <aside
        className="shrink-0 border-r border-border bg-card flex flex-col relative"
        style={{ width: cat2Width }}
      >
        {/* 헤더 */}
        <div
          className="px-3 border-b border-border flex items-center justify-between gap-2"
          style={{ minHeight: "49px" }}
        >
          <p className="text-sm font-semibold text-foreground truncate">
            {selectedCategory ? selectedCategory.name : "링크 목록"}
          </p>
          {isAdmin && selectedCategoryId && (
            <button
              onClick={() => setIsAddingLink(true)}
              className="shrink-0 flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
              title="링크 추가"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>
          )}
        </div>

        {/* 링크 목록 / 안내 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {!selectedCategoryId ? (
            <p className="text-xs text-muted-foreground px-4 py-3">
              ← 카테고리를 먼저 선택하세요
            </p>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleLinkDragStart}
                onDragEnd={handleLinkDragEnd}
              >
                <SortableContext
                  items={links.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {links.map((link) => (
                    <SortableItem
                      key={link.id}
                      id={link.id}
                      isDragging={activeLinkId === link.id}
                    >
                      {(dragHandleProps) => (
                        <div className="relative group">
                          <button
                            onClick={() => setSelectedLinkId(link.id)}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors border-l-[3px] pr-16 ${
                              selectedLinkId === link.id
                                ? "border-l-primary bg-primary/10 text-primary font-bold"
                                : "border-l-transparent text-foreground/60 hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {isAdmin && (
                              <span
                                {...dragHandleProps}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground shrink-0"
                              >
                                <GripVertical className="w-3 h-3" />
                              </span>
                            )}
                            <span className="truncate">{link.title}</span>
                          </button>
                          {isAdmin && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingLink(link);
                                }}
                                className="text-muted-foreground hover:text-foreground p-1 rounded"
                                title="수정"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm(`"${link.title}" 링크를 삭제할까요?`)
                                  ) {
                                    deleteLinkMutation.mutate(link.id);
                                  }
                                }}
                                className="text-muted-foreground hover:text-destructive p-1 rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </SortableItem>
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeLinkId && (
                    <div className="bg-card border border-border rounded px-3 py-2 text-sm shadow-lg opacity-90">
                      {links.find((l) => l.id === activeLinkId)?.title}
                    </div>
                  )}
                </DragOverlay>
              </DndContext>

              {/* 링크 추가 인라인 폼 */}
              {isAddingLink && (
                <div className="px-3 py-2 flex flex-col gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsAddingLink(false);
                        setNewLinkTitle("");
                        setNewLinkUrl("");
                      }
                    }}
                    placeholder="링크 제목..."
                    className="w-full text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!e.nativeEvent.isComposing && !addLinkMutation.isPending)
                          handleAddLinkConfirm();
                      }
                      if (e.key === "Escape") {
                        setIsAddingLink(false);
                        setNewLinkTitle("");
                        setNewLinkUrl("");
                      }
                    }}
                    placeholder="https://www.figma.com/..."
                    className="w-full text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={handleAddLinkConfirm}
                      disabled={
                        addLinkMutation.isPending ||
                        !newLinkTitle.trim() ||
                        !newLinkUrl.trim()
                      }
                      className="text-primary hover:text-primary/80 disabled:opacity-50 shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingLink(false);
                        setNewLinkTitle("");
                        setNewLinkUrl("");
                      }}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {links.length === 0 && !isAddingLink && (
                <p className="text-xs text-muted-foreground px-4 py-3">
                  링크가 없습니다
                </p>
              )}
            </>
          )}
        </nav>

        {/* 2차 리사이즈 핸들 */}
        <div
          onMouseDown={startResize2}
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40 transition-colors z-10"
        />
      </aside>

      {/* ───────────────────────────────────────────
          본문: Figma iframe embed
      ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden bg-background flex flex-col">
        {!selectedLink ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <ExternalLink className="w-10 h-10 opacity-30" />
            <p className="text-base font-medium">
              ← 피그마 링크를 선택하세요
            </p>
            <p className="text-sm">
              왼쪽 목록에서 링크를 선택하면 Figma가 표시됩니다.
            </p>
          </div>
        ) : (
          <iframe
            src={toFigmaEmbedUrl(selectedLink.url)}
            className="w-full h-full border-0"
            allow="fullscreen"
            title={selectedLink.title}
          />
        )}
      </main>

      {/* 링크 수정 다이얼로그 */}
      {editingLink && (
        <LinkEditDialog
          link={editingLink}
          onSave={(title, url) =>
            updateLinkMutation.mutate({ id: editingLink.id, title, url })
          }
          onClose={() => setEditingLink(null)}
          isPending={updateLinkMutation.isPending}
        />
      )}
      </div>
    </div>
  );
}
