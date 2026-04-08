import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { springaiApi } from "@/features/springai/api/springaiApi";
import type {
  SpringAiCategory,
  SpringAiSection,
  SpringAiBlock,
} from "@/features/springai/api/springaiApi";
import TaskBlockEditor from "@/features/task/components/TaskBlockEditor";
import type { TaskBlock, BlockType } from "@/features/task/types/task.types";
import { TYPE_META } from "@/features/task/types/task.types";
import { LexicalViewer } from "@/shared/ui/lexical/LexicalViewer";
import { Mermaid } from "@/shared/ui/mermaid";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  GripVertical,
  Check,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
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
// BlockViewer 인라인 컴포넌트
// ─────────────────────────────────────────────
function BlockViewer({ block }: { block: SpringAiBlock }) {
  const meta = TYPE_META[block.blockType as BlockType] ?? {
    icon: "📄",
    label: block.blockType,
    color: "bg-muted text-muted-foreground",
  };

  return (
    <div className="mb-6">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block ${meta.color}`}
      >
        {meta.icon} {meta.label}
      </span>
      {block.blockType === "NOTE" && <LexicalViewer content={block.content} />}
      {block.blockType === "MMD" && <Mermaid chart={block.content} />}
      {block.blockType !== "NOTE" && block.blockType !== "MMD" && (
        <pre className="text-xs font-mono bg-muted p-3 rounded-lg border border-border overflow-x-auto whitespace-pre-wrap">
          {block.content}
        </pre>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function SpringAiPage() {
  const queryClient = useQueryClient();
  const { user } = useStore(authStore, (s) => s);
  const isAdmin = user?.role === "ROLE_ADMIN";

  // ── 사이드바 넓이 (localStorage 복원)
  const [cat1Width, setCat1Width] = useState(() => {
    const saved = localStorage.getItem("springai-cat1-width");
    return saved ? Number(saved) : 192;
  });
  const [cat2Width, setCat2Width] = useState(() => {
    const saved = localStorage.getItem("springai-cat2-width");
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
        localStorage.setItem("springai-cat1-width", String(next));
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
        localStorage.setItem("springai-cat2-width", String(next));
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
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );

  // ── 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editBlocks, setEditBlocks] = useState<SpringAiBlock[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  // ── 섹션 추가 상태
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // ── 카테고리 추가 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // ── 카테고리 수정 상태
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // ─────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────
  const { data: categories = [] } = useQuery<SpringAiCategory[]>({
    queryKey: ["springai", "categories"],
    queryFn: springaiApi.getCategories,
  });

  const { data: sections = [] } = useQuery<SpringAiSection[]>({
    queryKey: ["springai", "sections", selectedCategoryId],
    queryFn: () => springaiApi.getSections(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  const { data: blocks = [] } = useQuery<SpringAiBlock[]>({
    queryKey: ["springai", "blocks", selectedSectionId],
    queryFn: () => springaiApi.getBlocks(selectedSectionId!),
    enabled: !!selectedSectionId,
  });

  // ─────────────────────────────────────────────
  // Mutations
  // ─────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => springaiApi.saveBlocks(selectedSectionId!, editBlocks),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["springai", "blocks", selectedSectionId],
      });
      setIsEditing(false);
      toast.success("저장되었습니다");
    },
    onError: () => toast.error("저장 실패"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (name: string) =>
      springaiApi.createCategory({
        name,
        icon: "Folder",
        emoji: "",
        orderNum: categories.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["springai", "categories"] });
      setIsAddingCategory(false);
      setNewCategoryName("");
      toast.success("카테고리가 추가되었습니다");
    },
    onError: () => toast.error("카테고리 추가 실패"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => {
      const cat = categories.find((c) => c.id === id);
      return springaiApi.updateCategory(id, {
        name,
        icon: cat?.icon ?? "Folder",
        emoji: cat?.emoji ?? "",
        orderNum: cat?.orderNum ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["springai", "categories"] });
      setEditingCategoryId(null);
      setEditingCategoryName("");
      toast.success("카테고리 이름이 변경됐습니다.");
    },
    onError: () => toast.error("카테고리 수정 실패"),
  });

  const addSectionMutation = useMutation({
    mutationFn: (title: string) =>
      springaiApi.createSection({
        categoryId: selectedCategoryId!,
        title,
        orderNum: sections.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["springai", "sections", selectedCategoryId],
      });
      setIsAddingSection(false);
      setNewSectionTitle("");
      toast.success("섹션이 추가되었습니다");
    },
    onError: () => toast.error("섹션 추가 실패"),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      springaiApi.reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["springai", "categories"] });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  const reorderSectionMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      springaiApi.reorderSections(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["springai", "sections", selectedCategoryId],
      });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => springaiApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["springai", "categories"] });
      setSelectedCategoryId(null);
      setSelectedSectionId(null);
      toast.success("카테고리가 삭제되었습니다");
    },
    onError: () => toast.error("카테고리 삭제 실패"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => springaiApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["springai", "sections", selectedCategoryId],
      });
      setSelectedSectionId(null);
      toast.success("섹션이 삭제되었습니다");
    },
    onError: () => toast.error("섹션 삭제 실패"),
  });

  const renameSectionMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => {
      const sec = sections.find((s) => s.id === id);
      return springaiApi.updateSection(id, {
        title,
        orderNum: sec?.orderNum ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["springai", "sections", selectedCategoryId],
      });
      setEditingSectionId(null);
      setEditingSectionTitle("");
      toast.success("섹션 이름이 변경됐습니다.");
    },
    onError: () => toast.error("섹션 이름 변경에 실패했습니다."),
  });

  // ─────────────────────────────────────────────
  // DnD state & sensors
  // ─────────────────────────────────────────────
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [activeSecId, setActiveSecId] = useState<number | null>(null);

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

  const handleSecDragStart = (e: DragStartEvent) =>
    setActiveSecId(e.active.id as number);
  const handleSecDragEnd = (e: DragEndEvent) => {
    setActiveSecId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(sections, oldIdx, newIdx);
    reorderSectionMutation.mutate(
      reordered.map((s, i) => ({ id: s.id, orderNum: i })),
    );
  };

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleCategoryClick = (id: number) => {
    setSelectedCategoryId(id);
    setSelectedSectionId(null);
    setIsEditing(false);
    setIsAddingSection(false);
    setNewSectionTitle("");
  };

  const handleSectionClick = (id: number) => {
    setSelectedSectionId(id);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditBlocks([...blocks]);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditBlocks([]);
  };

  const handleAddSectionConfirm = () => {
    const title = newSectionTitle.trim();
    if (!title) return;
    addSectionMutation.mutate(title);
  };

  const handleAddSectionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!e.nativeEvent.isComposing && !addSectionMutation.isPending)
        handleAddSectionConfirm();
    }
    if (e.key === "Escape") {
      setIsAddingSection(false);
      setNewSectionTitle("");
    }
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

  // ─────────────────────────────────────────────
  // 선택된 카테고리 / 섹션 정보
  // ─────────────────────────────────────────────
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* ───────────────────────────────────────────
          1차 사이드바: 카테고리 목록
      ─────────────────────────────────────────── */}
      <aside
        className="shrink-0 border-r border-border bg-muted flex flex-col relative"
        style={{ width: cat1Width }}
      >
        {/* 헤더 - 2차 사이드바와 동일한 높이 */}
        <div
          className="px-4 border-b border-border flex items-center justify-between"
          style={{ minHeight: "49px" }}
        >
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              Spring AI
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Spring AI 문서
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
                                      `"${cat.name}" 카테고리를 삭제할까요? 하위 섹션과 내용이 모두 삭제됩니다.`,
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
          2차 사이드바: 섹션 목록
      ─────────────────────────────────────────── */}
      <aside
        className="shrink-0 border-r border-border bg-card flex flex-col relative"
        style={{ width: cat2Width }}
      >
        {/* 헤더 - 1차 사이드바와 동일한 높이 */}
        <div
          className="px-3 border-b border-border flex items-center justify-between gap-2"
          style={{ minHeight: "49px" }}
        >
          <p className="text-sm font-semibold text-foreground truncate">
            {selectedCategory ? selectedCategory.name : "섹션"}
          </p>
          {isAdmin && selectedCategoryId && (
            <button
              onClick={() => setIsAddingSection(true)}
              className="shrink-0 flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
              title="섹션 추가"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>
          )}
        </div>

        {/* 섹션 목록 / 안내 */}
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
                onDragStart={handleSecDragStart}
                onDragEnd={handleSecDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sections.map((sec) => (
                    <SortableItem
                      key={sec.id}
                      id={sec.id}
                      isDragging={activeSecId === sec.id}
                    >
                      {(dragHandleProps) => (
                        <div className="relative group">
                          {editingSectionId === sec.id ? (
                            <div className="px-3 py-1.5 flex items-center gap-1">
                              <input
                                autoFocus
                                type="text"
                                value={editingSectionTitle}
                                onChange={(e) =>
                                  setEditingSectionTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    !e.nativeEvent.isComposing
                                  ) {
                                    const t = editingSectionTitle.trim();
                                    if (t)
                                      renameSectionMutation.mutate({
                                        id: sec.id,
                                        title: t,
                                      });
                                  }
                                  if (e.key === "Escape") {
                                    setEditingSectionId(null);
                                    setEditingSectionTitle("");
                                  }
                                }}
                                className="flex-1 min-w-0 text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                              <button
                                onClick={() => {
                                  const t = editingSectionTitle.trim();
                                  if (t)
                                    renameSectionMutation.mutate({
                                      id: sec.id,
                                      title: t,
                                    });
                                }}
                                disabled={renameSectionMutation.isPending}
                                className="text-primary hover:text-primary/80 disabled:opacity-50 shrink-0"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSectionId(null);
                                  setEditingSectionTitle("");
                                }}
                                className="text-muted-foreground hover:text-foreground shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleSectionClick(sec.id)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors border-l-[3px] pr-16 ${
                                  selectedSectionId === sec.id
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
                                <span className="truncate">{sec.title}</span>
                              </button>
                              {isAdmin && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSectionId(sec.id);
                                      setEditingSectionTitle(sec.title);
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
                                          `"${sec.title}" 섹션을 삭제할까요?`,
                                        )
                                      ) {
                                        deleteSectionMutation.mutate(sec.id);
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
                  {activeSecId && (
                    <div className="bg-card border border-border rounded px-3 py-2 text-sm shadow-lg opacity-90">
                      {sections.find((s) => s.id === activeSecId)?.title}
                    </div>
                  )}
                </DragOverlay>
              </DndContext>

              {/* 섹션 추가 인라인 입력 */}
              {isAddingSection && (
                <div className="px-3 py-2 flex items-center gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    onKeyDown={handleAddSectionKeyDown}
                    placeholder="섹션 이름..."
                    className="flex-1 min-w-0 text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={handleAddSectionConfirm}
                    disabled={addSectionMutation.isPending}
                    className="text-primary hover:text-primary/80 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSection(false);
                      setNewSectionTitle("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {sections.length === 0 && !isAddingSection && (
                <p className="text-xs text-muted-foreground px-4 py-3">
                  섹션이 없습니다
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
          본문 패널
      ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* 카테고리 미선택 */}
        {!selectedCategoryId && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <p className="text-base font-medium">카테고리를 선택하세요</p>
            <p className="text-sm">
              왼쪽 사이드바에서 카테고리를 선택하면 내용이 표시됩니다.
            </p>
          </div>
        )}

        {/* 섹션 미선택 */}
        {selectedCategoryId && !selectedSectionId && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <p className="text-base font-medium">
              ← 왼쪽에서 항목을 선택하세요
            </p>
            <p className="text-sm">섹션을 선택하면 내용이 표시됩니다.</p>
          </div>
        )}

        {/* 섹션 선택됨 */}
        {selectedSectionId && (
          <div className="relative max-w-4xl mx-auto px-8 py-6">
            {/* 편집 버튼 - 우상단 고정 (ADMIN, 뷰어 모드에서만) */}
            {isAdmin && !isEditing && (
              <div className="absolute top-4 right-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  편집
                </Button>
              </div>
            )}

            {/* 섹션 헤더 */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-0.5">
                {selectedCategory?.name}
              </p>
              <h2 className="text-xl font-bold text-foreground">
                {selectedSection?.title ?? ""}
              </h2>
            </div>

            {/* ── 편집 모드 */}
            {isEditing ? (
              <div>
                <TaskBlockEditor
                  title={selectedSection?.title ?? ""}
                  setTitle={() => {}}
                  blocks={editBlocks as TaskBlock[]}
                  setBlocks={(b) => setEditBlocks(b as SpringAiBlock[])}
                />
                {/* 저장 / 취소 */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {saveMutation.isPending ? "저장 중..." : "저장"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              /* ── 뷰어 모드 */
              <div>
                {blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
                    <span className="text-4xl">🤖</span>
                    <p className="text-sm">아직 내용이 없습니다.</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground">
                        우상단 편집 버튼으로 내용을 추가하세요.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {blocks.map((block, idx) => (
                      <BlockViewer key={block.id ?? idx} block={block} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
