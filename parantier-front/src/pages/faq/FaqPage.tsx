import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { faqApi } from "@/features/faq/api/faqApi";
import type {
  FaqCategory,
  FaqSection,
  FaqBlock,
} from "@/features/faq/api/faqApi";
import type { BlockType } from "@/features/task/types/task.types";
import { TYPE_META } from "@/features/task/types/task.types";
import { LexicalViewer } from "@/shared/ui/lexical/LexicalViewer";
import { LexicalEditor } from "@/shared/ui/lexical/LexicalEditor";
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
// FaqBlockViewer - Q/A 말풍선 스타일
// ─────────────────────────────────────────────
function FaqBlockViewer({ block }: { block: FaqBlock }) {
  const isQuestion = block.blockType === "QUESTION";
  const isAnswer = block.blockType === "ANSWER";

  if (isQuestion) {
    return (
      <div className="flex mb-3">
        {/* Q 왼쪽 고정 */}
        <div className="flex items-start gap-3 w-[48%]">
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center shrink-0 text-sm font-bold text-foreground mt-1">
            Q
          </div>
          <div className="flex-1 bg-muted border border-border rounded-2xl rounded-tl-none px-4 py-3 min-w-0">
            <LexicalViewer content={block.content} />
          </div>
        </div>
        {/* 오른쪽 빈 공간 */}
        <div className="w-[52%]" />
      </div>
    );
  }

  if (isAnswer) {
    return (
      <div className="flex mb-3">
        {/* 왼쪽 빈 공간 */}
        <div className="w-[52%]" />
        {/* A 오른쪽 고정 */}
        <div className="flex items-start gap-3 w-[48%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-sm font-bold text-primary-foreground mt-1">
            A
          </div>
          <div className="flex-1 bg-primary/15 border border-primary/30 rounded-2xl rounded-tr-none px-4 py-3 min-w-0">
            <LexicalViewer content={block.content} />
          </div>
        </div>
      </div>
    );
  }

  // 그 외 블록 타입 (NOTE, MMD 등) - 기존 방식 유지
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
export default function FaqPage() {
  const queryClient = useQueryClient();
  const { user } = useStore(authStore, (s) => s);
  const isAdmin = user?.role === "ROLE_ADMIN";

  // ── 사이드바 넓이 (localStorage 복원)
  const [cat1Width, setCat1Width] = useState(() => {
    const saved = localStorage.getItem("faq-cat1-width");
    return saved ? Number(saved) : 192;
  });
  const [cat2Width, setCat2Width] = useState(() => {
    const saved = localStorage.getItem("faq-cat2-width");
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
        localStorage.setItem("faq-cat1-width", String(next));
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
        localStorage.setItem("faq-cat2-width", String(next));
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
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  // ── 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editBlocks, setEditBlocks] = useState<FaqBlock[]>([]);

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
  const { data: categories = [] } = useQuery<FaqCategory[]>({
    queryKey: ["faq", "categories"],
    queryFn: faqApi.getCategories,
  });

  const { data: sections = [] } = useQuery<FaqSection[]>({
    queryKey: ["faq", "sections", selectedCategoryId],
    queryFn: () => faqApi.getSections(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  const { data: blocks = [] } = useQuery<FaqBlock[]>({
    queryKey: ["faq", "blocks", selectedSectionId],
    queryFn: () => faqApi.getBlocks(selectedSectionId!),
    enabled: !!selectedSectionId,
  });

  // ─────────────────────────────────────────────
  // Mutations
  // ─────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => faqApi.saveBlocks(selectedSectionId!, editBlocks),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["faq", "blocks", selectedSectionId],
      });
      setIsEditing(false);
      toast.success("저장되었습니다");
    },
    onError: () => toast.error("저장 실패"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (name: string) =>
      faqApi.createCategory({
        name,
        icon: "Folder",
        emoji: "",
        orderNum: categories.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq", "categories"] });
      setIsAddingCategory(false);
      setNewCategoryName("");
      toast.success("카테고리가 추가되었습니다");
    },
    onError: () => toast.error("카테고리 추가 실패"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => {
      const cat = categories.find((c) => c.id === id);
      return faqApi.updateCategory(id, {
        name,
        icon: cat?.icon ?? "Folder",
        emoji: cat?.emoji ?? "",
        orderNum: cat?.orderNum ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq", "categories"] });
      setEditingCategoryId(null);
      setEditingCategoryName("");
      toast.success("카테고리 이름이 변경됐습니다.");
    },
    onError: () => toast.error("카테고리 수정 실패"),
  });

  const renameSectionMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => {
      const sec = sections.find((s) => s.id === id);
      return faqApi.updateSection(id, { title, orderNum: sec?.orderNum ?? 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["faq-sections", selectedCategoryId],
      });
      setEditingSectionId(null);
      setEditingSectionTitle("");
      toast.success("섹션 이름이 변경됐습니다.");
    },
    onError: () => toast.error("섹션 이름 변경에 실패했습니다."),
  });

  const addSectionMutation = useMutation({
    mutationFn: (title: string) =>
      faqApi.createSection({
        categoryId: selectedCategoryId!,
        title,
        orderNum: sections.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["faq", "sections", selectedCategoryId],
      });
      setIsAddingSection(false);
      setNewSectionTitle("");
      toast.success("FAQ가 추가되었습니다");
    },
    onError: () => toast.error("FAQ 추가 실패"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => faqApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq", "categories"] });
      setSelectedCategoryId(null);
      setSelectedSectionId(null);
      toast.success("카테고리가 삭제되었습니다");
    },
    onError: () => toast.error("카테고리 삭제 실패"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => faqApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["faq", "sections", selectedCategoryId],
      });
      setSelectedSectionId(null);
      toast.success("FAQ가 삭제되었습니다");
    },
    onError: () => toast.error("FAQ 삭제 실패"),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      faqApi.reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq", "categories"] });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  const reorderSectionMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      faqApi.reorderSections(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["faq", "sections", selectedCategoryId],
      });
    },
    onError: () => toast.error("순서 변경 실패"),
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
              ❓ FAQ
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              자주 묻는 질문
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
          2차 사이드바: 섹션(FAQ 항목) 목록
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
            {selectedCategory ? selectedCategory.name : "FAQ 항목"}
          </p>
          {isAdmin && selectedCategoryId && (
            <button
              onClick={() => setIsAddingSection(true)}
              className="shrink-0 flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
              title="FAQ 항목 추가"
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
                                          `"${sec.title}" FAQ를 삭제할까요?`,
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
                    placeholder="FAQ 항목 이름..."
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
                  FAQ 항목이 없습니다
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
            <span className="text-5xl">❓</span>
            <p className="text-base font-medium">카테고리를 선택하세요</p>
            <p className="text-sm">
              왼쪽 사이드바에서 카테고리를 선택하면 내용이 표시됩니다.
            </p>
          </div>
        )}

        {/* 섹션 미선택 */}
        {selectedCategoryId && !selectedSectionId && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <span className="text-5xl">❓</span>
            <p className="text-base font-medium">← FAQ를 선택하세요</p>
            <p className="text-sm">FAQ 항목을 선택하면 내용이 표시됩니다.</p>
          </div>
        )}

        {/* 섹션 선택됨 */}
        {selectedSectionId && (
          <div className="relative px-6 py-6">
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
                {selectedCategory?.emoji} {selectedCategory?.name}
              </p>
              <h2 className="text-xl font-bold text-foreground">
                {selectedSection?.title ?? ""}
              </h2>
            </div>

            {/* ── 편집 모드 */}
            {isEditing ? (
              <div>
                {/* Q/A 빠른 추가 버튼 */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() =>
                      setEditBlocks([
                        ...editBlocks,
                        { blockType: "QUESTION", content: "" },
                      ])
                    }
                    className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-1.5"
                  >
                    💬 Q 추가
                  </button>
                  <button
                    onClick={() =>
                      setEditBlocks([
                        ...editBlocks,
                        { blockType: "ANSWER", content: "" },
                      ])
                    }
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center gap-1.5"
                  >
                    💡 A 추가
                  </button>
                </div>

                {/* 블록 목록 */}
                <div className="space-y-3 mb-6">
                  {editBlocks.map((block, idx) => (
                    <div key={idx} className="relative group">
                      {block.blockType === "QUESTION" ||
                      block.blockType === "ANSWER" ? (
                        <div
                          className={`flex items-start gap-2 p-3 rounded-xl border ${
                            block.blockType === "QUESTION"
                              ? "border-border bg-muted/30"
                              : "border-primary/20 bg-primary/5"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${
                              block.blockType === "QUESTION"
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {block.blockType === "QUESTION" ? "Q" : "A"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <LexicalEditor
                              key={`${idx}-${block.blockType}`}
                              initialState={block.content || undefined}
                              onChange={(val) => {
                                const updated = [...editBlocks];
                                updated[idx] = {
                                  ...updated[idx],
                                  content: val,
                                };
                                setEditBlocks(updated);
                              }}
                              placeholder={
                                block.blockType === "QUESTION"
                                  ? "질문을 입력하세요..."
                                  : "답변을 입력하세요..."
                              }
                              minHeight="80px"
                            />
                          </div>
                          <button
                            onClick={() =>
                              setEditBlocks(
                                editBlocks.filter((_, i) => i !== idx),
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* NOTE/MMD 등 기타 블록 */
                        <div className="flex items-start gap-2 p-3 rounded-xl border border-border bg-card">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0 mt-1">
                            {block.blockType}
                          </span>
                          <textarea
                            value={block.content}
                            onChange={(e) => {
                              const updated = [...editBlocks];
                              updated[idx] = {
                                ...updated[idx],
                                content: e.target.value,
                              };
                              setEditBlocks(updated);
                            }}
                            className="flex-1 bg-transparent text-xs font-mono text-foreground resize-none focus:outline-none min-h-[60px] placeholder:text-muted-foreground"
                            rows={3}
                          />
                          <button
                            onClick={() =>
                              setEditBlocks(
                                editBlocks.filter((_, i) => i !== idx),
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 저장 / 취소 버튼 */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {saveMutation.isPending ? "저장 중..." : "저장"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              /* ── 뷰어 모드 */
              <div>
                {blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
                    <span className="text-4xl">❓</span>
                    <p className="text-sm">아직 내용이 없습니다.</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground">
                        우상단 편집 버튼으로 Q&A를 추가하세요.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-2">
                    {blocks.map((block, idx) => (
                      <FaqBlockViewer key={block.id ?? idx} block={block} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
