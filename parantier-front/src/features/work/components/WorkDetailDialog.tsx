import { useRef, useState, useCallback } from "react";
import { Calendar } from "@/shared/ui/calendar";
import { format, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Image as ImageIcon,
  Database,
  FileText,
  Eye,
  ExternalLink,
  Link,
  Unlink,
  ChevronRight,
} from "lucide-react";
import { WorkChatPanel } from "@/features/work/components/WorkChatPanel";
import { SubWorkSection } from "@/features/work/components/SubWorkSection";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Dialog,
  DialogContent,
  FullscreenDialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Checkbox } from "@/shared/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  useWork,
  useUpdateWork,
  useDeleteWork,
  useUpdateWorkStatus,
} from "@/features/work/hooks/useWorks";
import {
  useWorkImages,
  useUploadWorkImage,
  useDeleteWorkImage,
} from "@/features/work/hooks/useWorkImages";
import {
  useWorkChecklists,
  useCreateWorkChecklist,
  useToggleWorkChecklist,
  useDeleteWorkChecklist,
} from "@/features/work/hooks/useWorkChecklists";
import {
  useWorkMindmaps,
  useCreateWorkMindmap,
  useUpdateWorkMindmap,
  useDeleteWorkMindmap,
} from "@/features/work/hooks/useWorkMindmaps";
import {
  useWorkDbTables,
  useCreateWorkDbTable,
  useUpdateWorkDbTable,
  useDeleteWorkDbTable,
} from "@/features/work/hooks/useWorkDbTables";
import {
  useWorkFigmas,
  useCreateWorkFigma,
  useUpdateWorkFigma,
  useDeleteWorkFigma,
} from "@/features/work/hooks/useWorkFigmas";
import {
  useWorkLinkedIssues,
  useLinkIssue,
  useUnlinkIssue,
} from "@/features/work/hooks/useWorkLinkedIssues";
import { issueApi } from "@/entities/issue/api/issueApi";
import type {
  WorkStatus,
  WorkPriority,
  WorkType,
} from "@/entities/work/types/work";
import type { DbTableContent } from "@/entities/work/types/workDbTable";
import {
  parseDbTableContent,
  parseTsvToColumns,
} from "@/entities/work/types/workDbTable";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { toast } from "sonner";
import { Mermaid } from "@/shared/ui/mermaid";
import { useAllUsers } from "@/features/user/hooks/useAllUsers";
import mermaid from "mermaid";

