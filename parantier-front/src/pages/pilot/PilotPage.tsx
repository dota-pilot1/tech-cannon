import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { WorkChatPanel } from "@/features/work/components/WorkChatPanel"; // 채팅 패널 재사용
import { cn } from "@/shared/lib/utils";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellStyle,
  RowDragEndEvent,
  IRowNode,
  CellValueChangedEvent,
  ICellRendererParams,
  RowClickedEvent,
} from "ag-grid-community";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from "ag-grid-community";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Checkbox } from "@/shared/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  usePilots as useWorks,
  usePilot as useWork,
  useCreatePilot as useCreateWork,
  useUpdatePilot as useUpdateWork,
  useDeletePilot as useDeleteWork,
  useUpdatePilotStatus as useUpdateWorkStatus,
  useCreatePilotSilent as useCreateWorkSilent,
  useUpdatePilotSilent as useUpdateWorkSilent,
} from "@/features/pilot/hooks/usePilots";
import {
  usePilotImages as useWorkImages,
  useUploadPilotImage as useUploadWorkImage,
  useDeletePilotImage as useDeleteWorkImage,
} from "@/features/pilot/hooks/usePilotImages";
import {
  usePilotChecklists as useWorkChecklists,
  useCreatePilotChecklist as useCreateWorkChecklist,
  useTogglePilotChecklist as useToggleWorkChecklist,
  useDeletePilotChecklist as useDeleteWorkChecklist,
} from "@/features/pilot/hooks/usePilotChecklists";
import {
  usePilotMindmaps as useWorkMindmaps,
  useCreatePilotMindmap as useCreateWorkMindmap,
  useUpdatePilotMindmap as useUpdateWorkMindmap,
  useDeletePilotMindmap as useDeleteWorkMindmap,
} from "@/features/pilot/hooks/usePilotMindmaps";
import {
  usePilotDbTables as useWorkDbTables,
  useCreatePilotDbTable as useCreateWorkDbTable,
  useUpdatePilotDbTable as useUpdateWorkDbTable,
  useDeletePilotDbTable as useDeleteWorkDbTable,
} from "@/features/pilot/hooks/usePilotDbTables";
import {
  usePilotFigmas as useWorkFigmas,
  useCreatePilotFigma as useCreateWorkFigma,
  useUpdatePilotFigma as useUpdateWorkFigma,
  useDeletePilotFigma as useDeleteWorkFigma,
} from "@/features/pilot/hooks/usePilotFigmas";
import {
  useWorkLinkedIssues,
  useLinkIssue,
  useUnlinkIssue,
} from "@/features/work/hooks/useWorkLinkedIssues";
import { pilotApi as workApi } from "@/entities/pilot/api/pilotApi";
import { issueApi } from "@/entities/issue/api/issueApi";
import type {
  Pilot as Work,
  PilotStatus as WorkStatus,
  PilotPriority as WorkPriority,
} from "@/entities/pilot/types/pilot";
import type { DbTableContent } from "@/entities/pilot/types/pilotDbTable";
import {
  parseDbTableContent,
  parseTsvToColumns,
} from "@/entities/pilot/types/pilotDbTable";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  ChevronRight,
  FileText,
  Database,
  Eye,
  Link,
  Unlink,
  ExternalLink,
} from "lucide-react";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { toast } from "sonner";
import { Mermaid } from "@/shared/ui/mermaid";
import { useUsers } from "@/features/admin/hooks/useUsers";
import mermaid from "mermaid";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { useNavigate } from "@tanstack/react-router";

// AG-Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

// ─── 상수 ────────────────────────────────────────────────────────────────────

const WORK_TYPE_LABELS: Record<string, string> = {
  FEATURE: "기능개발",
  QA: "QA",
  COMMON: "일반",
};

