import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  devlogApi,
  issueSearchApi,
  workSearchApi,
} from "@/features/devlog/api/devlogApi";
import type { DevLog, LinkableItem } from "@/features/devlog/api/devlogApi";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, RowClickedEvent } from "ag-grid-community";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from "ag-grid-community";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Trash2, Search, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule]);

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function formatLogDate(log: DevLog): string {
  try {
    const d = log.logDate
      ? new Date(log.logDate + "T00:00:00")
      : new Date(log.createdAt);
    return format(d, "MM/dd (EEE)", { locale: ko });
  } catch {
    return "-";
  }
}

function toDateInput(log: DevLog): string {
  if (log.logDate) return log.logDate.slice(0, 10);
  try {
    return format(new Date(log.createdAt), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

const ISSUE_STATUS_LABEL: Record<string, string> = {
  OPEN: "열림",
  IN_PROGRESS: "진행 중",
  RESOLVED: "해결됨",
  CLOSED: "닫힘",
  DONE: "완료",
};
const WORK_STATUS_LABEL: Record<string, string> = {
  TODO: "대기",
  IN_PROGRESS: "진행 중",
  TEST: "테스트",
  DONE: "완료",
  HOLD: "보류",
  BLOCKED: "막힘",
};

function statusColor(s: string): string {
  if (s === "DONE" || s === "RESOLVED")
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (s === "IN_PROGRESS")
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "BLOCKED")
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (s === "TEST")
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  if (s === "HOLD")
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-muted text-muted-foreground";
}

// ── LinkDialog ────────────────────────────────────────────────────────────────

interface LinkDialogProps {
  title: string;
  items: LinkableItem[];
  linkedIds: number[];
  onClose: () => void;
  onConfirm: (selected: number[]) => void;
}

function LinkDialog({
  title,
  items,
  linkedIds,
  onClose,
  onConfirm,
}: LinkDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set(linkedIds));

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(keyword.toLowerCase()),
  );

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-[480px] max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 검색 */}
        <div className="shrink-0 px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              항목이 없습니다.
            </p>
          ) : (
            filtered.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                  className="w-4 h-4 accent-primary shrink-0"
                />
                <span className="flex-1 text-sm text-foreground truncate">
                  #{item.id} {item.title}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
                    statusColor(item.status),
                  )}
                >
                  {ISSUE_STATUS_LABEL[item.status] ??
                    WORK_STATUS_LABEL[item.status] ??
                    item.status}
                </span>
              </label>
            ))
          )}
        </div>

        {/* 푸터 */}
        <div className="shrink-0 flex justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button size="sm" onClick={() => onConfirm(Array.from(selected))}>
            확인 ({selected.size})
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── DetailPanel ───────────────────────────────────────────────────────────────

interface DetailPanelProps {
  log: DevLog;
  onDelete: () => void;
}