// ─── FormTimeInput ─────────────────────────────────────────────────────────────
function FormTimeInput({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (time: string) => void;
}) {
  const [localTime, setLocalTime] = useState(value);
  const [error, setError] = useState("");

  const validate = (val: string): boolean => {
    const match = val.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      setError("HH:MM 형식으로 입력하세요");
      return false;
    }
    const h = Number(match[1]),
      m = Number(match[2]);
    if (h < 0 || h > 23) {
      setError("시는 0~23 사이여야 합니다");
      return false;
    }
    if (m < 0 || m > 59) {
      setError("분은 0~59 사이여야 합니다");
      return false;
    }
    setError("");
    onCommit(val);
    return true;
  };

  return (
    <div className="border-t px-3 py-2">
      <input
        type="text"
        value={localTime}
        onChange={(e) => {
          setLocalTime(e.target.value);
          if (error) validate(e.target.value);
        }}
        onBlur={(e) => validate(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="09:00"
        maxLength={5}
        className={`w-full px-3 py-1.5 border rounded text-sm text-center font-mono tracking-widest ${
          error ? "border-destructive" : "border-input"
        } focus:outline-none focus:ring-1 focus:ring-ring`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ─── 상수 ──────────────────────────────────────────────────────────────────────

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  APACHE: "🚁 아파치",
  DRONE: "🛸 드론",
  SNIPER: "🎯 저격총",
  HAMMER: "🔨 망치",
  ROCKET: "🚀 로켓",
  MISSILE: "💥 미사일",
  CANNON: "💣 캐논",
  SPEAR: "🔫 작살",
  SHIP: "⛵ 배",
  BOOK: "📚 책",
};

const WORK_TYPE_COLORS: Record<WorkType, string> = {
  APACHE: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  DRONE: "bg-sky-100 text-sky-700 hover:bg-sky-100",
  SNIPER: "bg-red-100 text-red-700 hover:bg-red-100",
  HAMMER: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  ROCKET: "bg-violet-100 text-violet-700 hover:bg-violet-100",
  MISSILE: "bg-rose-100 text-rose-800 hover:bg-rose-100",
  CANNON: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  SPEAR: "bg-red-100 text-red-700 hover:bg-red-100",
  SHIP: "bg-green-100 text-green-700 hover:bg-green-100",
  BOOK: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
};

const STATUS_LABELS: Record<WorkStatus, string> = {
  TODO: "진행 전",
  IN_PROGRESS: "진행 중",
  TEST: "테스트",
  DONE: "완료",
  HOLD: "보류",
  BLOCKED: "막힘",
};

const STATUS_COLORS: Record<WorkStatus, string> = {
  TODO: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  IN_PROGRESS: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  TEST: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  DONE: "bg-green-100 text-green-700 hover:bg-green-100",
  HOLD: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  BLOCKED: "bg-red-100 text-red-700 hover:bg-red-100",
};

const PRIORITY_LABELS: Record<WorkPriority, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
  CRITICAL: "긴급",
};

const PRIORITY_COLORS: Record<WorkPriority, string> = {
  CRITICAL: "bg-red-200 text-red-800 hover:bg-red-200",
  HIGH: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  MEDIUM: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  LOW: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

const ISSUE_STATUS_LABELS: Record<string, string> = {
  OPEN: "미처리",
  IN_PROGRESS: "진행중",
  RESOLVED: "해결됨",
  CLOSED: "완료",
};

const ISSUE_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface WorkDetailDialogProps {
  workId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function WorkDetailDialog({
  workId,
  open,
  onOpenChange,
}: WorkDetailDialogProps) {
  // 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const editPanelRef = useRef<HTMLDivElement>(null);

  // 폼 데이터
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formWorkType, setFormWorkType] = useState<WorkType>("APACHE");
  const [formStatus, setFormStatus] = useState<WorkStatus>("TODO");
  const [formPriority, setFormPriority] = useState<WorkPriority>("MEDIUM");
  const [formAssigneeId, setFormAssigneeId] = useState<number | null>(null);
  const [formDueDate, setFormDueDate] = useState<string>("");
  const [formPrize, setFormPrize] = useState<number>(0);

  // API 호출
  const { data: workDetail } = useWork(workId!, {
    enabled: !!workId && !isEditing,
  });

  const { mutate: updateWork } = useUpdateWork();
  const { mutate: deleteWork } = useDeleteWork();
  const { mutate: updateStatus } = useUpdateWorkStatus();
  const { confirm, ConfirmDialog } = useConfirm();

  // 사용자 목록
  const { data: usersData } = useAllUsers();
  const users = usersData || [];

  // 이미지 관련
  const { data: workImages } = useWorkImages(workId);
  const { mutate: uploadImage, isPending: isUploading } = useUploadWorkImage(
    workId!,
  );
  const { mutate: deleteImage } = useDeleteWorkImage(workId!);
  const [isDragging, setIsDragging] = useState(false);
  const [isPasteMode, setIsPasteMode] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // 체크리스트 관련
  const { data: checklists } = useWorkChecklists(workId);
  const { mutate: createChecklist } = useCreateWorkChecklist(workId!);
  const { mutate: toggleChecklist } = useToggleWorkChecklist(workId!);
  const { mutate: deleteChecklist } = useDeleteWorkChecklist(workId!);
  const [newChecklistContent, setNewChecklistContent] = useState("");

  // 마인드맵 관련
  const { data: mindmaps } = useWorkMindmaps(workId);
  const { mutate: createMindmap } = useCreateWorkMindmap(workId!);
  const { mutate: updateMindmap } = useUpdateWorkMindmap(workId!);
  const { mutate: deleteMindmap } = useDeleteWorkMindmap(workId!);
  const [selectedMindmapId, setSelectedMindmapId] = useState<number | null>(
    null,
  );
  const [mindmapTitle, setMindmapTitle] = useState("");
  const [mindmapContent, setMindmapContent] = useState("");
  const [isMindmapDialogOpen, setIsMindmapDialogOpen] = useState(false);
  const [isMindmapViewDialogOpen, setIsMindmapViewDialogOpen] = useState(false);
  const [viewMindmapData, setViewMindmapData] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
  } | null>(null);

  // DB 테이블 관련
  const { data: dbTables } = useWorkDbTables(workId);
  const { mutate: createDbTable } = useCreateWorkDbTable(workId!);
  const { mutate: updateDbTable } = useUpdateWorkDbTable(workId!);
  const { mutate: deleteDbTable } = useDeleteWorkDbTable(workId!);
  const [selectedDbTableId, setSelectedDbTableId] = useState<number | null>(
    null,
  );
  const [dbTableContent, setDbTableContent] = useState<DbTableContent>({
    tableName: "",
    schema: "",
    category: "",
    description: "",
    queryResult: "",
    columns: [],
  });
  const [isDbTableDialogOpen, setIsDbTableDialogOpen] = useState(false);

  // 피그마 관련
  const { data: figmas } = useWorkFigmas(workId);
  const { mutate: createFigma } = useCreateWorkFigma(workId!);
  const { mutate: updateFigma } = useUpdateWorkFigma(workId!);
  const { mutate: deleteFigma } = useDeleteWorkFigma(workId!);
  const [isFigmaDialogOpen, setIsFigmaDialogOpen] = useState(false);
  const [selectedFigmaId, setSelectedFigmaId] = useState<number | null>(null);
  const [figmaTitle, setFigmaTitle] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [figmaDescription, setFigmaDescription] = useState("");

  // 연결 이슈 관련
  const { data: linkedIssues } = useWorkLinkedIssues(workId);
  const { mutate: linkIssue } = useLinkIssue(workId!);
  const { mutate: unlinkIssue } = useUnlinkIssue(workId!);
  const [issueSearchKeyword, setIssueSearchKeyword] = useState("");
  const [issueSearchResults, setIssueSearchResults] = useState<
    { id: number; title: string; status: string }[]
  >([]);
  const [isSearchingIssue, setIsSearchingIssue] = useState(false);

  // ── 핸들러 ──────────────────────────────────────────────────────────────────

  const handleEdit = () => {
    if (!workDetail) return;
    setFormTitle(workDetail.title);
    setFormContent(workDetail.content);
    setFormWorkType(workDetail.workType);
    setFormStatus(workDetail.status);
    setFormPriority(workDetail.priority);
    setFormAssigneeId(workDetail.assigneeId ?? null);
    setFormDueDate(workDetail.dueDate ?? "");
    setFormPrize(workDetail.prize ?? 0);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast.error("제목을 입력하세요");
      return;
    }
    if (!formContent.trim()) {
      toast.error("내용을 입력하세요");
      return;
    }

    const data = {
      title: formTitle,
      content: formContent,
      workType: formWorkType,
      status: formStatus,
      priority: formPriority,
      assigneeId: formAssigneeId,
      dueDate: formDueDate || null,
      prize: formPrize,
    };

    if (workId) {
      updateWork(
        { id: workId, request: data },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        },
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!workId) return;

    const confirmed = await confirm({
      title: "업무 삭제",
      description:
        "정말로 이 업무를 삭제하시겠습니까? 모든 체크리스트와 첨부 파일도 함께 삭제됩니다.",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });

    if (confirmed) {
      deleteWork(workId, {
        onSuccess: () => {
          onOpenChange(false);
          setIsEditing(false);
        },
      });
    }
  };

  const handleStatusChange = (newStatus: WorkStatus) => {
    if (!workId) return;
    updateStatus({ id: workId, status: newStatus });
  };

  const handlePriorityChange = (newPriority: WorkPriority) => {
    if (!workId || !workDetail) return;
    updateWork({
      id: workId,
      request: {
        title: workDetail.title,
        content: workDetail.content,
        workType: workDetail.workType,
        status: workDetail.status,
        priority: newPriority,
        assigneeId: workDetail.assigneeId,
        dueDate: workDetail.dueDate,
      },
    });
  };

  const handleWorkTypeChange = (newType: WorkType) => {
    if (!workId || !workDetail) return;
    updateWork({
      id: workId,
      request: {
        title: workDetail.title,
        content: workDetail.content,
        workType: newType,
        status: workDetail.status,
        priority: workDetail.priority,
        assigneeId: workDetail.assigneeId,
        dueDate: workDetail.dueDate,
      },
    });
  };

  const handleAddChecklist = () => {
    if (!newChecklistContent.trim()) {
      toast.error("체크리스트 내용을 입력하세요");
      return;
    }
    const orderNum = checklists?.length || 0;
    createChecklist({ content: newChecklistContent, orderNum });
    setNewChecklistContent("");
  };

  const handleDeleteChecklistItem = async (checklistId: number) => {
    const confirmed = await confirm({
      title: "체크리스트 삭제",
      description: "이 항목을 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });
    if (confirmed) {
      deleteChecklist(checklistId);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter((file) =>
        file.type.startsWith("image/"),
      );

      if (imageFiles.length === 0) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }

      imageFiles.forEach((file) => {
        uploadImage({ file, fileType: "image" });
      });
    },
    [uploadImage],
  );

  // 마인드맵 관련 핸들러
  const handleViewMindmap = (mindmapId: number) => {
    const mindmap = mindmaps?.find((m) => m.id === mindmapId);
    if (mindmap) {
      setViewMindmapData({ title: mindmap.title, content: mindmap.content });
      setIsMindmapViewDialogOpen(true);
    }
  };

  const handleOpenMindmapDialog = (mindmapId?: number) => {
    if (mindmapId) {
      const mindmap = mindmaps?.find((m) => m.id === mindmapId);
      if (mindmap) {
        setSelectedMindmapId(mindmapId);
        setMindmapTitle(mindmap.title);
        setMindmapContent(mindmap.content);
      }
    } else {
      setSelectedMindmapId(null);
      setMindmapTitle("");
      setMindmapContent("");
    }
    setValidationResult(null);
    setIsMindmapDialogOpen(true);
  };

  const handleSaveMindmap = () => {
    if (!mindmapTitle.trim()) {
      toast.error("제목을 입력하세요");
      return;
    }
    if (!mindmapContent.trim()) {
      toast.error("내용을 입력하세요");
      return;
    }

    if (selectedMindmapId) {
      const mindmap = mindmaps?.find((m) => m.id === selectedMindmapId);
      updateMindmap({
        mindmapId: selectedMindmapId,
        request: {
          title: mindmapTitle,
          content: mindmapContent,
          orderNum: mindmap?.orderNum || 0,
        },
      });
    } else {
      const orderNum = mindmaps?.length || 0;
      createMindmap({ title: mindmapTitle, content: mindmapContent, orderNum });
    }

    setIsMindmapDialogOpen(false);
    setMindmapTitle("");
    setMindmapContent("");
    setSelectedMindmapId(null);
  };

  const handleDeleteMindmap = async (mindmapId: number) => {
    const confirmed = await confirm({
      title: "마인드맵 삭제",
      description: "이 마인드맵을 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });
    if (confirmed) {
      deleteMindmap(mindmapId);
    }
  };

  const handleValidateMermaid = async () => {
    if (!mindmapContent.trim()) {
      setValidationResult({
        isValid: false,
        error: "Mermaid 코드를 입력하세요",
      });
      toast.error("Mermaid 코드를 입력하세요");
      return;
    }

    try {
      await mermaid.parse(mindmapContent, { suppressErrors: false });
      setValidationResult({ isValid: true });
      toast.success("Mermaid 문법이 올바릅니다");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setValidationResult({ isValid: false, error: errorMessage });
      toast.error("Mermaid 문법 오류가 있습니다");
    }
  };

  // DB 테이블 핸들러
  const handleOpenDbTableDialog = (dbTableId?: number) => {
    if (dbTableId) {
      const dbTable = dbTables?.find((t) => t.id === dbTableId);
      if (dbTable) {
        setSelectedDbTableId(dbTableId);
        const content = parseDbTableContent(dbTable.tableInfo);
        setDbTableContent(content);
      }
    } else {
      setSelectedDbTableId(null);
      setDbTableContent({
        tableName: "",
        schema: "",
        category: "",
        description: "",
        queryResult: "",
        columns: [],
      });
    }
    setIsDbTableDialogOpen(true);
  };

  const handleSaveDbTable = () => {
    if (!dbTableContent.tableName.trim()) {
      toast.error("테이블명을 입력하세요");
      return;
    }
    if (!dbTableContent.queryResult.trim()) {
      toast.error("쿼리 결과를 입력하세요");
      return;
    }

    const parsedColumns = parseTsvToColumns(dbTableContent.queryResult);
    if (parsedColumns.length === 0) {
      toast.error("유효한 쿼리 결과를 입력하세요");
      return;
    }

    const contentToSave = { ...dbTableContent, columns: parsedColumns };
    const tableInfo = JSON.stringify(contentToSave);
    const tableName = dbTableContent.tableName;

    if (selectedDbTableId) {
      const dbTable = dbTables?.find((t) => t.id === selectedDbTableId);
      updateDbTable({
        dbTableId: selectedDbTableId,
        request: { tableName, tableInfo, orderNum: dbTable?.orderNum || 0 },
      });
    } else {
      const orderNum = dbTables?.length || 0;
      createDbTable({ tableName, tableInfo, orderNum });
    }

    setIsDbTableDialogOpen(false);
    setDbTableContent({
      tableName: "",
      schema: "",
      category: "",
      description: "",
      queryResult: "",
      columns: [],
    });
    setSelectedDbTableId(null);
  };

  const handleOpenFigmaDialog = (figmaId?: number) => {
    if (figmaId) {
      const figma = figmas?.find((f) => f.id === figmaId);
      if (figma) {
        setSelectedFigmaId(figmaId);
        setFigmaTitle(figma.title);
        setFigmaUrl(figma.url);
        setFigmaDescription(figma.description || "");
      }
    } else {
      setSelectedFigmaId(null);
      setFigmaTitle("");
      setFigmaUrl("");
      setFigmaDescription("");
    }
    setIsFigmaDialogOpen(true);
  };

  const handleSaveFigma = () => {
    if (!figmaTitle.trim()) {
      toast.error("제목을 입력하세요");
      return;
    }
    if (!figmaUrl.trim()) {
      toast.error("URL을 입력하세요");
      return;
    }
    const orderNum = figmas?.length || 0;
    if (selectedFigmaId) {
      const figma = figmas?.find((f) => f.id === selectedFigmaId);
      updateFigma({
        figmaId: selectedFigmaId,
        request: {
          title: figmaTitle,
          url: figmaUrl,
          description: figmaDescription,
          orderNum: figma?.orderNum || 0,
        },
      });
    } else {
      createFigma({
        title: figmaTitle,
        url: figmaUrl,
        description: figmaDescription,
        orderNum,
      });
    }
    setIsFigmaDialogOpen(false);
  };

  const handleDeleteFigma = async (figmaId: number) => {
    const confirmed = await confirm({
      title: "피그마 삭제",
      description: "이 피그마 링크를 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });
    if (confirmed) deleteFigma(figmaId);
  };

  const handleDeleteDbTable = async (dbTableId: number) => {
    const confirmed = await confirm({
      title: "DB 테이블 삭제",
      description: "이 DB 테이블 정보를 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });
    if (confirmed) {
      deleteDbTable(dbTableId);
    }
  };

  // 드래그앤드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleUploadAreaClick = () => {
    setIsPasteMode(true);
    uploadAreaRef.current?.focus();
  };

  const handleUploadAreaBlur = () => {
    setIsPasteMode(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!isPasteMode) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItems = Array.from(items).filter((item) =>
      item.type.startsWith("image/"),
    );
    if (imageItems.length === 0) return;
    const files = imageItems
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  // 이슈 검색
  const handleIssueSearch = async () => {
    if (!issueSearchKeyword.trim()) return;
    setIsSearchingIssue(true);
    try {
      const result = await issueApi.getIssues({ keyword: issueSearchKeyword });
      const alreadyLinkedIds = linkedIssues?.map((li) => li.issueId) || [];
      setIssueSearchResults(
        (result.items || [])
          .filter((issue) => !alreadyLinkedIds.includes(issue.id))
          .map((issue) => ({
            id: issue.id,
            title: issue.title,
            status: issue.status,
          })),
      );
    } catch {
      toast.error("이슈 검색에 실패했습니다.");
    } finally {
      setIsSearchingIssue(false);
    }
  };

  const handleLinkIssue = (issueId: number) => {
    linkIssue(issueId, {
      onSuccess: () => {
        setIssueSearchResults((prev) => prev.filter((i) => i.id !== issueId));
      },
    });
  };

  const handleUnlinkIssue = async (linkId: number) => {
    const confirmed = await confirm({
      title: "이슈 연결 해제",
      description: "이 이슈와의 연결을 해제하시겠습니까?",
      confirmText: "해제",
      cancelText: "취소",
      variant: "destructive",
    });
    if (confirmed) {
      unlinkIssue(linkId);
    }
  };

  // ── 렌더링 ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) {
            setIsEditing(false);
          }
        }}
      >
        <FullscreenDialogContent>
          {isEditing ? (
            /* 수정 모드 (풀스크린) */
            <div ref={editPanelRef} className="p-6 overflow-y-auto h-full">
              <div className="flex justify-end gap-2 mb-4">
                <Button onClick={handleSave}>저장</Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
              </div>

              <div className="space-y-4">
                {/* 유형 / 상태 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      유형
                    </label>
                    <Select
                      value={formWorkType}
                      onValueChange={(v) => setFormWorkType(v as WorkType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map(
                          (t) => (
                            <SelectItem key={t} value={t}>
                              {WORK_TYPE_LABELS[t]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      상태
                    </label>
                    <Select
                      value={formStatus}
                      onValueChange={(v) => setFormStatus(v as WorkStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">진행 전</SelectItem>
                        <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
                        <SelectItem value="DONE">완료</SelectItem>
                        <SelectItem value="HOLD">보류</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 우선순위 / 담당자 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      우선순위
                    </label>
                    <Select
                      value={formPriority}
                      onValueChange={(v) =>
                        setFormPriority(v as WorkPriority)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">낮음</SelectItem>
                        <SelectItem value="MEDIUM">보통</SelectItem>
                        <SelectItem value="HIGH">높음</SelectItem>
                        <SelectItem value="CRITICAL">긴급</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      담당자
                    </label>
                    <Select
                      value={formAssigneeId?.toString() ?? "none"}
                      onValueChange={(v) =>
                        setFormAssigneeId(v === "none" ? null : Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="미지정" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">미지정</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            <span className="flex flex-col">
                              <span>{u.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {u.email}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 마감 일시 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">마감 일시</label>
                    <div className="flex gap-1 ml-auto">
                      {[1, 2, 3, 4, 5].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            now.setHours(now.getHours() + h, 0, 0, 0);
                            const pad = (n: number) =>
                              String(n).padStart(2, "0");
                            setFormDueDate(
                              `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`,
                            );
                          }}
                          className="px-1.5 py-0.5 text-xs rounded border border-input hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          +{h}h
                        </button>
                      ))}
                    </div>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-3 py-2 border border-input rounded-md text-sm text-left flex items-center gap-2 hover:bg-accent transition-colors"
                      >
                        <span
                          className={
                            formDueDate ? "" : "text-muted-foreground"
                          }
                        >
                          {formDueDate
                            ? (() => {
                                const d = new Date(formDueDate);
                                return isValid(d)
                                  ? format(d, "yyyy. MM. dd. HH:mm", {
                                      locale: ko,
                                    })
                                  : "날짜 선택";
                              })()
                            : "날짜 선택"}
                        </span>
                        {formDueDate && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormDueDate("");
                            }}
                            className="ml-auto text-muted-foreground hover:text-destructive text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <Calendar
                        mode="single"
                        selected={
                          formDueDate
                            ? (() => {
                                const d = new Date(formDueDate);
                                return isValid(d) ? d : undefined;
                              })()
                            : undefined
                        }
                        onSelect={(day: Date | undefined) => {
                          if (!day) return;
                          const existing = formDueDate
                            ? new Date(formDueDate)
                            : null;
                          const hh =
                            existing && isValid(existing)
                              ? existing.getHours()
                              : 9;
                          const mm =
                            existing && isValid(existing)
                              ? existing.getMinutes()
                              : 0;
                          const pad = (n: number) =>
                            String(n).padStart(2, "0");
                          setFormDueDate(
                            `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T${pad(hh)}:${pad(mm)}`,
                          );
                        }}
                        locale={ko}
                        initialFocus={false}
                      />
                      {(() => {
                        const d = formDueDate
                          ? new Date(formDueDate)
                          : null;
                        const curTime =
                          d && isValid(d)
                            ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
                            : "09:00";
                        return (
                          <FormTimeInput
                            value={curTime}
                            onCommit={(time) => {
                              const base = formDueDate
                                ? new Date(formDueDate)
                                : new Date();
                              if (!isValid(base)) return;
                              const [hh, mm] = time.split(":").map(Number);
                              base.setHours(hh ?? 0, mm ?? 0, 0, 0);
                              const pad = (n: number) =>
                                String(n).padStart(2, "0");
                              setFormDueDate(
                                `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`,
                              );
                            }}
                          />
                        );
                      })()}
                      <div className="border-t px-3 py-2 flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          disabled={!formDueDate}
                          onClick={() => {
                            /* 이미 실시간 반영, 닫기만 */
                          }}
                        >
                          확인
                        </Button>
                        {formDueDate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => setFormDueDate("")}
                          >
                            제거
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 보상금 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    보상금 (원)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formPrize}
                    onChange={(e) =>
                      setFormPrize(Number(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    placeholder="0"
                  />
                </div>

                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    placeholder="업무 제목을 입력하세요"
                  />
                </div>

                {/* 내용 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    내용 *
                  </label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm"
                    placeholder="업무 내용을 입력하세요"
                  />
                </div>
              </div>
            </div>
          ) : workDetail ? (
            /* 조회 모드 — 좌우 분할 */
            <div className="flex h-full">
              {/* ── 왼쪽: 메인 업무 ── */}
              <div className="flex-1 min-w-0 overflow-y-auto border-r border-border">
                {/* 헤더 */}
                <div className="flex justify-between items-center px-7 py-5 border-b border-border">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {workDetail.title}
                    </h2>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      <span>#{workDetail.id}</span>
                      <span>•</span>
                      <span>{workDetail.reporterName}</span>
                      <span>•</span>
                      <span>
                        {new Date(workDetail.createdAt).toLocaleDateString(
                          "ko-KR",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 ml-4">
                    <button onClick={handleEdit} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                      수정
                    </button>
                    <button onClick={handleDelete} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                    <button onClick={() => onOpenChange(false)} className="inline-flex items-center px-2 py-1.5 rounded-md border border-border hover:bg-accent transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="px-7 py-7">
                  {/* 기본 정보 테이블 */}
                  <div className="border rounded-lg overflow-hidden mb-7">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="bg-muted px-4 py-2 font-medium w-28">
                            유형
                          </td>
                          <td className="px-4 py-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Badge
                                  className={`cursor-pointer ${WORK_TYPE_COLORS[workDetail.workType]}`}
                                >
                                  {WORK_TYPE_LABELS[workDetail.workType]}
                                </Badge>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-2">
                                <div className="space-y-1">
                                  {(
                                    Object.keys(
                                      WORK_TYPE_LABELS,
                                    ) as WorkType[]
                                  ).map((type) => (
                                    <div
                                      key={type}
                                      className={`px-3 py-2 rounded cursor-pointer hover:bg-accent ${
                                        type === workDetail.workType
                                          ? "bg-accent"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleWorkTypeChange(type)
                                      }
                                    >
                                      {WORK_TYPE_LABELS[type]}
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="bg-muted px-4 py-2 font-medium w-28">
                            요청자
                          </td>
                          <td className="px-4 py-2">
                            {workDetail.reporterName}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="bg-muted px-4 py-2 font-medium">
                            상태
                          </td>
                          <td className="px-4 py-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Badge
                                  className={`cursor-pointer ${STATUS_COLORS[workDetail.status]}`}
                                >
                                  {STATUS_LABELS[workDetail.status]}
                                </Badge>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-2">
                                <div className="space-y-1">
                                  {(
                                    [
                                      "TODO",
                                      "IN_PROGRESS",
                                      "DONE",
                                      "HOLD",
                                    ] as WorkStatus[]
                                  ).map((status) => (
                                    <div
                                      key={status}
                                      className={`px-3 py-2 rounded cursor-pointer hover:bg-accent ${
                                        status === workDetail.status
                                          ? "bg-accent"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleStatusChange(status)
                                      }
                                    >
                                      {STATUS_LABELS[status]}
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="bg-muted px-4 py-2 font-medium">
                            우선순위
                          </td>
                          <td className="px-4 py-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Badge
                                  className={`cursor-pointer ${PRIORITY_COLORS[workDetail.priority]}`}
                                >
                                  {PRIORITY_LABELS[workDetail.priority]}
                                </Badge>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-2">
                                <div className="space-y-1">
                                  {(
                                    [
                                      "CRITICAL",
                                      "HIGH",
                                      "MEDIUM",
                                      "LOW",
                                    ] as WorkPriority[]
                                  ).map((priority) => (
                                    <div
                                      key={priority}
                                      className={`px-3 py-2 rounded cursor-pointer hover:bg-accent ${
                                        priority === workDetail.priority
                                          ? "bg-accent"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handlePriorityChange(priority)
                                      }
                                    >
                                      {PRIORITY_LABELS[priority]}
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="bg-muted px-4 py-2 font-medium">
                            담당자
                          </td>
                          <td className="px-4 py-2">
                            {workDetail.assigneeName || (
                              <span className="text-muted-foreground">
                                미지정
                              </span>
                            )}
                          </td>
                          <td className="bg-muted px-4 py-2 font-medium">
                            마감 일시
                          </td>
                          <td className="px-4 py-2">
                            {workDetail.dueDate ? (
                              <span
                                className={
                                  new Date(workDetail.dueDate) < new Date()
                                    ? "text-red-600 font-medium"
                                    : ""
                                }
                              >
                                {new Date(
                                  workDetail.dueDate,
                                ).toLocaleString("ko-KR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="bg-muted px-4 py-2 font-medium">
                            작성일
                          </td>
                          <td className="px-4 py-2">
                            {new Date(
                              workDetail.createdAt,
                            ).toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}{" "}
                            {new Date(
                              workDetail.createdAt,
                            ).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </td>
                          <td className="bg-muted px-4 py-2 font-medium">
                            수정일
                          </td>
                          <td className="px-4 py-2">
                            {new Date(
                              workDetail.updatedAt,
                            ).toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}{" "}
                            {new Date(
                              workDetail.updatedAt,
                            ).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 첨부 파일 탭 섹션 */}
                  <div
                    className="border rounded-lg overflow-hidden mb-7"
                    onPaste={handlePaste}
                  >
                    <div className="bg-muted/30 border-b px-4 py-1.5">
                      <span className="font-bold text-sm">첨부 파일</span>
                    </div>
                    <div className="p-2">
                      <Tabs defaultValue="images" className="w-full">
                        <TabsList className="mb-3 flex-wrap h-auto gap-1">
                          <TabsTrigger value="images">
                            이미지
                            {workImages &&
                              workImages.filter(
                                (img) =>
                                  img.fileType === "image" || !img.fileType,
                              ).length > 0 && (
                                <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  {
                                    workImages.filter(
                                      (img) =>
                                        img.fileType === "image" ||
                                        !img.fileType,
                                    ).length
                                  }
                                </span>
                              )}
                          </TabsTrigger>
                          <TabsTrigger value="mindmaps">
                            마인드맵
                            {mindmaps && mindmaps.length > 0 && (
                              <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                {mindmaps.length}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="dbtables">
                            DB 테이블
                            {dbTables && dbTables.length > 0 && (
                              <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                {dbTables.length}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="figmas">
                            피그마
                            {figmas && figmas.length > 0 && (
                              <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                {figmas.length}
                              </span>
                            )}
                          </TabsTrigger>
                        </TabsList>

                        {/* 이미지 탭 */}
                        <TabsContent value="images">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm">
                              이미지 첨부
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                imageInputRef.current?.click()
                              }
                              disabled={isUploading}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {isUploading ? "업로드 중..." : "이미지 추가"}
                            </Button>
                            <input
                              ref={imageInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) =>
                                e.target.files &&
                                handleImageUpload(e.target.files)
                              }
                            />
                          </div>

                          <div
                            ref={uploadAreaRef}
                            tabIndex={0}
                            className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer outline-none ${
                              isPasteMode
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                : isDragging
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                            }`}
                            onClick={handleUploadAreaClick}
                            onBlur={handleUploadAreaBlur}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            {workImages &&
                            workImages.filter(
                              (img) =>
                                img.fileType === "image" || !img.fileType,
                            ).length > 0 ? (
                              <div className="grid grid-cols-3 gap-2">
                                {workImages
                                  .filter(
                                    (img) =>
                                      img.fileType === "image" ||
                                      !img.fileType,
                                  )
                                  .map((image) => (
                                    <div
                                      key={image.id}
                                      className="relative group aspect-square rounded overflow-hidden border bg-muted"
                                    >
                                      <img
                                        src={image.url}
                                        alt={image.filename}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() =>
                                          window.open(image.url, "_blank")
                                        }
                                      />
                                      <button
                                        onClick={() =>
                                          deleteImage(image.id)
                                        }
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center transition-opacity leading-none"
                                      >
                                        ✕
                                      </button>
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                        {image.filename}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                {isPasteMode ? (
                                  <p className="text-sm text-primary font-medium">
                                    Ctrl+V로 이미지를 붙여넣으세요
                                  </p>
                                ) : (
                                  <p className="text-sm">
                                    이미지를 드래그하여 놓거나, 클릭하여
                                    활성화 후 Ctrl+V로 붙여넣으세요
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* 마인드맵 탭 */}
                        <TabsContent value="mindmaps">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm">
                              마인드맵 (MMD)
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenMindmapDialog()}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              마인드맵 추가
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {mindmaps && mindmaps.length > 0 ? (
                              mindmaps.map((mindmap) => (
                                <div
                                  key={mindmap.id}
                                  className="flex items-center justify-between p-3 border rounded hover:bg-accent group"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      {mindmap.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 opacity-0 group-hover:opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenMindmapDialog(mindmap.id);
                                      }}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMindmap(mindmap.id);
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2"
                                      onClick={() =>
                                        handleViewMindmap(mindmap.id)
                                      }
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  마인드맵을 추가하세요
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* DB 테이블 탭 */}
                        <TabsContent value="dbtables">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm">
                              DB 테이블 정보
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDbTableDialog()}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              테이블 정보 추가
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {dbTables && dbTables.length > 0 ? (
                              dbTables.map((dbTable) => {
                                const content = parseDbTableContent(
                                  dbTable.tableInfo,
                                );
                                return (
                                  <div
                                    key={dbTable.id}
                                    className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <div className="bg-muted px-4 py-3 border-b flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Database className="w-5 h-5 text-blue-600" />
                                        <div>
                                          <h4 className="font-semibold text-base">
                                            {content.tableName}
                                          </h4>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            {content.schema && (
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                {content.schema}
                                              </span>
                                            )}
                                            {content.category && (
                                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                                {content.category}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleOpenDbTableDialog(
                                              dbTable.id,
                                            )
                                          }
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleDeleteDbTable(dbTable.id)
                                          }
                                        >
                                          <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>

                                    {content.description && (
                                      <div className="px-4 py-2 bg-blue-50 border-b text-sm text-blue-900">
                                        {content.description}
                                      </div>
                                    )}

                                    {content.columns &&
                                    content.columns.length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-700 text-white">
                                            <tr>
                                              <th className="px-3 py-2 text-left">
                                                column_name
                                              </th>
                                              <th className="px-3 py-2 text-left">
                                                data_type
                                              </th>
                                              <th className="px-3 py-2 text-center w-20">
                                                nullable
                                              </th>
                                              <th className="px-3 py-2 text-center w-12">
                                                pk
                                              </th>
                                              <th className="px-3 py-2 text-center w-12">
                                                fk
                                              </th>
                                              <th className="px-3 py-2 text-center w-16">
                                                unique_key
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {content.columns.map(
                                              (col, idx) => (
                                                <tr
                                                  key={idx}
                                                  className={`border-t hover:bg-blue-50 ${col.pk === "PK" ? "bg-amber-50" : ""}`}
                                                >
                                                  <td className="px-3 py-2 font-medium font-mono text-sm">
                                                    {col.column_name}
                                                  </td>
                                                  <td className="px-3 py-2 font-mono text-xs text-blue-600">
                                                    {col.data_type}
                                                  </td>
                                                  <td className="px-3 py-2 text-center text-muted-foreground">
                                                    {col.nullable}
                                                  </td>
                                                  <td className="px-3 py-2 text-center">
                                                    {col.pk === "PK" && (
                                                      <span className="text-amber-600">
                                                        ✓
                                                      </span>
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2 text-center">
                                                    {col.fk === "FK" && (
                                                      <span className="text-green-600">
                                                        ✓
                                                      </span>
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-2 text-center">
                                                    {col.unique_key ===
                                                      "UQ" && (
                                                      <span className="text-purple-600">
                                                        ✓
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ),
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <div className="p-4">
                                        <pre className="bg-muted border rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">
                                          {content.queryResult}
                                        </pre>
                                      </div>
                                    )}

                                    <div className="px-4 py-2 bg-muted border-t text-xs text-muted-foreground">
                                      {content.columns.length > 0
                                        ? `${content.columns.length}개 컬럼`
                                        : "원본 데이터"}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  DB 테이블 정보를 추가하세요
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* 피그마 탭 */}
                        <TabsContent value="figmas">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm">
                              피그마 링크
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenFigmaDialog()}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              피그마 추가
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {figmas && figmas.length > 0 ? (
                              figmas.map((figma) => (
                                <div
                                  key={figma.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent group"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <svg
                                      className="w-5 h-5 flex-shrink-0"
                                      viewBox="0 0 38 57"
                                      fill="none"
                                    >
                                      <path
                                        d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z"
                                        fill="#1ABCFE"
                                      />
                                      <path
                                        d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z"
                                        fill="#0ACF83"
                                      />
                                      <path
                                        d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19z"
                                        fill="#FF7262"
                                      />
                                      <path
                                        d="M0 9.5a9.5 9.5 0 0 0 9.5 9.5H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"
                                        fill="#F24E1E"
                                      />
                                      <path
                                        d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"
                                        fill="#A259FF"
                                      />
                                    </svg>
                                    <div className="min-w-0">
                                      <a
                                        href={figma.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-sm hover:text-primary hover:underline truncate block"
                                      >
                                        {figma.title}
                                      </a>
                                      {figma.description && (
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                          {figma.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground/60 truncate">
                                        {figma.url}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      onClick={() =>
                                        handleOpenFigmaDialog(figma.id)
                                      }
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 hover:bg-destructive/10"
                                      onClick={() =>
                                        handleDeleteFigma(figma.id)
                                      }
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                    </Button>
                                    <a
                                      href={figma.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <svg
                                  className="w-12 h-12 mx-auto mb-2 opacity-30"
                                  viewBox="0 0 38 57"
                                  fill="none"
                                >
                                  <path
                                    d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M0 9.5a9.5 9.5 0 0 0 9.5 9.5H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"
                                    fill="currentColor"
                                  />
                                </svg>
                                <p className="text-sm">
                                  피그마 링크를 추가하세요
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* 부가 업무 탭 */}
                        <TabsContent value="linkedissues">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm">
                              부가 업무
                            </h3>
                          </div>

                          {/* 이슈 검색 */}
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={issueSearchKeyword}
                              onChange={(e) =>
                                setIssueSearchKeyword(e.target.value)
                              }
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleIssueSearch()
                              }
                              placeholder="이슈 제목으로 검색..."
                              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleIssueSearch}
                              disabled={isSearchingIssue}
                            >
                              <Link className="w-4 h-4 mr-1" />
                              {isSearchingIssue
                                ? "검색 중..."
                                : "이슈 검색"}
                            </Button>
                          </div>

                          {/* 검색 결과 */}
                          {issueSearchResults.length > 0 && (
                            <div className="mb-4 border rounded-md overflow-hidden">
                              <div className="bg-muted px-3 py-2 border-b text-xs font-medium text-muted-foreground">
                                검색 결과 — 클릭하여 연결
                              </div>
                              <div className="divide-y max-h-48 overflow-y-auto">
                                {issueSearchResults.map((issue) => (
                                  <div
                                    key={issue.id}
                                    className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer"
                                    onClick={() =>
                                      handleLinkIssue(issue.id)
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={`text-xs ${ISSUE_STATUS_COLORS[issue.status] || "bg-gray-100 text-gray-600"}`}
                                      >
                                        {ISSUE_STATUS_LABELS[
                                          issue.status
                                        ] || issue.status}
                                      </Badge>
                                      <span className="text-sm">
                                        <span className="text-muted-foreground mr-1">
                                          #{issue.id}
                                        </span>
                                        {issue.title}
                                      </span>
                                    </div>
                                    <Link className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 연결된 이슈 목록 */}
                          <div className="space-y-2">
                            {linkedIssues && linkedIssues.length > 0 ? (
                              linkedIssues.map((linked) => (
                                <div
                                  key={linked.id}
                                  className="flex items-center justify-between p-3 border rounded-md hover:bg-accent group"
                                >
                                  <div className="flex items-center gap-2 flex-1 cursor-pointer">
                                    <Badge
                                      className={`text-xs flex-shrink-0 ${
                                        ISSUE_STATUS_COLORS[
                                          linked.issueStatus
                                        ] || "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {ISSUE_STATUS_LABELS[
                                        linked.issueStatus
                                      ] || linked.issueStatus}
                                    </Badge>
                                    <span className="text-sm hover:underline">
                                      <span className="text-muted-foreground mr-1">
                                        #{linked.issueId}
                                      </span>
                                      {linked.issueTitle}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 h-7 px-2 hover:bg-destructive/10"
                                    onClick={() =>
                                      handleUnlinkIssue(linked.id)
                                    }
                                    title="연결 해제"
                                  >
                                    <Unlink className="w-3.5 h-3.5 text-destructive" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <ChevronRight className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">
                                  연결된 이슈가 없습니다
                                </p>
                                <p className="text-xs mt-1">
                                  위에서 이슈를 검색하여 연결하세요
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="border rounded-lg overflow-hidden mb-7">
                    <div className="bg-muted/30 border-b px-4 py-1.5 flex items-center justify-between">
                      <span className="font-bold text-sm">내용</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        편집
                      </Button>
                    </div>
                    <div className="p-3 whitespace-pre-wrap text-sm min-h-[60px]">
                      {workDetail.content || (
                        <span className="text-muted-foreground">
                          내용이 없습니다.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 체크리스트 */}
                  <div className="border rounded-lg overflow-hidden mb-7">
                    <div className="bg-muted/30 border-b px-4 py-1.5">
                      <span className="font-bold text-sm">
                        체크리스트
                        {checklists && checklists.length > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            {checklists.filter((c) => c.checked).length}/
                            {checklists.length} 완료
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="space-y-1.5 mb-3">
                        {checklists && checklists.length > 0
                          ? checklists.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 p-2 hover:bg-accent rounded group"
                              >
                                <Checkbox
                                  checked={item.checked}
                                  onCheckedChange={() =>
                                    toggleChecklist(item.id)
                                  }
                                />
                                <span
                                  className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {item.content}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                                  onClick={() =>
                                    handleDeleteChecklistItem(item.id)
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                            ))
                          : null}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newChecklistContent}
                          onChange={(e) =>
                            setNewChecklistContent(e.target.value)
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddChecklist()
                          }
                          placeholder="새 항목 추가..."
                          className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                        />
                        <Button size="sm" onClick={handleAddChecklist}>
                          <Plus className="w-4 h-4 mr-1" />
                          추가
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 컨텐츠 영역 끝 */}
              </div>
              {/* ── 왼쪽 끝 ── */}

              {/* ── 오른쪽: 부가 업무 + 채팅 ── */}
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-l border-border">
                {/* 부가 업무 섹션 */}
                <div
                  className="flex flex-col overflow-hidden border-b border-border"
                  style={{ maxHeight: "45%" }}
                >
                  <div className="px-5 py-5 overflow-y-auto flex-1">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/30 border-b px-4 py-1.5 flex items-center justify-between">
                        <span className="font-bold text-sm">부가 업무</span>
                      </div>
                      <div className="p-3">
                        <SubWorkSection workId={workDetail.id} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 채팅 */}
                <div className="flex-1 overflow-hidden flex flex-col px-5 pt-5 pb-0">
                  <div className="border rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
                    <WorkChatPanel workId={workDetail.id} />
                  </div>
                </div>
              </div>
              {/* ── 오른쪽 끝 ── */}
            </div>
          ) : (
            /* 선택 안됨 */
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <p>업무를 선택하세요.</p>
            </div>
          )}
        </FullscreenDialogContent>
      </Dialog>

      <ConfirmDialog />

      {/* 피그마 다이얼로그 */}
      <Dialog open={isFigmaDialogOpen} onOpenChange={setIsFigmaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedFigmaId ? "피그마 수정" : "피그마 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                제목 *
              </label>
              <input
                type="text"
                value={figmaTitle}
                onChange={(e) => setFigmaTitle(e.target.value)}
                placeholder="피그마 화면 제목"
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Figma URL *
              </label>
              <input
                type="url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                설명 (선택)
              </label>
              <textarea
                value={figmaDescription}
                onChange={(e) => setFigmaDescription(e.target.value)}
                placeholder="간단한 설명"
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFigmaDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSaveFigma}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mermaid 다이어그램 작성/편집 다이얼로그 */}
      <Dialog
        open={isMindmapDialogOpen}
        onOpenChange={setIsMindmapDialogOpen}
      >
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMindmapId
                ? "Mermaid 다이어그램 수정"
                : "Mermaid 다이어그램 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* 왼쪽: 입력 영역 */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  제목
                </label>
                <input
                  type="text"
                  value={mindmapTitle}
                  onChange={(e) => setMindmapTitle(e.target.value)}
                  placeholder="다이어그램 제목 입력"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Mermaid 코드
                    <span className="text-muted-foreground font-normal ml-2">
                      (실시간 미리보기로 확인하세요)
                    </span>
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleValidateMermaid}
                    className="h-7"
                  >
                    문법 검증
                  </Button>
                </div>

                {validationResult && (
                  <div
                    className={`mb-2 p-2 rounded-md text-sm ${
                      validationResult.isValid
                        ? "bg-green-50 border border-green-300 text-green-800"
                        : "bg-red-50 border border-red-300 text-red-800"
                    }`}
                  >
                    {validationResult.isValid ? (
                      <p className="flex items-center gap-1">
                        <span className="font-semibold">
                          문법이 올바릅니다
                        </span>
                      </p>
                    ) : (
                      <div>
                        <p className="font-semibold mb-1">문법 오류</p>
                        <pre className="text-xs whitespace-pre-wrap">
                          {validationResult.error}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  value={mindmapContent}
                  onChange={(e) => {
                    setMindmapContent(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder={`sequenceDiagram\n    actor User as 사용자\n    participant FE as Frontend\n    User->>FE: 요청`}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm font-mono"
                  rows={20}
                />
              </div>
            </div>

            {/* 오른쪽: 실시간 미리보기 */}
            <div className="space-y-2">
              <label className="text-sm font-medium block">미리보기</label>
              <div
                className="border rounded-md p-4 bg-muted/30 overflow-auto"
                style={{ height: "calc(100% - 30px)" }}
              >
                {mindmapContent.trim() ? (
                  <Mermaid
                    chart={mindmapContent}
                    className="mermaid-preview"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    왼쪽에 Mermaid 코드를 입력하면 여기에 다이어그램이
                    표시됩니다
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMindmapDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSaveMindmap}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mermaid 다이어그램 보기 다이얼로그 */}
      <Dialog
        open={isMindmapViewDialogOpen}
        onOpenChange={setIsMindmapViewDialogOpen}
      >
        <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {viewMindmapData?.title || "Mermaid 다이어그램"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-md p-4 bg-muted/30">
            {viewMindmapData?.content ? (
              <Mermaid
                chart={viewMindmapData.content}
                className="mermaid-view"
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">
                다이어그램 데이터가 없습니다
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsMindmapViewDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DB 테이블 작성/편집 다이얼로그 */}
      <Dialog
        open={isDbTableDialogOpen}
        onOpenChange={setIsDbTableDialogOpen}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedDbTableId
                ? "DB 테이블 정보 수정"
                : "DB 테이블 정보 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">
                  테이블명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dbTableContent.tableName}
                  onChange={(e) =>
                    setDbTableContent((prev) => ({
                      ...prev,
                      tableName: e.target.value,
                    }))
                  }
                  placeholder="예: works, work_checklists"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  스키마
                </label>
                <input
                  type="text"
                  value={dbTableContent.schema}
                  onChange={(e) =>
                    setDbTableContent((prev) => ({
                      ...prev,
                      schema: e.target.value,
                    }))
                  }
                  placeholder="예: public"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  분류
                </label>
                <input
                  type="text"
                  value={dbTableContent.category}
                  onChange={(e) =>
                    setDbTableContent((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="예: 업무, 공통"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                테이블 설명
              </label>
              <input
                type="text"
                value={dbTableContent.description}
                onChange={(e) =>
                  setDbTableContent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="이 테이블이 무엇을 저장하는지 설명하세요"
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                쿼리 결과 <span className="text-red-500">*</span>
                <span className="text-muted-foreground font-normal ml-2">
                  (PostgreSQL 쿼리 결과를 그대로 붙여넣으세요)
                </span>
              </label>
              <textarea
                value={dbTableContent.queryResult}
                onChange={(e) =>
                  setDbTableContent((prev) => ({
                    ...prev,
                    queryResult: e.target.value,
                  }))
                }
                placeholder={`column_name\tdata_type\tnullable\tpk\tfk\tunique_key\nid\tbigint\tNO\tPK\t\t\ntitle\tvarchar\tNO\t\t\t`}
                className="w-full px-3 py-2 border border-input rounded-md text-sm font-mono"
                rows={8}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                DBeaver에서 PostgreSQL 쿼리 결과를 복사해서 붙여넣으세요
              </p>
            </div>

            {/* 파싱 미리보기 */}
            {dbTableContent.queryResult &&
              (() => {
                const previewColumns = parseTsvToColumns(
                  dbTableContent.queryResult,
                );
                return previewColumns.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-3 py-2 border-b">
                      <h4 className="text-sm font-semibold">미리보기</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-700 text-white">
                          <tr>
                            <th className="px-3 py-2 text-left">
                              column_name
                            </th>
                            <th className="px-3 py-2 text-left">
                              data_type
                            </th>
                            <th className="px-3 py-2 text-center w-20">
                              nullable
                            </th>
                            <th className="px-3 py-2 text-center w-12">
                              pk
                            </th>
                            <th className="px-3 py-2 text-center w-12">
                              fk
                            </th>
                            <th className="px-3 py-2 text-center w-16">
                              unique_key
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewColumns.map((col, idx) => (
                            <tr
                              key={idx}
                              className={`border-t ${col.pk === "PK" ? "bg-amber-50" : ""}`}
                            >
                              <td className="px-3 py-2 font-medium font-mono text-sm">
                                {col.column_name}
                              </td>
                              <td className="px-3 py-2 font-mono text-xs text-blue-600">
                                {col.data_type}
                              </td>
                              <td className="px-3 py-2 text-center text-muted-foreground">
                                {col.nullable}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {col.pk === "PK" && (
                                  <span className="text-amber-600">✓</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {col.fk === "FK" && (
                                  <span className="text-green-600">✓</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {col.unique_key === "UQ" && (
                                  <span className="text-purple-600">✓</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-3 py-2 bg-muted border-t text-xs text-muted-foreground">
                      {previewColumns.length}개 컬럼 감지됨
                    </div>
                  </div>
                ) : null;
              })()}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDbTableDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSaveDbTable}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