const WORK_TYPE_COLORS: Record<string, string> = {
  FEATURE: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  QA: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  COMMON: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

const STATUS_LABELS: Record<WorkStatus, string> = {
  TODO: "진행 전",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
  HOLD: "보류",
};

const STATUS_COLORS: Record<WorkStatus, string> = {
  TODO: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  IN_PROGRESS: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  DONE: "bg-green-100 text-green-700 hover:bg-green-100",
  HOLD: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
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

// ─── Page Component ───────────────────────────────────────────────────────────

export function PilotPage() {
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const currentUser = useStore(authStore, (state) => state.user);

  // 상태 관리
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const editPanelRef = useRef<HTMLDivElement>(null);

  // 수정된 행 추적
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<number>>(new Set());

  // 필터 상태
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterstring, setFilterstring] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isBackupTab, setIsBackupTab] = useState(false);

  // 폼 데이터
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formstring, setFormstring] = useState<string>("COMMON");
  const [formStatus, setFormStatus] = useState<WorkStatus>("TODO");
  const [formPriority, setFormPriority] = useState<WorkPriority>("MEDIUM");
  const [formAssigneeId, setFormAssigneeId] = useState<number | null>(null);
  const [formDueDate, setFormDueDate] = useState<string>("");

  // API 호출
  const { data: pilotsData } = useWorks({
    topic: filterstring === "ALL" ? undefined : (filterstring as string),
    keyword: searchKeyword || undefined,
    sortBy: "created",
    isArchived: isBackupTab ? true : false,
  });

  const { data: pilotDetail } = useWork(selectedWorkId!, {
    enabled: !!selectedWorkId && !isEditing,
  });

  const queryClient = useQueryClient();

  const reorderMutation = useMutation({
    mutationFn: (items: { id: number; orderNum: number }[]) =>
      workApi.reorderPilots(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      toast.success("순서가 저장되었습니다", { position: "bottom-right" });
    },
    onError: () =>
      toast.error("순서 변경에 실패했습니다", { position: "bottom-right" }),
  });

  const archiveMutation = useMutation({
    mutationFn: (ids: number[]) => workApi.archivePilots(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      toast.success("백업 완료", { position: "bottom-right" });
      setSelectedWorkId(null);
    },
    onError: () => toast.error("백업 실패", { position: "bottom-right" }),
  });

  const restoreMutation = useMutation({
    mutationFn: (ids: number[]) => workApi.restorePilots(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      toast.success("복원 완료", { position: "bottom-right" });
      setSelectedWorkId(null);
    },
    onError: () => toast.error("복원 실패", { position: "bottom-right" }),
  });

  const { mutate: createWork } = useCreateWork();
  const { mutate: updateWork } = useUpdateWork();
  const { mutate: deleteWork } = useDeleteWork();
  const { mutate: updateStatus } = useUpdateWorkStatus();

  const { mutateAsync: createWorkSilent } = useCreateWorkSilent();
  const { mutateAsync: updateWorkSilent } = useUpdateWorkSilent();
  const { confirm, ConfirmDialog } = useConfirm();

  // 사용자 목록
  const { data: usersData } = useUsers();
  const users = usersData || [];

  // 이미지 관련
  const { data: pilotImages } = useWorkImages(selectedWorkId);
  const { mutate: uploadImage, isPending: isUploading } = useUploadWorkImage(
    selectedWorkId!,
  );
  const { mutate: deleteImage } = useDeleteWorkImage(selectedWorkId!);
  const [isDragging, setIsDragging] = useState(false);
  const [isPasteMode, setIsPasteMode] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // 체크리스트 관련
  const { data: checklists } = useWorkChecklists(selectedWorkId);
  const { mutate: createChecklist } = useCreateWorkChecklist(selectedWorkId!);
  const { mutate: toggleChecklist } = useToggleWorkChecklist(selectedWorkId!);
  const { mutate: deleteChecklist } = useDeleteWorkChecklist(selectedWorkId!);
  const [newChecklistContent, setNewChecklistContent] = useState("");

  // 마인드맵 관련
  const { data: mindmaps } = useWorkMindmaps(selectedWorkId);
  const { mutate: createMindmap } = useCreateWorkMindmap(selectedWorkId!);
  const { mutate: updateMindmap } = useUpdateWorkMindmap(selectedWorkId!);
  const { mutate: deleteMindmap } = useDeleteWorkMindmap(selectedWorkId!);
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
  const { data: dbTables } = useWorkDbTables(selectedWorkId);
  const { mutate: createDbTable } = useCreateWorkDbTable(selectedWorkId!);
  const { mutate: updateDbTable } = useUpdateWorkDbTable(selectedWorkId!);
  const { mutate: deleteDbTable } = useDeleteWorkDbTable(selectedWorkId!);
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
  const { data: figmas } = useWorkFigmas(selectedWorkId);
  const { mutate: createFigma } = useCreateWorkFigma(selectedWorkId!);
  const { mutate: updateFigma } = useUpdateWorkFigma(selectedWorkId!);
  const { mutate: deleteFigma } = useDeleteWorkFigma(selectedWorkId!);
  const [isFigmaDialogOpen, setIsFigmaDialogOpen] = useState(false);
  const [selectedFigmaId, setSelectedFigmaId] = useState<number | null>(null);
  const [figmaTitle, setFigmaTitle] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [figmaDescription, setFigmaDescription] = useState("");

  // 연결 이슈 관련
  const { data: linkedIssues } = useWorkLinkedIssues(selectedWorkId);
  const { mutate: linkIssue } = useLinkIssue(selectedWorkId!);
  const { mutate: unlinkIssue } = useUnlinkIssue(selectedWorkId!);
  const [issueSearchKeyword, setIssueSearchKeyword] = useState("");
  const [issueSearchResults, setIssueSearchResults] = useState<
    { id: number; title: string; status: string }[]
  >([]);
  const [isSearchingIssue, setIsSearchingIssue] = useState(false);

  // 필터링된 업무 목록
  const works = useMemo(() => {
    let allWorks = pilotsData?.items || [];
    if (filterStatus !== "ALL") {
      allWorks = allWorks.filter((work) => work.status === filterStatus);
    }
    if (filterPriority !== "ALL") {
      allWorks = allWorks.filter((work) => work.priority === filterPriority);
    }
    return allWorks;
  }, [pilotsData, filterStatus, filterPriority]);

  // 우선순위별 카운트 (필터 적용 전 전체 기준)
  const priorityCounts = useMemo(() => {
    const allWorks = pilotsData?.items || [];
    return {
      CRITICAL: allWorks.filter((w) => w.priority === "CRITICAL").length,
      HIGH: allWorks.filter((w) => w.priority === "HIGH").length,
      MEDIUM: allWorks.filter((w) => w.priority === "MEDIUM").length,
      LOW: allWorks.filter((w) => w.priority === "LOW").length,
      ALL: allWorks.length,
    };
  }, [pilotsData]);

  // AG-Grid 한국어 로케일
  const localeText = useMemo(
    () => ({
      page: "페이지",
      of: "/",
      to: "-",
      pageSizeSelectorLabel: "페이지당",
      pageSizeSelectorLabelText: "행",
    }),
    [],
  );

  // 셀 값 변경 핸들러
  const onCellValueChanged = (params: CellValueChangedEvent<Work>) => {
    const { data, newValue, oldValue, colDef } = params;
    if (newValue === oldValue) return;

    setModifiedRowIds((prev) => new Set(prev).add(data.id));
    params.node.setSelected(true);

    if (
      colDef.field === "status" ||
      colDef.field === "priority" ||
      colDef.field === "topic"
    ) {
      const allRowData: Work[] = [];
      params.api.forEachNode((node: IRowNode<Work>) => {
        if (node.data) allRowData.push(node.data);
      });
      const sortedData = allRowData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      params.api.setGridOption("rowData", sortedData);
    } else {
      params.api.refreshCells({ rowNodes: [params.node], force: true });
    }
  };

  // 새 행 추가
  const handleAddRow = () => {
    if (!currentUser) {
      toast.error("로그인이 필요합니다");
      navigate({ to: "/dashboard" });
      return;
    }

    const newRow: Partial<Work> = {
      id: -Date.now(),
      title: "",
      content: "",
      topic: "COMMON",
      status: "TODO",
      priority: "MEDIUM",
      reporterId: currentUser.id,
      reporterName: currentUser.username,
      assigneeName: "",
    };

    gridRef.current?.api.applyTransaction({
      add: [newRow as Work],
      addIndex: 0,
    });
    setModifiedRowIds((prev) => new Set(prev).add(newRow.id!));
  };

  // 선택된 행 삭제
  const handleDeleteSelected = async () => {
    const selectedRows = gridRef.current?.api.getSelectedRows() || [];

    if (selectedRows.length === 0) {
      toast.info("삭제할 행을 선택하세요.");
      return;
    }

    const confirmed = await confirm({
      title: "행 삭제",
      description: `선택한 ${selectedRows.length}개 행을 삭제하시겠습니까?`,
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });

    if (!confirmed) return;

    const existingWorks = selectedRows.filter((r) => r.id > 0);
    for (const row of existingWorks) {
      await deleteWork(row.id);
    }

    gridRef.current?.api.applyTransaction({ remove: selectedRows });

    const idsToRemove = selectedRows.map((r) => r.id);
    setModifiedRowIds((prev) => {
      const newSet = new Set(prev);
      idsToRemove.forEach((id) => newSet.delete(id));
      return newSet;
    });

    toast.success(`${selectedRows.length}개 항목이 삭제되었습니다.`);
  };

  const handleArchive = () => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() ?? [];
    const ids = selectedNodes.map((n: IRowNode<Work>) => n.data!.id);
    if (ids.length === 0) {
      toast.error("선택된 업무가 없습니다");
      return;
    }
    archiveMutation.mutate(ids);
  };

  const handleRestore = () => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() ?? [];
    const ids = selectedNodes.map((n: IRowNode<Work>) => n.data!.id);
    if (ids.length === 0) {
      toast.error("선택된 업무가 없습니다");
      return;
    }
    restoreMutation.mutate(ids);
  };

  // 수정/신규 행 일괄 저장
  const handleSaveModified = async () => {
    if (modifiedRowIds.size === 0) {
      toast.info("수정된 항목이 없습니다.");
      return;
    }

    const modifiedRows: Work[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (modifiedRowIds.has(node.data.id)) {
        modifiedRows.push(node.data);
      }
    });

    const newRows = modifiedRows.filter((r) => r.id < 0);
    const updatedRows = modifiedRows.filter((r) => r.id > 0);

    const invalidRows: string[] = [];
    modifiedRows.forEach((row) => {
      const missing: string[] = [];
      if (!row.title || row.title.trim() === "") missing.push("제목");
      if (!row.topic) missing.push("유형");
      if (!row.status) missing.push("상태");
      if (!row.priority) missing.push("우선순위");
      if (!row.reporterName || row.reporterName.trim() === "")
        missing.push("요청자");

      if (missing.length > 0) {
        const rowLabel =
          row.id < 0 ? "신규 행" : `"${row.title || "(제목 없음)"}"`;
        invalidRows.push(`${rowLabel}: ${missing.join(", ")} 필요`);
      }
    });

    if (invalidRows.length > 0) {
      const message = [
        "다음 항목에 필수 값이 누락되었습니다:",
        "",
        ...invalidRows.map((msg) => `• ${msg}`),
        "",
        "계속 진행하시겠습니까?",
      ].join("\n");

      const confirmed = await confirm({
        title: "필수 항목 누락",
        description: message,
        confirmText: "계속",
        cancelText: "취소",
      });

      if (!confirmed) return;
    }

    try {
      for (const row of newRows) {
        await createWorkSilent({
          title: row.title || "제목 없음",
          content: row.content || "",
          topic: row.topic || "COMMON",
          status: row.status || "TODO",
          priority: row.priority || "MEDIUM",
          assigneeId: row.assigneeId ?? null,
          dueDate: row.dueDate ?? null,
        });
      }

      for (const row of updatedRows) {
        await updateWorkSilent({
          id: row.id,
          request: {
            title: row.title,
            content: row.content,
            topic: row.topic,
            status: row.status,
            priority: row.priority,
            assigneeId: row.assigneeId ?? null,
            dueDate: row.dueDate ?? null,
          },
        });
      }

      if (newRows.length > 0) {
        gridRef.current?.api.applyTransaction({ remove: newRows });
      }

      setModifiedRowIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["works"] });

      toast.success(
        `신규 ${newRows.length}개, 수정 ${updatedRows.length}개 항목이 저장되었습니다.`,
      );
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const onRowDragEnd = useCallback(
    (event: RowDragEndEvent<Work>) => {
      const { api } = event;
      const reorderItems: { id: number; orderNum: number }[] = [];
      api.forEachNodeAfterFilterAndSort(
        (node: IRowNode<Work>, index: number) => {
          if (node.data) {
            reorderItems.push({ id: node.data.id, orderNum: index });
          }
        },
      );
      reorderMutation.mutate(reorderItems);
    },
    [reorderMutation],
  );

  // 컬럼 정의
  const columnDefs = useMemo<ColDef<Work>[]>(
    () => [
      {
        headerName: "",
        width: 52,
        maxWidth: 52,
        minWidth: 52,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        suppressMovable: true,
        suppressSizeToFit: true,
        resizable: false,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "8px",
          paddingRight: "4px",
        } as CellStyle,
      },
      {
        headerName: "No.",
        field: "id",
        width: 60,
        headerClass: "ag-header-cell-center",
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "#888",
        } as CellStyle,
        valueFormatter: (params) =>
          params.value > 0 ? `#${params.value}` : "NEW",
      },
      {
        headerName: "제목",
        field: "title",
        flex: 1,
        minWidth: 180,
        editable: true,
        rowDrag: true,
        cellStyle: {
          display: "flex",
          alignItems: "center",
          paddingLeft: "8px",
        } as CellStyle,
      },
      {
        headerName: "유형",
        field: "topic",
        width: 85,
        headerClass: "ag-header-cell-center",
        editable: false,
        cellRenderer: (params: ICellRendererParams<Work>) => {
          const topic = params.value as string;
          return (
            <div className="w-full h-full flex items-center px-2">
              <Badge
                variant="outline"
                className="text-xs font-medium max-w-full truncate"
              >
                {topic || "-"}
              </Badge>
            </div>
          );
        },
      },
      {
        headerName: "상태",
        field: "status",
        width: 85,
        headerClass: "ag-header-cell-center",
        editable: false,
        cellRenderer: (params: ICellRendererParams<Work>) => {
          const StatusCell = () => {
            const [open, setOpen] = useState(false);
            const status = params.value as WorkStatus;
            const label = STATUS_LABELS[status] || status;

            const handleStatusChange = (newStatus: WorkStatus) => {
              if (!params.data) return;
              params.data.status = newStatus;
              setModifiedRowIds((prev) => new Set(prev).add(params.data!.id));
              params.node?.setSelected(true);
              params.api.refreshCells({ rowNodes: [params.node], force: true });
              setOpen(false);
            };

            return (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="w-full h-full flex items-center justify-center cursor-pointer">
                    <Badge className={STATUS_COLORS[status]}>{label}</Badge>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-36 p-2" align="center">
                  <div className="flex flex-col gap-1">
                    {(
                      ["TODO", "IN_PROGRESS", "DONE", "HOLD"] as WorkStatus[]
                    ).map((s) => (
                      <Button
                        key={s}
                        variant={s === status ? "default" : "ghost"}
                        size="sm"
                        className="justify-start h-8"
                        onClick={() => handleStatusChange(s)}
                      >
                        {STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          };
          return <StatusCell />;
        },
      },
      {
        headerName: "우선순위",
        field: "priority",
        width: 80,
        headerClass: "ag-header-cell-center",
        editable: false,
        cellRenderer: (params: ICellRendererParams<Work>) => {
          const PriorityCell = () => {
            const [open, setOpen] = useState(false);
            const priority = params.value as WorkPriority;
            const label = PRIORITY_LABELS[priority] || priority;

            const handlePriorityChange = (newPriority: WorkPriority) => {
              if (!params.data) return;
              params.data.priority = newPriority;
              setModifiedRowIds((prev) => new Set(prev).add(params.data!.id));
              params.node?.setSelected(true);
              params.api.refreshCells({ rowNodes: [params.node], force: true });
              setOpen(false);
            };

            return (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="w-full h-full flex items-center justify-center cursor-pointer">
                    <Badge className={PRIORITY_COLORS[priority]}>{label}</Badge>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-2" align="center">
                  <div className="flex flex-col gap-1">
                    {(
                      ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as WorkPriority[]
                    ).map((p) => (
                      <Button
                        key={p}
                        variant={p === priority ? "default" : "ghost"}
                        size="sm"
                        className="justify-start h-8"
                        onClick={() => handlePriorityChange(p)}
                      >
                        {PRIORITY_LABELS[p]}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          };
          return <PriorityCell />;
        },
      },
      {
        headerName: "담당자",
        field: "assigneeName",
        width: 90,
        headerClass: "ag-header-cell-center",
        editable: false,
        cellRenderer: (params: ICellRendererParams<Work>) => {
          const AssigneeCell = () => {
            const [open, setOpen] = useState(false);
            const [keyword, setKeyword] = useState("");
            const currentAssigneeName = params.data?.assigneeName || "";
            const currentAssigneeId = params.data?.assigneeId ?? undefined;

            const filtered = users.filter((u) => {
              if (!keyword) return true;
              return (
                u.username.toLowerCase().includes(keyword.toLowerCase()) ||
                u.email.toLowerCase().includes(keyword.toLowerCase())
              );
            });

            const handleSelect = (
              userId: number | undefined,
              username: string | undefined,
            ) => {
              if (!params.data) return;
              params.data.assigneeId = userId ?? undefined;
              params.data.assigneeName = username ?? "";
              setModifiedRowIds((prev) => new Set(prev).add(params.data!.id));
              params.node?.setSelected(true);
              params.api.refreshCells({ rowNodes: [params.node], force: true });
              setOpen(false);
              setKeyword("");
            };

            return (
              <Popover
                open={open}
                onOpenChange={(v) => {
                  setOpen(v);
                  if (!v) setKeyword("");
                }}
              >
                <PopoverTrigger asChild>
                  <div className="w-full h-full flex items-center justify-center cursor-pointer hover:text-primary">
                    <span
                      className={
                        currentAssigneeName ? "" : "text-muted-foreground"
                      }
                    >
                      {currentAssigneeName || "미지정"}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2" align="center">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="이름 검색..."
                    className="w-full px-2 py-1 mb-2 border border-input rounded text-sm"
                    autoFocus
                  />
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    <Button
                      variant={
                        currentAssigneeId === undefined ? "default" : "ghost"
                      }
                      size="sm"
                      className="justify-start h-8 text-muted-foreground"
                      onClick={() => handleSelect(undefined, undefined)}
                    >
                      미지정
                    </Button>
                    {filtered.map((u) => (
                      <Button
                        key={u.id}
                        variant={
                          currentAssigneeId === u.id ? "default" : "ghost"
                        }
                        size="sm"
                        className="justify-start h-8"
                        onClick={() => handleSelect(u.id, u.username)}
                      >
                        {u.username}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          };
          return <AssigneeCell />;
        },
      },
      {
        headerName: "마감일",
        field: "dueDate",
        width: 105,
        headerClass: "ag-header-cell-center",
        editable: false,
        cellRenderer: (params: ICellRendererParams<Work>) => {
          const DueDateCell = () => {
            const [open, setOpen] = useState(false);
            const currentDueDate = params.data?.dueDate || "";
            const isOverdue = currentDueDate
              ? new Date(currentDueDate) < new Date(new Date().toDateString())
              : false;

            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (!params.data) return;
              const val = e.target.value || undefined;
              params.data.dueDate = val;
              setModifiedRowIds((prev) => new Set(prev).add(params.data!.id));
              params.node?.setSelected(true);
              params.api.refreshCells({ rowNodes: [params.node], force: true });
              setOpen(false);
            };

            const handleClear = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (!params.data) return;
              params.data.dueDate = undefined;
              setModifiedRowIds((prev) => new Set(prev).add(params.data!.id));
              params.node?.setSelected(true);
              params.api.refreshCells({ rowNodes: [params.node], force: true });
            };

            return (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="w-full h-full flex items-center justify-center cursor-pointer gap-1">
                    {currentDueDate ? (
                      <>
                        <span
                          className={`text-xs ${isOverdue ? "text-red-600 font-medium" : ""}`}
                        >
                          {currentDueDate}
                        </span>
                        <button
                          onClick={handleClear}
                          className="text-muted-foreground hover:text-destructive text-[10px] leading-none"
                          title="마감일 제거"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="center">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    마감일 선택
                  </p>
                  <input
                    type="date"
                    defaultValue={currentDueDate || ""}
                    onChange={handleChange}
                    className="px-2 py-1 border border-input rounded text-sm"
                    autoFocus
                  />
                  {currentDueDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-xs text-muted-foreground"
                      onClick={handleClear}
                    >
                      마감일 제거
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            );
          };
          return <DueDateCell />;
        },
      },
      {
        headerName: "작성일",
        field: "createdAt",
        width: 90,
        headerClass: "ag-header-cell-center",
        cellStyle: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "#888",
        } as CellStyle,
        valueFormatter: (params) => {
          if (!params.value) return "-";
          return new Date(params.value).toLocaleDateString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
          });
        },
      },
    ],
    [users],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    [],
  );

  const rowClassRules = useMemo(
    () => ({
      "bg-yellow-50": (params: { data?: Work }) =>
        modifiedRowIds.has(params.data?.id ?? -1),
      "bg-blue-50": (params: { data?: Work }) =>
        params.data?.id === selectedWorkId,
    }),
    [modifiedRowIds, selectedWorkId],
  );

  const onRowClicked = (event: RowClickedEvent<Work>) => {
    if (!event.data) return;
    setSelectedWorkId(event.data.id);
    setIsEditing(false);
  };

  // 편집 모드에서 외부 클릭 시 취소
  useEffect(() => {
    if (!isEditing) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        editPanelRef.current &&
        !editPanelRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
        if (!selectedWorkId) setSelectedWorkId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        if (!selectedWorkId) setSelectedWorkId(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, selectedWorkId]);

  // 신규 작성
  const handleNew = () => {
    setSelectedWorkId(null);
    setFormTitle("");
    setFormContent("");
    setFormstring("COMMON");
    setFormStatus("TODO");
    setFormPriority("MEDIUM");
    setFormAssigneeId(null);
    setFormDueDate("");
    setIsEditing(true);
  };

  // 수정 모드로 전환
  const handleEdit = () => {
    if (!pilotDetail) return;
    setFormTitle(pilotDetail.title);
    setFormContent(pilotDetail.content);
    setFormstring(pilotDetail.topic);
    setFormStatus(pilotDetail.status);
    setFormPriority(pilotDetail.priority);
    setFormAssigneeId(pilotDetail.assigneeId ?? null);
    setFormDueDate(pilotDetail.dueDate ?? "");
    setIsEditing(true);
  };

  // 저장
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
      topic: formstring,
      status: formStatus,
      priority: formPriority,
      assigneeId: formAssigneeId,
      dueDate: formDueDate || null,
    };

    if (selectedWorkId) {
      updateWork(
        { id: selectedWorkId, request: data },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        },
      );
    } else {
      createWork(data, {
        onSuccess: () => {
          setIsEditing(false);
          setSelectedWorkId(null);
        },
      });
    }
  };

  // 취소
  const handleCancel = () => {
    setIsEditing(false);
    if (!selectedWorkId) {
      setSelectedWorkId(null);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!selectedWorkId) return;

    const confirmed = await confirm({
      title: "업무 삭제",
      description:
        "정말로 이 업무를 삭제하시겠습니까? 모든 체크리스트와 첨부 파일도 함께 삭제됩니다.",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });

    if (confirmed) {
      deleteWork(selectedWorkId, {
        onSuccess: () => {
          setSelectedWorkId(null);
          setIsEditing(false);
        },
      });
    }
  };

  // 상태 변경 (상세 뷰에서)
  const handleStatusChange = (newStatus: WorkStatus) => {
    if (!selectedWorkId) return;
    updateStatus({ id: selectedWorkId, status: newStatus });
  };

  // 우선순위 변경 (상세 뷰에서)
  const handlePriorityChange = (newPriority: WorkPriority) => {
    if (!selectedWorkId || !pilotDetail) return;
    updateWork({
      id: selectedWorkId,
      request: {
        title: pilotDetail.title,
        content: pilotDetail.content,
        topic: pilotDetail.topic,
        status: pilotDetail.status,
        priority: newPriority,
        assigneeId: pilotDetail.assigneeId,
        dueDate: pilotDetail.dueDate,
      },
    });
  };

  // 유형 변경 (상세 뷰에서)
  const handlestringChange = (newType: string) => {
    if (!selectedWorkId || !pilotDetail) return;
    updateWork({
      id: selectedWorkId,
      request: {
        title: pilotDetail.title,
        content: pilotDetail.content,
        topic: newType,
        status: pilotDetail.status,
        priority: pilotDetail.priority,
        assigneeId: pilotDetail.assigneeId,
        dueDate: pilotDetail.dueDate,
      },
    });
  };

  // 체크리스트 추가
  const handleAddChecklist = () => {
    if (!newChecklistContent.trim()) {
      toast.error("체크리스트 내용을 입력하세요");
      return;
    }
    const orderNum = checklists?.length || 0;
    createChecklist({ content: newChecklistContent, orderNum });
    setNewChecklistContent("");
  };

  // 체크리스트 삭제
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
  const handleImageUpload = (files: FileList | File[]) => {
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
  };

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
      toast.success("✅ Mermaid 문법이 올바릅니다");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setValidationResult({ isValid: false, error: errorMessage });
      toast.error("❌ Mermaid 문법 오류가 있습니다");
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

  // 상태별 카운트
  const statusCounts = useMemo(() => {
    const allWorks = pilotsData?.items || [];
    return {
      TODO: allWorks.filter((w) => w.status === "TODO").length,
      IN_PROGRESS: allWorks.filter((w) => w.status === "IN_PROGRESS").length,
      DONE: allWorks.filter((w) => w.status === "DONE").length,
      HOLD: allWorks.filter((w) => w.status === "HOLD").length,
      ALL: allWorks.length,
    };
  }, [pilotsData]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 헤더 */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">업무 관리</h1>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />새 업무
          </Button>
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* 유형 필터 */}
          <div className="flex gap-1">
            <Button
              variant={filterstring === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterstring("ALL")}
              className="h-7 px-2 text-xs"
            >
              전체
            </Button>
            <div className="w-px bg-border mx-0.5" />
            {(["FEATURE", "QA", "COMMON"] as string[]).map((type) => (
              <Button
                key={type}
                variant={filterstring === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterstring(type)}
                className="h-7 px-2 text-xs"
              >
                {WORK_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>

          <div className="w-px bg-border h-5" />

          {/* 우선순위 필터 */}
          <div className="flex gap-1">
            <Button
              variant={filterPriority === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority("ALL")}
              className="h-7 px-2 text-xs"
            >
              전체
            </Button>
            <div className="w-px bg-border mx-0.5" />
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as WorkPriority[]).map(
              (p) => (
                <Button
                  key={p}
                  variant={filterPriority === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority(p)}
                  className={`h-7 px-2 text-xs ${filterPriority === p ? "" : PRIORITY_COLORS[p]}`}
                >
                  {PRIORITY_LABELS[p]}
                  {priorityCounts[p] > 0 && (
                    <span className="ml-1 font-bold">{priorityCounts[p]}</span>
                  )}
                </Button>
              ),
            )}
          </div>

          <div className="w-px bg-border h-5" />

          <input
            type="text"
            placeholder="제목 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="px-3 py-1.5 border border-input rounded-md flex-1 max-w-xs text-sm h-7"
          />
        </div>
      </div>

      {/* 메인 컨텐츠: 좌우 분할 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 업무 목록 */}
        <div className="w-1/2 border-r border-border p-2 overflow-hidden flex flex-col">
          {/* 상태별 카운트 버튼 */}
          <div className="flex gap-1.5 mb-2">
            <Button
              variant={filterStatus === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterStatus("ALL");
                setIsBackupTab(false);
              }}
              className="flex-1"
              disabled={isBackupTab}
            >
              전체 <span className="ml-2 font-bold">{statusCounts.ALL}</span>
            </Button>
            <Button
              variant={filterStatus === "TODO" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterStatus("TODO");
                setIsBackupTab(false);
              }}
              className="flex-1"
              disabled={isBackupTab}
            >
              진행 전{" "}
              <span className="ml-2 font-bold">{statusCounts.TODO}</span>
            </Button>
            <Button
              variant={filterStatus === "IN_PROGRESS" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterStatus("IN_PROGRESS");
                setIsBackupTab(false);
              }}
              className="flex-1"
              disabled={isBackupTab}
            >
              진행 중{" "}
              <span className="ml-2 font-bold">{statusCounts.IN_PROGRESS}</span>
            </Button>
            <Button
              variant={filterStatus === "DONE" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterStatus("DONE");
                setIsBackupTab(false);
              }}
              className="flex-1"
              disabled={isBackupTab}
            >
              완료 <span className="ml-2 font-bold">{statusCounts.DONE}</span>
            </Button>
            <Button
              variant={filterStatus === "HOLD" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilterStatus("HOLD");
                setIsBackupTab(false);
              }}
              className="flex-1"
              disabled={isBackupTab}
            >
              보류 <span className="ml-2 font-bold">{statusCounts.HOLD}</span>
            </Button>
            <div className="w-px bg-border mx-0.5" />
            <button
              onClick={() => {
                setIsBackupTab(!isBackupTab);
                setSelectedWorkId(null);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded transition-colors",
                isBackupTab
                  ? "bg-amber-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              🗄️ 백업
            </button>
          </div>

          {/* Grid Toolbar */}
          <div className="flex justify-end gap-1.5 mb-1.5 pb-1.5 border-b">
            {!isBackupTab && (
              <>
                <Button onClick={handleAddRow} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />행 추가
                </Button>
                {modifiedRowIds.size > 0 && (
                  <Button
                    onClick={handleSaveModified}
                    size="sm"
                    variant="default"
                  >
                    저장 ({modifiedRowIds.size})
                  </Button>
                )}
                <Button
                  onClick={handleDeleteSelected}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
                <Button onClick={handleArchive} size="sm" variant="outline">
                  🗄️ 백업
                </Button>
              </>
            )}
            {isBackupTab && (
              <Button onClick={handleRestore} size="sm" variant="outline">
                ↩️ 복원
              </Button>
            )}
          </div>

          <div className="flex-1" style={{ height: "100%" }}>
            <AgGridReact<Work>
              ref={gridRef}
              rowData={works}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              onRowClicked={onRowClicked}
              onCellValueChanged={onCellValueChanged}
              rowClassRules={rowClassRules}
              rowDragManaged={true}
              onRowDragEnd={onRowDragEnd}
              animateRows={true}
              theme={themeQuartz.withParams({
                headerHeight: 40,
                rowHeight: 40,
                fontSize: 13,
                headerFontSize: 13,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              })}
              localeText={localeText}
            />
          </div>
        </div>

        {/* 우측: 업무 상세 */}
        <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
          {isEditing ? (
            /* 편집 모드 */
            <div ref={editPanelRef}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedWorkId ? "업무 수정" : "새 업무 작성"}
                </h2>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>저장</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    취소
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {/* 유형 / 상태 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      유형
                    </label>
                    <Select
                      value={formstring}
                      onValueChange={(v) => setFormstring(v as string)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FEATURE">기능개발</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="COMMON">일반</SelectItem>
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
                      onValueChange={(v) => setFormPriority(v as WorkPriority)}
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
                            {u.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 마감일 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    마감일
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
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
          ) : pilotDetail ? (
            /* 조회 모드 */
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {pilotDetail.title}
                  </h2>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <span>#{pilotDetail.id}</span>
                    <span>•</span>
                    <span>{pilotDetail.reporterName}</span>
                    <span>•</span>
                    <span>
                      {new Date(pilotDetail.createdAt).toLocaleDateString(
                        "ko-KR",
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </div>

              {/* 기본 정보 테이블 */}
              <div className="border rounded-lg overflow-hidden mb-6">
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
                              className={`cursor-pointer ${WORK_TYPE_COLORS[pilotDetail.topic]}`}
                            >
                              {WORK_TYPE_LABELS[pilotDetail.topic]}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-2">
                            <div className="space-y-1">
                              {(["FEATURE", "QA", "COMMON"] as string[]).map(
                                (type) => (
                                  <div
                                    key={type}
                                    className={`px-3 py-2 rounded cursor-pointer hover:bg-accent ${
                                      type === pilotDetail.topic
                                        ? "bg-accent"
                                        : ""
                                    }`}
                                    onClick={() => handlestringChange(type)}
                                  >
                                    {WORK_TYPE_LABELS[type]}
                                  </div>
                                ),
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="bg-muted px-4 py-2 font-medium w-28">
                        요청자
                      </td>
                      <td className="px-4 py-2">{pilotDetail.reporterName}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-muted px-4 py-2 font-medium">상태</td>
                      <td className="px-4 py-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge
                              className={`cursor-pointer ${STATUS_COLORS[pilotDetail.status]}`}
                            >
                              {STATUS_LABELS[pilotDetail.status]}
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
                                    status === pilotDetail.status
                                      ? "bg-accent"
                                      : ""
                                  }`}
                                  onClick={() => handleStatusChange(status)}
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
                              className={`cursor-pointer ${PRIORITY_COLORS[pilotDetail.priority]}`}
                            >
                              {PRIORITY_LABELS[pilotDetail.priority]}
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
                                    priority === pilotDetail.priority
                                      ? "bg-accent"
                                      : ""
                                  }`}
                                  onClick={() => handlePriorityChange(priority)}
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
                      <td className="bg-muted px-4 py-2 font-medium">담당자</td>
                      <td className="px-4 py-2">
                        {pilotDetail.assigneeName || (
                          <span className="text-muted-foreground">미지정</span>
                        )}
                      </td>
                      <td className="bg-muted px-4 py-2 font-medium">마감일</td>
                      <td className="px-4 py-2">
                        {pilotDetail.dueDate ? (
                          <span
                            className={
                              new Date(pilotDetail.dueDate) < new Date()
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {pilotDetail.dueDate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-muted px-4 py-2 font-medium">작성일</td>
                      <td className="px-4 py-2">
                        {new Date(pilotDetail.createdAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          },
                        )}{" "}
                        {new Date(pilotDetail.createdAt).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          },
                        )}
                      </td>
                      <td className="bg-muted px-4 py-2 font-medium">수정일</td>
                      <td className="px-4 py-2">
                        {new Date(pilotDetail.updatedAt).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          },
                        )}{" "}
                        {new Date(pilotDetail.updatedAt).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          },
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 첨부 파일 탭 섹션 */}
              <div
                className="border rounded-lg overflow-hidden mb-3"
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
                        {pilotImages &&
                          pilotImages.filter(
                            (img) => img.fileType === "image" || !img.fileType,
                          ).length > 0 && (
                            <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              {
                                pilotImages.filter(
                                  (img) =>
                                    img.fileType === "image" || !img.fileType,
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
                        <h3 className="font-semibold text-sm">이미지 첨부</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
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
                            e.target.files && handleImageUpload(e.target.files)
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
                        {pilotImages &&
                        pilotImages.filter(
                          (img) => img.fileType === "image" || !img.fileType,
                        ).length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {pilotImages
                              .filter(
                                (img) =>
                                  img.fileType === "image" || !img.fileType,
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
                                    onClick={() => deleteImage(image.id)}
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
                                이미지를 드래그하여 놓거나, 클릭하여 활성화 후
                                Ctrl+V로 붙여넣으세요
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
                                  onClick={() => handleViewMindmap(mindmap.id)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">마인드맵을 추가하세요</p>
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
                                        handleOpenDbTableDialog(dbTable.id)
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
                                    💬 {content.description}
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
                                        {content.columns.map((col, idx) => (
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
                                              {col.unique_key === "UQ" && (
                                                <span className="text-purple-600">
                                                  ✓
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
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
                        <h3 className="font-semibold text-sm">피그마 링크</h3>
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
                                  onClick={() => handleDeleteFigma(figma.id)}
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
                            <p className="text-sm">피그마 링크를 추가하세요</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* 부가 업무 탭 */}
                    <TabsContent value="linkedissues">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm">부가 업무</h3>
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
                          {isSearchingIssue ? "검색 중..." : "이슈 검색"}
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
                                onClick={() => handleLinkIssue(issue.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`text-xs ${ISSUE_STATUS_COLORS[issue.status] || "bg-gray-100 text-gray-600"}`}
                                  >
                                    {ISSUE_STATUS_LABELS[issue.status] ||
                                      issue.status}
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
                              <div
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                                onClick={() => navigate({ to: "/issues" })}
                              >
                                <Badge
                                  className={`text-xs flex-shrink-0 ${
                                    ISSUE_STATUS_COLORS[linked.issueStatus] ||
                                    "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {ISSUE_STATUS_LABELS[linked.issueStatus] ||
                                    linked.issueStatus}
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
                                onClick={() => handleUnlinkIssue(linked.id)}
                                title="연결 해제"
                              >
                                <Unlink className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <ChevronRight className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">연결된 이슈가 없습니다</p>
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
              <div className="border rounded-lg overflow-hidden mb-3">
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
                  {pilotDetail.content || (
                    <span className="text-muted-foreground">
                      내용이 없습니다.
                    </span>
                  )}
                </div>
              </div>

              {/* 체크리스트 */}
              <div className="border rounded-lg overflow-hidden mb-3">
                <div className="bg-muted/30 border-b px-4 py-1.5">
                  <span className="font-bold text-sm">
                    체크리스트
                    {checklists && checklists.length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        {checklists.filter((c) => c.isChecked).length}/
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
                              checked={item.isChecked}
                              onCheckedChange={() => toggleChecklist(item.id)}
                            />
                            <span
                              className={`flex-1 text-sm ${item.isChecked ? "line-through text-muted-foreground" : ""}`}
                            >
                              {item.content}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                              onClick={() => handleDeleteChecklistItem(item.id)}
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
                      onChange={(e) => setNewChecklistContent(e.target.value)}
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

              {/* 부가 업무 */}
              <div className="border rounded-lg overflow-hidden mb-3">
                <div className="bg-muted/30 border-b px-4 py-1.5">
                  <span className="font-bold text-sm">부가 업무</span>
                </div>
                <div className="p-2">
                  {/* 이슈 검색 */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={issueSearchKeyword}
                      onChange={(e) => setIssueSearchKeyword(e.target.value)}
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
                      {isSearchingIssue ? "검색 중..." : "이슈 검색"}
                    </Button>
                  </div>
                  {/* 검색 결과 */}
                  {issueSearchResults.length > 0 && (
                    <div className="mb-3 border rounded-md overflow-hidden">
                      <div className="bg-muted px-3 py-2 border-b text-xs font-medium text-muted-foreground">
                        검색 결과 — 클릭하여 연결
                      </div>
                      <div className="divide-y max-h-48 overflow-y-auto">
                        {issueSearchResults.map((issue) => (
                          <div
                            key={issue.id}
                            className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer"
                            onClick={() => handleLinkIssue(issue.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`text-xs ${ISSUE_STATUS_COLORS[issue.status] || "bg-gray-100 text-gray-600"}`}
                              >
                                {ISSUE_STATUS_LABELS[issue.status] ||
                                  issue.status}
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
                    {linkedIssues && linkedIssues.length > 0
                      ? linkedIssues.map((linked) => (
                          <div
                            key={linked.id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent group"
                          >
                            <div
                              className="flex items-center gap-2 flex-1 cursor-pointer"
                              onClick={() => navigate({ to: "/issues" })}
                            >
                              <Badge
                                className={`text-xs flex-shrink-0 ${ISSUE_STATUS_COLORS[linked.issueStatus] || "bg-gray-100 text-gray-600"}`}
                              >
                                {ISSUE_STATUS_LABELS[linked.issueStatus] ||
                                  linked.issueStatus}
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
                              onClick={() => handleUnlinkIssue(linked.id)}
                              title="연결 해제"
                            >
                              <Unlink className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>

              {/* 채팅 섹션 */}
              <div className="border rounded-lg overflow-hidden mt-3">
                <WorkChatPanel workId={pilotDetail.id} />
              </div>
            </div>
          ) : (
            /* 선택 안됨 */
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>왼쪽 목록에서 업무를 선택하거나 새 업무를 작성하세요.</p>
            </div>
          )}
        </div>
      </div>

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
              <label className="text-sm font-medium mb-1.5 block">제목 *</label>
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
      <Dialog open={isMindmapDialogOpen} onOpenChange={setIsMindmapDialogOpen}>
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
                <label className="text-sm font-medium mb-2 block">제목</label>
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
                          ✅ 문법이 올바릅니다
                        </span>
                      </p>
                    ) : (
                      <div>
                        <p className="font-semibold mb-1">❌ 문법 오류</p>
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
                  <Mermaid chart={mindmapContent} className="mermaid-preview" />
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
      <Dialog open={isDbTableDialogOpen} onOpenChange={setIsDbTableDialogOpen}>
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
                <label className="text-sm font-medium mb-1.5 block">분류</label>
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
                            <th className="px-3 py-2 text-left">column_name</th>
                            <th className="px-3 py-2 text-left">data_type</th>
                            <th className="px-3 py-2 text-center w-20">
                              nullable
                            </th>
                            <th className="px-3 py-2 text-center w-12">pk</th>
                            <th className="px-3 py-2 text-center w-12">fk</th>
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
    </div>
  );
}