function DetailPanel({ log, onDelete }: DetailPanelProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(log.title);
  const [editDate, setEditDate] = useState(toDateInput(log));
  const [editContent, setEditContent] = useState(log.content ?? "");
  const [editSummary, setEditSummary] = useState(log.summary ?? "");
  const [linkIssueOpen, setLinkIssueOpen] = useState(false);
  const [linkWorkOpen, setLinkWorkOpen] = useState(false);

  // 편집 모드 진입 시 최신 데이터 동기화
  const startEditing = () => {
    setEditTitle(log.title);
    setEditDate(toDateInput(log));
    setEditContent(log.content ?? "");
    setEditSummary(log.summary ?? "");
    setIsEditing(true);
  };

  // 연결된 이슈/업무 ID 목록
  const { data: linkedIssueIds = [] } = useQuery<number[]>({
    queryKey: ["devlogs", log.id, "linked-issues"],
    queryFn: () => devlogApi.getLinkedIssues(log.id),
  });
  const { data: linkedWorkIds = [] } = useQuery<number[]>({
    queryKey: ["devlogs", log.id, "linked-works"],
    queryFn: () => devlogApi.getLinkedWorks(log.id),
  });

  // 전체 이슈/업무 목록 (연결 다이얼로그용)
  const { data: allIssues = [] } = useQuery<LinkableItem[]>({
    queryKey: ["issues-list"],
    queryFn: issueSearchApi.getIssues,
    staleTime: 60_000,
  });
  const { data: allWorks = [] } = useQuery<LinkableItem[]>({
    queryKey: ["works-list"],
    queryFn: workSearchApi.getWorks,
    staleTime: 60_000,
  });

  // 연결된 항목 상세 정보
  const linkedIssues = allIssues.filter((i) => linkedIssueIds.includes(i.id));
  const linkedWorks = allWorks.filter((w) => linkedWorkIds.includes(w.id));

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      devlogApi.updateDevLog(log.id, {
        title: editTitle.trim() || log.title,
        content: editContent,
        summary: editSummary,
        logDate: editDate || undefined,
        sortOrder: log.sortOrder,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      toast.success("저장됐습니다.");
      setIsEditing(false);
    },
    onError: () => toast.error("저장 실패"),
  });

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: () => devlogApi.deleteDevLog(log.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      toast.success("삭제됐습니다.");
      onDelete();
    },
    onError: () => toast.error("삭제 실패"),
  });

  // 이슈 연결 처리
  const handleLinkIssueConfirm = async (selectedIds: number[]) => {
    const toAdd = selectedIds.filter((id) => !linkedIssueIds.includes(id));
    const toRemove = linkedIssueIds.filter((id) => !selectedIds.includes(id));
    await Promise.all([
      ...toAdd.map((id) => devlogApi.linkIssue(log.id, id)),
      ...toRemove.map((id) => devlogApi.unlinkIssue(log.id, id)),
    ]);
    queryClient.invalidateQueries({
      queryKey: ["devlogs", log.id, "linked-issues"],
    });
    toast.success("이슈 연결이 업데이트됐습니다.");
    setLinkIssueOpen(false);
  };

  // 업무 연결 처리
  const handleLinkWorkConfirm = async (selectedIds: number[]) => {
    const toAdd = selectedIds.filter((id) => !linkedWorkIds.includes(id));
    const toRemove = linkedWorkIds.filter((id) => !selectedIds.includes(id));
    await Promise.all([
      ...toAdd.map((id) => devlogApi.linkWork(log.id, id)),
      ...toRemove.map((id) => devlogApi.unlinkWork(log.id, id)),
    ]);
    queryClient.invalidateQueries({
      queryKey: ["devlogs", log.id, "linked-works"],
    });
    toast.success("업무 연결이 업데이트됐습니다.");
    setLinkWorkOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ─── 헤더 ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-5 border-b border-border bg-card h-[49px]">
        {isEditing ? (
          /* 편집 모드 헤더 */
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm font-semibold text-foreground shrink-0">
              편집 중
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              저장
            </Button>
          </div>
        ) : (
          /* 뷰 모드 헤더 */
          <>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                {formatLogDate(log)}
              </span>
              <span className="text-sm font-semibold text-foreground truncate">
                {log.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <Button size="sm" variant="outline" onClick={startEditing}>
                편집
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("이 일지를 삭제할까요?")) deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ─── 본문 ─────────────────────────────────────────────────────────── */}
      {isEditing ? (
        /* 편집 폼 */
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {/* 날짜 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              날짜
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-48"
            />
          </div>

          {/* 제목 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              제목
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 오늘 한 일 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              오늘 한 일
            </label>
            <textarea
              rows={10}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="오늘 한 일을 입력하세요..."
              className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 총평 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              총평
            </label>
            <textarea
              rows={4}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              placeholder="오늘의 총평을 입력하세요..."
              className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      ) : (
        /* 뷰 모드 */
        <div className="flex-1 overflow-y-auto">
          {/* 섹션: 오늘 한 일 */}
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              오늘 한 일
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="px-5 pb-4">
            {log.content ? (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {log.content}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">내용 없음</p>
            )}
          </div>

          {/* 섹션: 연결된 이슈 */}
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              연결된 이슈
            </span>
            <div className="flex-1 h-px bg-border" />
            <button
              onClick={() => setLinkIssueOpen(true)}
              className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              연결
            </button>
          </div>
          <div className="px-5 pb-4 flex flex-wrap gap-1.5">
            {linkedIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                연결된 이슈 없음
              </p>
            ) : (
              linkedIssues.map((issue) => (
                <span
                  key={issue.id}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    statusColor(issue.status),
                  )}
                >
                  #{issue.id} {issue.title} ·{" "}
                  {ISSUE_STATUS_LABEL[issue.status] ?? issue.status}
                </span>
              ))
            )}
          </div>

          {/* 섹션: 연결된 업무 */}
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              연결된 업무
            </span>
            <div className="flex-1 h-px bg-border" />
            <button
              onClick={() => setLinkWorkOpen(true)}
              className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              연결
            </button>
          </div>
          <div className="px-5 pb-4 flex flex-wrap gap-1.5">
            {linkedWorks.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                연결된 업무 없음
              </p>
            ) : (
              linkedWorks.map((work) => (
                <span
                  key={work.id}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    statusColor(work.status),
                  )}
                >
                  #{work.id} {work.title} ·{" "}
                  {WORK_STATUS_LABEL[work.status] ?? work.status}
                </span>
              ))
            )}
          </div>

          {/* 섹션: 총평 */}
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              총평
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="px-5 pb-6">
            {log.summary ? (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {log.summary}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">총평 없음</p>
            )}
          </div>
        </div>
      )}

      {/* ─── 연결 다이얼로그 ──────────────────────────────────────────────── */}
      {linkIssueOpen && (
        <LinkDialog
          title="이슈 연결"
          items={allIssues}
          linkedIds={linkedIssueIds}
          onClose={() => setLinkIssueOpen(false)}
          onConfirm={handleLinkIssueConfirm}
        />
      )}
      {linkWorkOpen && (
        <LinkDialog
          title="업무 연결"
          items={allWorks}
          linkedIds={linkedWorkIds}
          onClose={() => setLinkWorkOpen(false)}
          onConfirm={handleLinkWorkConfirm}
        />
      )}
    </div>
  );
}

