import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devlogApi } from "@/features/devlog/api/devlogApi";
import type { DevLog } from "@/features/devlog/api/devlogApi";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Trash2, Search, Pencil, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

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

// ── 상태 스타일 ───────────────────────────────────────────────────────────────

const WORK_STATUS_LABEL: Record<string, string> = {
  TODO: "대기",
  IN_PROGRESS: "진행 중",
  TEST: "테스트",
  DONE: "완료",
  HOLD: "보류",
  BLOCKED: "막힘",
};
const ISSUE_STATUS_LABEL: Record<string, string> = {
  OPEN: "열림",
  IN_PROGRESS: "진행 중",
  RESOLVED: "해결됨",
  CLOSED: "닫힘",
  DONE: "완료",
};

function statusBadge(status: string) {
  const label =
    WORK_STATUS_LABEL[status] ?? ISSUE_STATUS_LABEL[status] ?? status;
  let cls = "bg-muted text-muted-foreground";
  if (status === "DONE" || status === "RESOLVED")
    cls =
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  else if (status === "IN_PROGRESS")
    cls = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  else if (status === "BLOCKED")
    cls = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  else if (status === "TEST")
    cls =
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  else if (status === "HOLD")
    cls =
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return (
    <span
      className={cn(
        "text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
        cls,
      )}
    >
      {label}
    </span>
  );
}

// ── 완료 항목 테이블 ──────────────────────────────────────────────────────────

interface DoneItem {
  id: number;
  title: string;
  status: string;
  assigneeName?: string;
}

