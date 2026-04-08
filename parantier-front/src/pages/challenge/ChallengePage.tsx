import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import {
  challengeApi,
  type ChallengeCategory,
  type ChallengeSection,
  type ChallengeTopic,
  type ChallengeSubmission,
} from "@/features/challenge/api/challengeApi";
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
  ChevronDown,
  ChevronRight,
  Send,
  Trophy,
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
// SortableItem
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
// TopicBlockViewer
// ─────────────────────────────────────────────
function TopicBlockViewer({ block }: { block: ChallengeTopic }) {
  const meta = TYPE_META[block.blockType as BlockType] ?? {
    icon: "\u{1F4C4}",
    label: block.blockType,
    color: "bg-muted text-muted-foreground",
  };

  return (
    <div className="mb-4">
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
// 언어 옵션
// ─────────────────────────────────────────────
const LANGUAGE_OPTIONS = [
  { value: "JAVA", label: "Java" },
  { value: "PYTHON", label: "Python" },
  { value: "JAVASCRIPT", label: "JavaScript" },
  { value: "TYPESCRIPT", label: "TypeScript" },
  { value: "SQL", label: "SQL" },
  { value: "GO", label: "Go" },
  { value: "TEXT", label: "Text" },
];

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export function ChallengePage() {
  const queryClient = useQueryClient();
  const { user } = useStore(authStore, (s) => s);
  const isAdmin = user?.role === "ROLE_ADMIN";

  // ── 사이드바 넓이
  const [cat1Width, setCat1Width] = useState(() => {
    const saved = localStorage.getItem("challenge-cat1-width");
    return saved ? Number(saved) : 180;
  });
  const [cat2Width, setCat2Width] = useState(() => {
    const saved = localStorage.getItem("challenge-cat2-width");
    return saved ? Number(saved) : 200;
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
        localStorage.setItem("challenge-cat1-width", String(next));
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
        localStorage.setItem("challenge-cat2-width", String(next));
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

  // ── 주제 편집 상태
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTopicBlocks, setEditTopicBlocks] = useState<ChallengeTopic[]>([]);

  // ── 카테고리 CRUD 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // ── 섹션 CRUD 상태
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  // ── 풀이 제출 상태
  const [submissionLanguage, setSubmissionLanguage] = useState("JAVA");
  const [submissionContent, setSubmissionContent] = useState("");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<number>>(
    new Set(),
  );
  // ── 풀이 수정 상태
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(
    null,
  );
  const [editSubLanguage, setEditSubLanguage] = useState("");
  const [editSubContent, setEditSubContent] = useState("");

  // ─────────────────────────────────────────────
  // Queries
  // ─────────────────────────────────────────────
  const { data: categories = [] } = useQuery<ChallengeCategory[]>({
    queryKey: ["challenge", "categories"],
    queryFn: challengeApi.getCategories,
  });

  const { data: sections = [] } = useQuery<ChallengeSection[]>({
    queryKey: ["challenge", "sections", selectedCategoryId],
    queryFn: () => challengeApi.getSections(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  const { data: topics = [] } = useQuery<ChallengeTopic[]>({
    queryKey: ["challenge", "topics", selectedSectionId],
    queryFn: () => challengeApi.getTopics(selectedSectionId!),
    enabled: !!selectedSectionId,
  });

  const { data: submissions = [] } = useQuery<ChallengeSubmission[]>({
    queryKey: ["challenge", "submissions", selectedSectionId],
    queryFn: () => challengeApi.getSubmissions(selectedSectionId!),
    enabled: !!selectedSectionId,
  });

  // ─────────────────────────────────────────────
  // Mutations — 카테고리
  // ─────────────────────────────────────────────
  const addCategoryMutation = useMutation({
    mutationFn: (name: string) =>
      challengeApi.createCategory({
        name,
        icon: "Folder",
        emoji: "",
        orderNum: categories.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", "categories"] });
      setIsAddingCategory(false);
      setNewCategoryName("");
      toast.success("카테고리가 추가되었습니다");
    },
    onError: () => toast.error("카테고리 추가 실패"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => {
      const cat = categories.find((c) => c.id === id);
      return challengeApi.updateCategory(id, {
        name,
        icon: cat?.icon ?? "Folder",
        emoji: cat?.emoji ?? "",
        orderNum: cat?.orderNum ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", "categories"] });
      setEditingCategoryId(null);
      setEditingCategoryName("");
      toast.success("카테고리가 수정되었습니다");
    },
    onError: () => toast.error("카테고리 수정 실패"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => challengeApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", "categories"] });
      setSelectedCategoryId(null);
      setSelectedSectionId(null);
      toast.success("카테고리가 삭제되었습니다");
    },
    onError: () => toast.error("카테고리 삭제 실패"),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      challengeApi.reorderCategories(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", "categories"] });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  // ─────────────────────────────────────────────
  // Mutations — 섹션
  // ─────────────────────────────────────────────
  const addSectionMutation = useMutation({
    mutationFn: (title: string) =>
      challengeApi.createSection({
        categoryId: selectedCategoryId!,
        title,
        orderNum: sections.length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "sections", selectedCategoryId],
      });
      setIsAddingSection(false);
      setNewSectionTitle("");
      toast.success("섹션이 추가되었습니다");
    },
    onError: () => toast.error("섹션 추가 실패"),
  });

  const renameSectionMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => {
      const sec = sections.find((s) => s.id === id);
      return challengeApi.updateSection(id, {
        title,
        orderNum: sec?.orderNum ?? 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "sections", selectedCategoryId],
      });
      setEditingSectionId(null);
      setEditingSectionTitle("");
      toast.success("섹션이 수정되었습니다");
    },
    onError: () => toast.error("섹션 수정 실패"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => challengeApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "sections", selectedCategoryId],
      });
      setSelectedSectionId(null);
      toast.success("섹션이 삭제되었습니다");
    },
    onError: () => toast.error("섹션 삭제 실패"),
  });

  const reorderSectionMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      challengeApi.reorderSections(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "sections", selectedCategoryId],
      });
    },
    onError: () => toast.error("순서 변경 실패"),
  });

  // ─────────────────────────────────────────────
  // Mutations — 주제 블록
  // ─────────────────────────────────────────────
  const saveTopicsMutation = useMutation({
    mutationFn: () =>
      challengeApi.saveTopics(selectedSectionId!, editTopicBlocks),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "topics", selectedSectionId],
      });
      setIsEditingTopic(false);
      toast.success("주제가 저장되었습니다");
    },
    onError: () => toast.error("주제 저장 실패"),
  });

  // ─────────────────────────────────────────────
  // Mutations — 풀이 제출
  // ─────────────────────────────────────────────
  const createSubmissionMutation = useMutation({
    mutationFn: () =>
      challengeApi.createSubmission(selectedSectionId!, {
        language: submissionLanguage,
        content: submissionContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "submissions", selectedSectionId],
      });
      setSubmissionContent("");
      toast.success("풀이가 제출되었습니다");
    },
    onError: () => toast.error("제출 실패"),
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      challengeApi.updateSubmission(id, {
        language: editSubLanguage,
        content: editSubContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "submissions", selectedSectionId],
      });
      setEditingSubmissionId(null);
      toast.success("풀이가 수정되었습니다");
    },
    onError: () => toast.error("수정 실패"),
  });

  const deleteSubmissionMutation = useMutation({
    mutationFn: (id: number) => challengeApi.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "submissions", selectedSectionId],
      });
      toast.success("풀이가 삭제되었습니다");
    },
    onError: () => toast.error("삭제 실패"),
  });

  // ─────────────────────────────────────────────
  // DnD
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
    setIsEditingTopic(false);
    setIsAddingSection(false);
    setNewSectionTitle("");
  };

  const handleSectionClick = (id: number) => {
    setSelectedSectionId(id);
    setIsEditingTopic(false);
    setEditingSubmissionId(null);
    setExpandedSubmissions(new Set());
  };

  const handleEditTopic = () => {
    setEditTopicBlocks([...topics]);
    setIsEditingTopic(true);
  };

  const handleCancelEditTopic = () => {
    setIsEditingTopic(false);
    setEditTopicBlocks([]);
  };

  const toggleSubmission = (id: number) => {
    setExpandedSubmissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const name = newCategoryName.trim();
      if (name && !addCategoryMutation.isPending)
        addCategoryMutation.mutate(name);
    }
    if (e.key === "Escape") {
      setIsAddingCategory(false);
      setNewCategoryName("");
    }
  };

  const handleAddSectionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const title = newSectionTitle.trim();
      if (title && !addSectionMutation.isPending)
        addSectionMutation.mutate(title);
    }
    if (e.key === "Escape") {
      setIsAddingSection(false);
      setNewSectionTitle("");
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl h-[720px] flex rounded-2xl border border-border shadow-lg overflow-hidden bg-card">
        {/* ───────────────────────────────────────────
            1차 사이드바: 카테고리
        ─────────────────────────────────────────── */}
        <aside
          className="shrink-0 border-r border-border bg-muted/30 flex flex-col relative"
          style={{ width: cat1Width }}
        >
          <div
            className="px-4 border-b border-border flex items-center justify-between"
            style={{ minHeight: "49px" }}
          >
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Challenge
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Coding Challenge
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="shrink-0 flex items-center text-xs text-primary hover:text-primary/80 transition-colors"
                title="Add category"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

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
                                  title="Rename"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      confirm(
                                        `"${cat.name}" 카테고리를 삭제할까요?`,
                                      )
                                    ) {
                                      deleteCategoryMutation.mutate(cat.id);
                                    }
                                  }}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded"
                                  title="Delete"
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

            {isAddingCategory && (
              <div className="px-3 py-2 flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleAddCategoryKeyDown}
                  placeholder="Category name..."
                  className="flex-1 min-w-0 text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={() => {
                    const name = newCategoryName.trim();
                    if (name) addCategoryMutation.mutate(name);
                  }}
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
                No categories
              </p>
            )}
          </nav>

          <div
            onMouseDown={startResize1}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40 transition-colors z-10"
          />
        </aside>

        {/* ───────────────────────────────────────────
            2차 사이드바: 섹션 (회차)
        ─────────────────────────────────────────── */}
        <aside
          className="shrink-0 border-r border-border bg-card flex flex-col relative"
          style={{ width: cat2Width }}
        >
          <div
            className="px-3 border-b border-border flex items-center justify-between gap-2"
            style={{ minHeight: "49px" }}
          >
            <p className="text-sm font-semibold text-foreground truncate">
              {selectedCategory ? selectedCategory.name : "Section"}
            </p>
            {isAdmin && selectedCategoryId && (
              <button
                onClick={() => setIsAddingSection(true)}
                className="shrink-0 flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 transition-colors"
                title="Add section"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {!selectedCategoryId ? (
              <p className="text-xs text-muted-foreground px-4 py-3">
                Select a category
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
                                      title="Rename"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          confirm(
                                            `"${sec.title}" section will be deleted.`,
                                          )
                                        ) {
                                          deleteSectionMutation.mutate(sec.id);
                                        }
                                      }}
                                      className="text-muted-foreground hover:text-destructive p-1 rounded"
                                      title="Delete"
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

                {isAddingSection && (
                  <div className="px-3 py-2 flex items-center gap-1">
                    <input
                      autoFocus
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyDown={handleAddSectionKeyDown}
                      placeholder="Section title..."
                      className="flex-1 min-w-0 text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={() => {
                        const title = newSectionTitle.trim();
                        if (title) addSectionMutation.mutate(title);
                      }}
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
                    No sections
                  </p>
                )}
              </>
            )}
          </nav>

          <div
            onMouseDown={startResize2}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40 transition-colors z-10"
          />
        </aside>

        {/* ───────────────────────────────────────────
            본문 영역
        ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* 카테고리 미선택 */}
          {!selectedCategoryId && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Trophy className="w-12 h-12 text-amber-400" />
              <p className="text-base font-medium">Challenge</p>
              <p className="text-sm">
                Select a category from the left sidebar.
              </p>
            </div>
          )}

          {/* 섹션 미선택 */}
          {selectedCategoryId && !selectedSectionId && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <p className="text-base font-medium">Select a section</p>
              <p className="text-sm">
                Choose a section to view the challenge topic.
              </p>
            </div>
          )}

          {/* 섹션 선택됨 — 본문 */}
          {selectedSectionId && (
            <div className="flex flex-col h-full">
              {/* ── 챌린지 주제 영역 ── */}
              <section className="border-b border-border p-6 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {selectedCategory?.name}
                    </p>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      {selectedSection?.title ?? ""}
                    </h2>
                  </div>
                  {isAdmin && !isEditingTopic && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditTopic}
                      className="flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingTopic ? (
                  <div>
                    <TaskBlockEditor
                      title={selectedSection?.title ?? ""}
                      setTitle={() => {}}
                      blocks={editTopicBlocks as TaskBlock[]}
                      setBlocks={(b) =>
                        setEditTopicBlocks(b as ChallengeTopic[])
                      }
                    />
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                      <Button
                        onClick={() => saveTopicsMutation.mutate()}
                        disabled={saveTopicsMutation.isPending}
                        className="flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        {saveTopicsMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEditTopic}
                        disabled={saveTopicsMutation.isPending}
                        className="flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {topics.length === 0 ? (
                      <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
                        <span className="text-3xl">
                          <Trophy className="w-8 h-8 text-amber-300" />
                        </span>
                        <p className="text-sm">No topic yet.</p>
                        {isAdmin && (
                          <p className="text-xs">
                            Click "Edit" to add the challenge topic.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        {topics.map((block, idx) => (
                          <TopicBlockViewer
                            key={block.id ?? idx}
                            block={block}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* ── 풀이 제출 영역 ── */}
              <section className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Submit Solution
                </h3>

                {/* 내 풀이 작성 */}
                <div className="mb-6 space-y-3 bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-muted-foreground">
                      Language
                    </label>
                    <select
                      value={submissionLanguage}
                      onChange={(e) => setSubmissionLanguage(e.target.value)}
                      className="text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={6}
                    placeholder="Paste your solution here..."
                    className="w-full text-sm font-mono border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => createSubmissionMutation.mutate()}
                      disabled={
                        !submissionContent.trim() ||
                        createSubmissionMutation.isPending
                      }
                      className="flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {createSubmissionMutation.isPending
                        ? "Submitting..."
                        : "Submit"}
                    </Button>
                  </div>
                </div>

                {/* 팀원 제출 목록 */}
                {submissions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                      Team Submissions ({submissions.length})
                    </h4>
                    <div className="space-y-2">
                      {submissions.map((sub) => {
                        const isExpanded = expandedSubmissions.has(sub.id);
                        const isMine = sub.userId === user?.id;
                        const canDelete = isMine || isAdmin;
                        const isEditingSub = editingSubmissionId === sub.id;

                        return (
                          <div
                            key={sub.id}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            {/* 제출 헤더 */}
                            <button
                              onClick={() => toggleSubmission(sub.id)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-foreground">
                                  {sub.userName}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                  {sub.language}
                                </span>
                                {isMine && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                    Me
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(sub.createdAt).toLocaleString(
                                    "ko-KR",
                                    {
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </button>

                            {/* 제출 내용 (펼침) */}
                            {isExpanded && (
                              <div className="border-t border-border">
                                {isEditingSub ? (
                                  <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <label className="text-xs font-medium text-muted-foreground">
                                        Language
                                      </label>
                                      <select
                                        value={editSubLanguage}
                                        onChange={(e) =>
                                          setEditSubLanguage(e.target.value)
                                        }
                                        className="text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                      >
                                        {LANGUAGE_OPTIONS.map((opt) => (
                                          <option
                                            key={opt.value}
                                            value={opt.value}
                                          >
                                            {opt.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <textarea
                                      value={editSubContent}
                                      onChange={(e) =>
                                        setEditSubContent(e.target.value)
                                      }
                                      rows={6}
                                      className="w-full text-sm font-mono border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          updateSubmissionMutation.mutate({
                                            id: sub.id,
                                          })
                                        }
                                        disabled={
                                          updateSubmissionMutation.isPending
                                        }
                                      >
                                        <Save className="w-3.5 h-3.5 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setEditingSubmissionId(null)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4">
                                    <pre className="text-xs font-mono bg-muted p-3 rounded-lg border border-border overflow-x-auto whitespace-pre-wrap mb-3">
                                      {sub.content}
                                    </pre>
                                    <div className="flex items-center gap-2">
                                      {isMine && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingSubmissionId(sub.id);
                                            setEditSubLanguage(sub.language);
                                            setEditSubContent(sub.content);
                                          }}
                                        >
                                          <Pencil className="w-3 h-3 mr-1" />
                                          Edit
                                        </Button>
                                      )}
                                      {canDelete && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-destructive hover:text-destructive"
                                          onClick={() => {
                                            if (
                                              confirm(
                                                "Delete this submission?",
                                              )
                                            ) {
                                              deleteSubmissionMutation.mutate(
                                                sub.id,
                                              );
                                            }
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3 mr-1" />
                                          Delete
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ChallengePage;
