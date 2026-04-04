import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { apiDocApi } from "@/features/apidoc/api/apiDocApi";
import type {
  ApiDocCategory,
  ApiDocSection,
  ApiDocBlock,
} from "@/features/apidoc/api/apiDocApi";
import { ApiTesterPanel } from "@/features/apidoc/components/ApiTesterPanel";
import {
  apiEnvStore,
  apiEnvActions,
} from "@/features/apidoc/model/apiEnvStore";
import type { ApiBlockContent } from "@/features/apidoc/types/apiDoc.types";
import { METHOD_COLORS } from "@/features/apidoc/types/apiDoc.types";
import type { HttpMethod } from "@/features/apidoc/types/apiDoc.types";
import { toast } from "sonner";
import { Plus, Save, X, Trash2, GripVertical } from "lucide-react";
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
// 섹션 타이틀 파싱 헬퍼
// "POST /auth/login" → { method: "POST", path: "/auth/login" }
// "/auth/login" or "로그인 API" → { method: null, path: title }
// ─────────────────────────────────────────────
function parseSectionTitle(title: string): {
  method: HttpMethod | null;
  path: string;
} {
  const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const parts = title.trim().split(/\s+/);
  if (parts.length >= 2 && methods.includes(parts[0] as HttpMethod)) {
    return { method: parts[0] as HttpMethod, path: parts.slice(1).join(" ") };
  }
  return { method: null, path: title };
}

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
// 메인 페이지
// ─────────────────────────────────────────────
export default function ApiDocPage() {
  const queryClient = useQueryClient();
  const { user } = useStore(authStore, (s) => s);
  const isAdmin = user?.role === "ROLE_ADMIN";

  // 환경변수 스토어
  const { environments, activeEnvId } = useStore(apiEnvStore, (s) => s);

  // ── 사이드바 넓이 (localStorage 복원)
  const [cat1Width, setCat1Width] = useState(() => {
    const saved = localStorage.getItem("apidoc-cat1-width");
    return saved ? Number(saved) : 192;
  });
  const [cat2Width, setCat2Width] = useState(() => {
    const saved = localStorage.getItem("apidoc-cat2-width");
    return saved ? Number(saved) : 260;
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
        localStorage.setItem("apidoc-cat1-width", String(next));
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
        const next = Math.min(480, Math.max(160, startW + ev.clientX - startX));
        setCat2Width(next);
        localStorage.setItem("apidoc-cat2-width", String(next));
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

  // ── 섹션 추가 상태
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // ── 카테고리 추가 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📁");

  // ─────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────
  const { data: categories = [] } = useQuery<ApiDocCategory[]>({
    queryKey: ["apidoc", "categories"],
    queryFn: apiDocApi.getCategories,
  });

  const { data: sections = [] } = useQuery<ApiDocSection[]>({
    queryKey: ["apidoc", "sections", selectedCategoryId],
    queryFn: () => apiDocApi.getSections(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  const { data: blocks = [] } = useQuery<ApiDocBlock[]>({
    queryKey: ["apidoc", "blocks", selectedSectionId],
    queryFn: () => apiDocApi.getBlocks(selectedSectionId!),
    enabled: !!selectedSectionId,
  });

  // ─────────────────────────────────────────────
  // Mutations
  // ─────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (content: ApiBlockContent) =>
      apiDocApi.saveBlocks(selectedSectionId!, [
        { blockType: "API", content: JSON.stringify(content) },
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["apidoc", "blocks", selectedSectionId],
      });
      toast.success("저장되었습니다");
    },
    onError: () => toast.error("저장 실패"),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (data: { name: string; emoji: string }) =>
      apiDocApi.createCategory({
        name: data.name,
        icon: "Folder",
        emoji: data.emoji,
        orderNum: categories.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apidoc", "categories"] });
      setIsAddingCategory(false);
      setNewCategoryName("");
      setNewCategoryEmoji("📁");
      toast.success("카테고리가 추가되었습니다");
    },
    onError: () => toast.error("카테고리 추가 실패"),
  });

  const addSectionMutation = useMutation({
    mutationFn: (title: string) =>
      apiDocApi.createSection({
        categoryId: selectedCategoryId!,
        title,
        orderNum: sections.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["apidoc", "sections", selectedCategoryId],
      });
      setIsAddingSection(false);
      setNewSectionTitle("");
      toast.success("섹션이 추가되었습니다");
    },
    onError: () => toast.error("섹션 추가 실패"),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      apiDocApi.reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apidoc", "categories"] });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  const reorderSectionMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      apiDocApi.reorderSections(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["apidoc", "sections", selectedCategoryId],
      });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiDocApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apidoc", "categories"] });
      setSelectedCategoryId(null);
      setSelectedSectionId(null);
      toast.success("카테고리가 삭제되었습니다");
    },
    onError: () => toast.error("카테고리 삭제 실패"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => apiDocApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["apidoc", "sections", selectedCategoryId],
      });
      setSelectedSectionId(null);
      toast.success("섹션이 삭제되었습니다");
    },
    onError: () => toast.error("섹션 삭제 실패"),
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
    setIsAddingSection(false);
    setNewSectionTitle("");
  };

  const handleSectionClick = (id: number) => {
    setSelectedSectionId(id);
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
    addCategoryMutation.mutate({ name, emoji: newCategoryEmoji });
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
      setNewCategoryEmoji("📁");
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
        {/* 헤더 */}
        <div
          className="px-4 border-b border-border flex items-center justify-between"
          style={{ minHeight: "49px" }}
        >
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              🔌 API 문서
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              API 테스트 &amp; 문서화
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
                      <button
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors rounded-none border-l-[3px] pr-8 ${
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
                        <span>{cat.emoji || cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                      {isAdmin && (
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
            <div className="px-2 py-2 space-y-1">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newCategoryEmoji}
                  onChange={(e) => setNewCategoryEmoji(e.target.value)}
                  className="w-10 text-center text-sm border border-input rounded px-1 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="📁"
                  maxLength={2}
                />
                <input
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleAddCategoryKeyDown}
                  placeholder="카테고리명..."
                  className="flex-1 min-w-0 text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={handleAddCategoryConfirm}
                  disabled={addCategoryMutation.isPending}
                  className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                    setNewCategoryEmoji("📁");
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  취소
                </button>
              </div>
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
          2차 사이드바: 섹션 목록 (API 엔드포인트)
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
            {selectedCategory
              ? `${selectedCategory.emoji} ${selectedCategory.name}`
              : "엔드포인트"}
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

        {/* 섹션(엔드포인트) 목록 */}
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
                          <button
                            onClick={() => handleSectionClick(sec.id)}
                            className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-1.5 transition-colors border-l-[3px] pr-8 ${
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
                            {/* 메서드 배지 + 경로 */}
                            {(() => {
                              const { method, path } = parseSectionTitle(
                                sec.title,
                              );
                              return (
                                <>
                                  {method && (
                                    <span
                                      className={`text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${METHOD_COLORS[method]}`}
                                    >
                                      {method}
                                    </span>
                                  )}
                                  <span className="truncate text-xs">
                                    {path}
                                  </span>
                                </>
                              );
                            })()}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(`"${sec.title}" 섹션을 삭제할까요?`)
                                ) {
                                  deleteSectionMutation.mutate(sec.id);
                                }
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                    placeholder="예: POST /auth/login"
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
                  엔드포인트가 없습니다
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
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* 카테고리 미선택 */}
        {!selectedCategoryId && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <span className="text-5xl">🔌</span>
            <p className="text-base font-medium">카테고리를 선택하세요</p>
            <p className="text-sm">
              왼쪽 사이드바에서 카테고리를 선택하면 내용이 표시됩니다.
            </p>
          </div>
        )}

        {/* 섹션 미선택 */}
        {selectedCategoryId && !selectedSectionId && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <span className="text-5xl">🔌</span>
            <p className="text-base font-medium">← 엔드포인트를 선택하세요</p>
            <p className="text-sm">섹션을 선택하면 API 테스터가 열립니다.</p>
          </div>
        )}

        {/* 섹션 선택됨 - 상단 환경변수 바 + ApiTesterPanel */}
        {selectedSectionId && (
          <>
            {/* 환경변수 선택 바 */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/40">
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                환경
              </span>
              <div className="flex items-center gap-1.5">
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => apiEnvActions.setActiveEnv(env.id)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      activeEnvId === env.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border"
                    }`}
                  >
                    {env.name}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <span className="text-[10px] text-muted-foreground truncate max-w-xs hidden sm:block">
                {selectedCategory?.emoji} {selectedCategory?.name}
                {" / "}
                {selectedSection?.title}
              </span>
            </div>

            {/* API 테스터 패널 */}
            <ApiTesterPanel
              key={selectedSectionId}
              sectionId={selectedSectionId}
              sectionTitle={selectedSection?.title ?? ""}
              blocks={blocks}
              isAdmin={isAdmin}
              onSave={(content: ApiBlockContent) => {
                saveMutation.mutate(content);
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