function DoneTable({
  items,
  emptyMsg,
}: {
  items: DoneItem[];
  emptyMsg: string;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground italic">{emptyMsg}</p>;
  }
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-3 py-2 text-muted-foreground font-medium w-8">
              #
            </th>
            <th className="text-left px-3 py-2 text-muted-foreground font-medium">
              제목
            </th>
            <th className="text-left px-3 py-2 text-muted-foreground font-medium w-20">
              담당자
            </th>
            <th className="text-left px-3 py-2 text-muted-foreground font-medium w-20">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={cn(
                "border-b border-border last:border-0",
                idx % 2 === 1 && "bg-muted/20",
              )}
            >
              <td className="px-3 py-2 text-muted-foreground">{item.id}</td>
              <td className="px-3 py-2 text-foreground">{item.title}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {item.assigneeName ?? "-"}
              </td>
              <td className="px-3 py-2">{statusBadge(item.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 섹션 헤더 ─────────────────────────────────────────────────────────────────

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
        {label}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground shrink-0">
          {sub}
        </span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── 상세 패널 ─────────────────────────────────────────────────────────────────

function DetailPanel({ log, onDelete }: { log: DevLog; onDelete: () => void }) {
  const queryClient = useQueryClient();

  // 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(log.title);
  const [editDate, setEditDate] = useState(toDateInput(log));
  const [editContent, setEditContent] = useState(log.content ?? "");

  // 뷰 모드 인라인 content (onBlur 자동 저장)
  const [content, setContent] = useState(log.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const logDateStr = toDateInput(log);
  const API_BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
  ).replace(/\/api$/, "");
  const authHdr = () => ({
    Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
  });

  // 날짜 기준 완료 업무
  const { data: doneWorks = [] } = useQuery<DoneItem[]>({
    queryKey: ["devlog-done-works", logDateStr],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/works`, { headers: authHdr() });
      const d = await r.json();
      const all = (d.works ?? d ?? []) as Record<string, unknown>[];
      return all
        .filter(
          (w) =>
            w["status"] === "DONE" &&
            (!logDateStr ||
              String(w["updatedAt"] ?? "").slice(0, 10) === logDateStr),
        )
        .map((w) => ({
          id: w["id"] as number,
          title: w["title"] as string,
          status: w["status"] as string,
          assigneeName: w["assigneeName"] as string | undefined,
        }));
    },
    staleTime: 30_000,
  });

  // 날짜 기준 완료 이슈
  const { data: doneIssues = [] } = useQuery<DoneItem[]>({
    queryKey: ["devlog-done-issues", logDateStr],
    queryFn: async () => {
      const r = await fetch(`${API_BASE}/api/issues`, { headers: authHdr() });
      const d = await r.json();
      const all = (d.issues ?? d ?? []) as Record<string, unknown>[];
      return all
        .filter((i) => {
          const done = ["DONE", "RESOLVED", "CLOSED"].includes(
            i["status"] as string,
          );
          return (
            done &&
            (!logDateStr ||
              String(i["updatedAt"] ?? "").slice(0, 10) === logDateStr)
          );
        })
        .map((i) => ({
          id: i["id"] as number,
          title: i["title"] as string,
          status: i["status"] as string,
          assigneeName: i["assigneeName"] as string | undefined,
        }));
    },
    staleTime: 30_000,
  });

  // 저장 (편집 모드)
  const updateMutation = useMutation({
    mutationFn: () =>
      devlogApi.updateDevLog(log.id, {
        title: editTitle.trim() || log.title,
        content: editContent,
        logDate: editDate || undefined,
        sortOrder: log.sortOrder,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      setContent(editContent);
      toast.success("저장됐습니다.");
      setIsEditing(false);
    },
    onError: () => toast.error("저장 실패"),
  });

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: () => devlogApi.deleteDevLog(log.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      toast.success("삭제됐습니다.");
      onDelete();
    },
    onError: () => toast.error("삭제 실패"),
  });

  // 뷰 모드에서 content onBlur 자동 저장
  const handleContentBlur = async () => {
    if (content === log.content) return;
    setIsSaving(true);
    try {
      await devlogApi.updateDevLog(log.id, {
        title: log.title,
        content,
        logDate: logDateStr || undefined,
        sortOrder: log.sortOrder,
      });
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
    } catch {
      toast.error("저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  const enterEdit = () => {
    setEditTitle(log.title);
    setEditDate(toDateInput(log));
    setEditContent(content);
    setIsEditing(true);
  };

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center gap-2 px-5 border-b border-border bg-card h-[49px]">
        {isEditing ? (
          <>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="border border-input rounded px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-36 shrink-0"
            />
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="제목"
              className="flex-1 min-w-0 border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="shrink-0"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              저장
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatLogDate(log)}
            </span>
            <span className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
              {log.title}
            </span>
            {isSaving && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                저장 중...
              </span>
            )}
            <button
              onClick={enterEdit}
              className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="편집"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm("이 일지를 삭제할까요?")) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* 오늘 한 일 */}
        <div>
          <SectionHeader label="오늘 한 일" />
          {isEditing ? (
            <textarea
              rows={10}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="오늘 한 일을 기록하세요..."
              className="w-full text-sm text-foreground bg-muted/30 border border-input rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed placeholder:text-muted-foreground"
            />
          ) : (
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleContentBlur}
              placeholder="오늘 한 일을 기록하세요..."
              className="w-full text-sm text-foreground bg-transparent border border-transparent hover:border-border focus:border-input rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring transition-colors leading-relaxed placeholder:text-muted-foreground"
            />
          )}
        </div>

        {/* 오늘의 업무 */}
        <div>
          <SectionHeader
            label="오늘의 업무"
            sub={`완료 기준 · ${logDateStr || "전체"}`}
          />
          <DoneTable
            items={doneWorks}
            emptyMsg="해당 날짜에 완료된 업무가 없습니다."
          />
        </div>

        {/* 오늘의 이슈 */}
        <div>
          <SectionHeader
            label="오늘의 이슈"
            sub={`완료 기준 · ${logDateStr || "전체"}`}
          />
          <DoneTable
            items={doneIssues}
            emptyMsg="해당 날짜에 완료된 이슈가 없습니다."
          />
        </div>
      </div>
    </div>
  );
}

// ── DevLogPage ────────────────────────────────────────────────────────────────

export default function DevLogPage() {
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [checqueryClient = useQueryClient();

  const { data: logs = [] } = useQuery<DevLog[]>({
    queryKey: ["devlogs"],
    queryFn: devlogApi.getMyDevLogs,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const today = format(new Date(), "yyyy-MM-dd");
      return devlogApi.createDevLog({
        title: `${today} 개발일지`,
        logDate: today,
        content: "",
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

  const handleDeleteSelected = () => {
    const selected = gridRef.current?.api.getSelectedRows() ?? [];
    if (!selected.length) {
      toast.error("삭제할 항목을 선택하세요.");
      return;
    }
    if (!confirm(`선택한 ${selected.length}개를 삭제할까요?`)) return;
    Promise.all(selected.map((l) => devlogApi.deleteDevLog(l.id))).then(() => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      setSelectedLogId(null);
      toast.success("삭제됐습니다.");
    });
  };

  const columnDefs: ColDef<DevLog>[] = [
    {
      headerName: "날짜",
      width: 120,
      valueGetter: (p) => (p.data ? formatLogDate(p.data) : ""),
      cellStyle: {
        display: "flex",
        alignItems: "center",
        fontSize: "13px",
        paddingLeft: "12px",
      },
    },
    {
      headerName: "제목",
      field: "title",
      flex: 1,
      minWidth: 160,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        fontSize: "13px",
        fontWeight: 500,
        paddingLeft: "12px",
      },
    },
    {
      headerName: "이메일",
      field: "authorEmail",
      width: 200,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        fontSize: "12px",
        color: "var(--muted-foreground)",
        paddingLeft: "12px",
      },
      valueFormatter: (p) => p.value ?? "-",
    },
    {
      headerName: "작성일",
      width: 75,
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

  const filteredLogs = [...logs]
    .filter(
      (l) =>
        !keyword ||
        l.title.toLowerCase().includes(keyword.toLowerCase()) ||
        (l.content ?? "").toLowerCase().includes(keyword.toLowerCase()),
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
    "!bg-primary/10": (p: { data?: DevLog }) => p.data?.id === selectedLogId,
  };

  const localeText = {
    page: "페이지",
    of: "/",
    to: "~",
    pageSizeSelectorLabel: "페이지 크기",
    pageSizeSelectorLabelText: "개씩",
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center gap-3 px-6 border-b border-border bg-card h-[49px]">
        <h1 className="text-lg font-bold text-foreground shrink-0">개발일지</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="제목 또는 내용 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-input rounded-md text-sm h-8 w-52 bg-background/60 focus:outline-none focus:ring-1 focus:ring-ring hover:bg-background transition-colors"
          />
        </div>
        <div className="flex-1" />
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteSelected}
          className="h-8"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          삭제
        </Button>
        <Button
          size="sm"
          className="h-8 bg-[#0f172a] hover:bg-[#1e293b]"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />새 일지
        </Button>
      </div>

      {/* 메인: 좌50 그리드 + 우50 상세 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 ag-grid */}
        <div className="w-1/2 overflow-hidden flex flex-col border-r border-border bg-muted/20">
          <div className="flex-1 p-6">
            <AgGridReact<DevLog>
              ref={gridRef}
              rowData={filteredLogs}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, resizable: true }}
              rowSelection="multiple"
              suppressRowClickSelection={false}
              onRowClicked={onRowClicked}
              rowClassRules={rowClassRules}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              localeText={localeText}
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

        {/* 우측 상세 패널 */}
        <div className="w-1/2 overflow-hidden">
          {selectedLog ? (
            <DetailPanel
              key={selectedLog.id}
              log={selectedLog}
              onDelete={() => setSelectedLogId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground select-none">
              <p className="text-base font-medium">← 일지를 선택하세요</p>
              <p className="text-sm">
                왼쪽 목록에서 일지를 클릭하면 내용이 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