// ── DevLogPage (메인) ─────────────────────────────────────────────────────────

export default function DevLogPage() {
  const gridRef = useRef<AgGridReact<DevLog>>(null);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery<DevLog[]>({
    queryKey: ["devlogs"],
    queryFn: devlogApi.getMyDevLogs,
  });

  // 새 일지 생성
  const createMutation = useMutation({
    mutationFn: () => {
      const today = format(new Date(), "yyyy-MM-dd");
      return devlogApi.createDevLog({
        title: `${today} 개발일지`,
        logDate: today,
        content: "",
        summary: "",
        sortOrder: 0,
      });
    },
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      setSelectedLogId(newId);
      toast.success("새 개발일지가 생성됐습니다.");
    },
    onError: () => toast.error("생성 실패"),
  });

  // 선택 행 삭제
  const handleDeleteSelected = () => {
    const selected = gridRef.current?.api.getSelectedRows() ?? [];
    if (!selected.length) {
      toast.error("삭제할 항목을 선택하세요.");
      return;
    }
    if (!confirm(`${selected.length}개를 삭제할까요?`)) return;
    Promise.all(selected.map((l) => devlogApi.deleteDevLog(l.id))).then(() => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      setSelectedLogId(null);
      toast.success("삭제됐습니다.");
    });
  };

  // ag-grid 컬럼 정의
  const columnDefs: ColDef<DevLog>[] = [
    {
      headerName: "날짜",
      width: 110,
      valueGetter: (p) => (p.data ? formatLogDate(p.data) : ""),
      cellStyle: { display: "flex", alignItems: "center", fontSize: "13px" },
    },
    {
      headerName: "제목",
      field: "title",
      flex: 1,
      minWidth: 150,
      cellStyle: { display: "flex", alignItems: "center", fontSize: "13px" },
    },
    {
      headerName: "총평",
      field: "summary",
      flex: 1,
      minWidth: 120,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        fontSize: "12px",
        color: "var(--muted-foreground)",
      },
      valueFormatter: (p) =>
        p.value
          ? p.value.length > 40
            ? p.value.slice(0, 40) + "…"
            : p.value
          : "",
    },
    {
      headerName: "작성일",
      width: 80,
      valueGetter: (p) => {
        if (!p.data) return "";
        try {
          return format(new Date(p.data.createdAt), "MM.dd");
        } catch {
          return "";
        }
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: "var(--muted-foreground)",
      },
    },
  ];

  // 필터링 + 정렬
  const filteredLogs = logs
    .filter(
      (l) => !keyword || l.title.toLowerCase().includes(keyword.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const selectedLog = logs.find((l) => l.id === selectedLogId) ?? null;

  const onRowClicked = (e: RowClickedEvent<DevLog>) => {
    if (e.data) setSelectedLogId(e.data.id);
  };

  const rowClassRules = {
    "bg-primary/10": (p: { data?: DevLog }) => p.data?.id === selectedLogId,
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ─── 헤더 바 ────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border bg-card px-6 h-[49px] flex items-center gap-3">
        <h1 className="text-lg font-bold text-foreground">개발일지</h1>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="제목 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-input rounded-md text-sm h-8 w-48 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex-1" />

        <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
          <Trash2 className="w-4 h-4 mr-1" />
          삭제
        </Button>
        <Button
          size="sm"
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-1" />새 일지
        </Button>
      </div>

      {/* ─── 메인 레이아웃 (좌50 + 우50) ───────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: ag-grid */}
        <div className="w-1/2 border-r border-border overflow-hidden flex flex-col">
          <div className="flex-1">
            <AgGridReact<DevLog>
              ref={gridRef}
              rowData={filteredLogs}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, resizable: true }}
              rowSelection="multiple"
              suppressRowClickSelection={false}
              onRowClicked={onRowClicked}
              rowClassRules={rowClassRules}
              theme={themeQuartz.withParams({
                headerHeight: 40,
                rowHeight: 40,
                fontSize: 13,
                headerFontSize: 13,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              })}
            />
          </div>
        </div>

        {/* 우측: 상세 패널 */}
        <div className="w-1/2 overflow-hidden">
          {selectedLog ? (
            <DetailPanel
              key={selectedLog.id}
              log={selectedLog}
              onDelete={() => setSelectedLogId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <p className="text-base font-medium">← 일지를 선택하세요</p>
              <p className="text-sm">
                왼쪽에서 일지를 클릭하면 상세 내용이 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
