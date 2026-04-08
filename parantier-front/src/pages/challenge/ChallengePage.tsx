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
  Star,
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
// 체크리스트 타입
// ─────────────────────────────────────────────
interface ChecklistItem {
  label: string;
  point: number;
}

interface ChecklistResult {
  index: number;
  checked: boolean;
}

function parseChecklist(content: string): ChecklistItem[] {
  try { return JSON.parse(content); } catch { return []; }
}

function parseChecklistResult(json: string | null | undefined): ChecklistResult[] {
  try { return json ? JSON.parse(json) : []; } catch { return []; }
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

  if (block.blockType === "CHECKLIST") {
    const items = parseChecklist(block.content);
    const totalPoints = items.reduce((s, i) => s + i.point, 0);
    return (
      <div className="mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block bg-emerald-100 text-emerald-700">
          Checklist ({totalPoints}pts)
        </span>
        <div className="space-y-1.5 mt-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 border border-border rounded flex items-center justify-center bg-muted/50 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <span className="text-xs text-muted-foreground font-medium shrink-0">{item.point}pt</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
// 아바타 컴포넌트
// ─────────────────────────────────────────────
function UserAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${sizeClass} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
    >
      {initial}
    </div>
  );
}

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
    return saved ? Number(saved) : 220;
  });
  const [cat2Width, setCat2Width] = useState(() => {
    const saved = localStorage.getItem("challenge-cat2-width");
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
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [submissionGithubUrl, setSubmissionGithubUrl] = useState("");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionChecks, setSubmissionChecks] = useState<boolean[]>([]);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<number>>(
    new Set(),
  );
  // ── 풀이 수정 상태
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(
    null,
  );
  const [editSubGithubUrl, setEditSubGithubUrl] = useState("");
  const [editSubContent, setEditSubContent] = useState("");
  const [editSubChecks, setEditSubChecks] = useState<boolean[]>([]);

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
  // 현재 섹션의 CHECKLIST 블록 파싱
  const checklistBlock = topics.find((t) => t.blockType === "CHECKLIST");
  const checklistItems: ChecklistItem[] = checklistBlock ? parseChecklist(checklistBlock.content) : [];
  const totalPoints = checklistItems.reduce((s, i) => s + i.point, 0);

  const createSubmissionMutation = useMutation({
    mutationFn: () => {
      const checklistResult = checklistItems.length > 0
        ? JSON.stringify(submissionChecks.map((checked, index) => ({ index, checked })))
        : undefined;
      return challengeApi.createSubmission(selectedSectionId!, {
        githubUrl: submissionGithubUrl,
        content: submissionContent,
        checklistResult,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "submissions", selectedSectionId],
      });
      setSubmissionGithubUrl("");
      setSubmissionContent("");
      setSubmissionChecks([]);
      setIsSubmitFormOpen(false);
      toast.success("풀이가 제출되었습니다");
    },
    onError: () => toast.error("제출 실패"),
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => {
      const checklistResult = checklistItems.length > 0
        ? JSON.stringify(editSubChecks.map((checked, index) => ({ index, checked })))
        : undefined;
      return challengeApi.updateSubmission(id, {
        githubUrl: editSubGithubUrl,
        content: editSubContent,
        checklistResult,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "submissions", selectedSectionId],
      });
      setEditingSubmissionId(null);
      toast.success("풀이가 수정되었습니다");
    },
    onError: () => toast.error("수정 실패"),
  });

  const rateSubmissionMutation = useMutation({
    mutationFn: ({ id, rating }: { id: number; rating: number }) =>
      challengeApi.rateSubmission(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["challenge", "submissions", selectedSectionId],
      });
    },
    onError: () => toast.error("평가 실패"),
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
    setSubmissionChecks([]);
    setIsSubmitFormOpen(false);
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
      <div className="w-full max-w-7xl h-[780px] flex rounded-2xl border border-border shadow-lg overflow-hidden bg-card">
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
                {/* 제출 폼 토글 버튼 */}
                <button
                  onClick={() => setIsSubmitFormOpen((v) => !v)}
                  className="w-full flex items-center justify-between mb-4 group"
                >
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    제출
                  </h3>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                    {isSubmitFormOpen ? (
                      <>접기 <ChevronDown className="w-3.5 h-3.5" /></>
                    ) : (
                      <>작성하기 <Plus className="w-3.5 h-3.5" /></>
                    )}
                  </span>
                </button>

                {/* 내 풀이 작성 (토글) */}
                {isSubmitFormOpen && (
                  <div className="mb-6 space-y-3 bg-muted/30 rounded-lg p-4 border border-border animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-3">
                      <UserAvatar name={user?.username ?? "?"} />
                      <div className="flex-1 space-y-3">
                        {/* 체크리스트 항목 */}
                        {checklistItems.length > 0 && (
                          <div className="border border-border rounded-lg p-3 bg-background">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-foreground">Checklist</span>
                              <span className="text-xs font-bold text-primary">
                                {submissionChecks.filter(Boolean).reduce((s, _, i) => s + (checklistItems[i]?.point ?? 0), 0)}/{totalPoints}pt
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {checklistItems.map((item, i) => {
                                if (submissionChecks.length <= i) {
                                  setSubmissionChecks((prev) => {
                                    const next = [...prev];
                                    while (next.length <= i) next.push(false);
                                    return next;
                                  });
                                }
                                return (
                                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                                    <input
                                      type="checkbox"
                                      checked={submissionChecks[i] ?? false}
                                      onChange={(e) => {
                                        setSubmissionChecks((prev) => {
                                          const next = [...prev];
                                          while (next.length <= i) next.push(false);
                                          next[i] = e.target.checked;
                                          return next;
                                        });
                                      }}
                                      className="w-4 h-4 rounded border-border accent-primary"
                                    />
                                    <span className="flex-1">{item.label}</span>
                                    <span className="text-xs text-muted-foreground font-medium">{item.point}pt</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <input
                          type="url"
                          value={submissionGithubUrl}
                          onChange={(e) => setSubmissionGithubUrl(e.target.value)}
                          placeholder="GitHub URL (repo, gist, PR...)"
                          className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <textarea
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                          rows={3}
                          placeholder="Description..."
                          className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsSubmitFormOpen(false);
                              setSubmissionGithubUrl("");
                              setSubmissionContent("");
                              setSubmissionChecks([]);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => createSubmissionMutation.mutate()}
                            disabled={
                              (!submissionContent.trim() &&
                                !submissionGithubUrl.trim() &&
                                !submissionChecks.some(Boolean)) ||
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
                    </div>
                  </div>
                )}

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
                            className="border border-border rounded-lg overflow-hidden group"
                          >
                            {/* 제출 헤더 */}
                            <button
                              onClick={() => toggleSubmission(sub.id)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <UserAvatar name={sub.userName} size="sm" />
                                <span className="font-medium text-foreground">
                                  {sub.userName}
                                </span>
                                {isMine && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                    Me
                                  </span>
                                )}
                                {/* 점수 배지 */}
                                {checklistItems.length > 0 && (sub.score ?? 0) > 0 && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                                    {sub.score}/{totalPoints}pt
                                  </span>
                                )}
                                {/* 별점 미리보기 */}
                                {(sub.rating ?? 0) > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < (sub.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                                      />
                                    ))}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {/* 수정/삭제 아이콘 (우상단) */}
                                {(isMine || canDelete) && (
                                  <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    {isMine && (
                                      <button
                                        onClick={() => {
                                          setEditingSubmissionId(sub.id);
                                          setEditSubGithubUrl(sub.githubUrl ?? "");
                                          setEditSubContent(sub.content);
                                          const existingResults = parseChecklistResult(sub.checklistResult);
                                          setEditSubChecks(checklistItems.map((_, i) =>
                                            existingResults.find(r => r.index === i)?.checked ?? false
                                          ));
                                        }}
                                        className="p-1 text-muted-foreground hover:text-foreground rounded"
                                        title="Edit"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        onClick={() => {
                                          if (confirm("Delete this submission?")) {
                                            deleteSubmissionMutation.mutate(sub.id);
                                          }
                                        }}
                                        className="p-1 text-muted-foreground hover:text-destructive rounded"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </span>
                                )}
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
                                    {/* 수정 시 체크리스트 */}
                                    {checklistItems.length > 0 && (
                                      <div className="border border-border rounded-lg p-3 bg-background">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-semibold">Checklist</span>
                                          <span className="text-xs font-bold text-primary">
                                            {editSubChecks.filter(Boolean).reduce((s, _, i) => s + (checklistItems[i]?.point ?? 0), 0)}/{totalPoints}pt
                                          </span>
                                        </div>
                                        <div className="space-y-1.5">
                                          {checklistItems.map((item, i) => (
                                            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                                              <input
                                                type="checkbox"
                                                checked={editSubChecks[i] ?? false}
                                                onChange={(e) => {
                                                  setEditSubChecks((prev) => {
                                                    const next = [...prev];
                                                    while (next.length <= i) next.push(false);
                                                    next[i] = e.target.checked;
                                                    return next;
                                                  });
                                                }}
                                                className="w-4 h-4 rounded border-border accent-primary"
                                              />
                                              <span className="flex-1">{item.label}</span>
                                              <span className="text-xs text-muted-foreground">{item.point}pt</span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    <input
                                      type="url"
                                      value={editSubGithubUrl}
                                      onChange={(e) =>
                                        setEditSubGithubUrl(e.target.value)
                                      }
                                      placeholder="GitHub URL"
                                      className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <textarea
                                      value={editSubContent}
                                      onChange={(e) =>
                                        setEditSubContent(e.target.value)
                                      }
                                      rows={3}
                                      placeholder="Description..."
                                      className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
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
                                    {sub.githubUrl && (
                                      <a
                                        href={sub.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-2"
                                      >
                                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                                        </svg>
                                        {sub.githubUrl}
                                      </a>
                                    )}
                                    {sub.content && (
                                      <p className="text-sm text-foreground/80 whitespace-pre-wrap mb-3">
                                        {sub.content}
                                      </p>
                                    )}
                                    {/* 체크리스트 결과 */}
                                    {checklistItems.length > 0 && sub.checklistResult && (() => {
                                      const results = parseChecklistResult(sub.checklistResult);
                                      const checkedScore = results.reduce((s, r) =>
                                        r.checked && r.index < checklistItems.length
                                          ? s + checklistItems[r.index].point : s, 0);
                                      return (
                                        <div className="mb-3 border border-border rounded-lg p-3 bg-muted/20">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold">Checklist</span>
                                            <span className="text-xs font-bold text-emerald-600">{checkedScore}/{totalPoints}pt</span>
                                          </div>
                                          <div className="space-y-1">
                                            {checklistItems.map((item, i) => {
                                              const checked = results.find(r => r.index === i)?.checked ?? false;
                                              return (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-muted/50"}`}>
                                                    {checked && <Check className="w-3 h-3" />}
                                                  </div>
                                                  <span className={`flex-1 ${checked ? "" : "text-muted-foreground"}`}>{item.label}</span>
                                                  <span className="text-xs text-muted-foreground">{item.point}pt</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                    {/* 별점 평가 */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Rating</span>
                                        <div className="flex items-center gap-0.5">
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <button
                                              key={i}
                                              onClick={() => {
                                                if (isAdmin) {
                                                  const newRating = i + 1 === sub.rating ? 0 : i + 1;
                                                  rateSubmissionMutation.mutate({ id: sub.id, rating: newRating });
                                                }
                                              }}
                                              className={`transition-colors ${isAdmin ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
                                              disabled={!isAdmin}
                                            >
                                              <Star
                                                className={`w-4 h-4 ${i < (sub.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30 hover:text-amber-300"}`}
                                              />
                                            </button>
                                          ))}
                                        </div>
                                        {(sub.rating ?? 0) > 0 && (
                                          <span className="text-xs font-medium text-amber-600">
                                            {sub.rating}/5
                                          </span>
                                        )}
                                      </div>
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
