import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Link, BookOpen } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  devlogApi,
  issueSearchApi,
  workSearchApi,
} from "@/features/devlog/api/devlogApi";
import type { DevLog, LinkableItem } from "@/features/devlog/api/devlogApi";

// ─── 상태 스타일 ─────────────────────────────────────────────────────────────

const ISSUE_STATUS_STYLE: Record<string, string> = {
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  IN_PROGRESS:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  OPEN: "bg-muted text-muted-foreground",
  CLOSED: "bg-muted text-muted-foreground",
  TODO: "bg-muted text-muted-foreground",
  RESOLVED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  TEST: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const WORK_STATUS_STYLE: Record<string, string> = {
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  IN_PROGRESS:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  TODO: "bg-muted text-muted-foreground",
  TEST: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

// ─── 날짜 포맷 ───────────────────────────────────────────────────────────────

const formatLogDate = (log: DevLog) => {
  try {
    const d = log.logDate ? new Date(log.logDate) : new Date(log.createdAt);
    return format(d, "MM/dd (EEE)", { locale: ko });
  } catch {
    return "";
  }
};

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ─── 연결 다이얼로그 ─────────────────────────────────────────────────────────

interface LinkDialogProps {
  title: string;
  items: LinkableItem[];
  linkedIds: number[];
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
  getLabel: (item: LinkableItem) => string;
  getStatus: (item: LinkableItem) => string;
  statusStyle: Record<string, string>;
}

function LinkDialog({
  title,
  items,
  linkedIds,
  onClose,
  onConfirm,
  getLabel,
  getStatus,
  statusStyle,
}: LinkDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set(linkedIds));

  const filtered = items.filter((item: LinkableItem) =>
    getLabel(item).toLowerCase().includes(keyword.toLowerCase()),
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background border border-border rounded-lg shadow-xl w-[480px] max-h-[70vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Link className="w-4 h-4" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 검색 */}
        <div className="px-4 py-2 border-b border-border">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색..."
            className="w-full text-sm bg-muted text-foreground placeholder:text-muted-foreground border border-input rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              항목이 없습니다
            </p>
          ) : (
            filtered.map((item: LinkableItem) => {
              const id = item.id;
              const isChecked = selected.has(id);
              const status = getStatus(item);
              const styleClass =
                statusStyle[status] ?? "bg-muted text-muted-foreground";
              return (
                <label
                  key={id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(id)}
                    className="accent-primary w-4 h-4 shrink-0"
                  />
                  <span className="flex-1 text-sm text-foreground truncate">
                    {getLabel(item)}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
                      styleClass,
                    )}
                  >
                    {status}
                  </span>
                </label>
              );
            })
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
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

// ─── DevLogPage ───────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH_KEY = "devlog-sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 280;

export default function DevLogPage() {
  const queryClient = useQueryClient();

  // ── 사이드바 너비 (리사이즈) ──
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
  });
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = sidebarWidth;
    },
    [sidebarWidth],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const next = Math.max(200, Math.min(480, startWidth.current + delta));
      setSidebarWidth(next);
    };
    const onUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        setSidebarWidth((w) => {
          localStorage.setItem(SIDEBAR_WIDTH_KEY, String(w));
          return w;
        });
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // ── 상태 ──
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    logDate: "",
    content: "",
    summary: "",
  });
  const [linkIssueOpen, setLinkIssueOpen] = useState(false);
  const [linkWorkOpen, setLinkWorkOpen] = useState(false);

  // ── 쿼리 ──
  const { data: devlogs = [], isLoading } = useQuery({
    queryKey: ["devlogs"],
    queryFn: () => devlogApi.getMyDevLogs(),
  });

  const sortedLogs = [...devlogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const selectedLog = devlogs.find((l) => l.id === selectedLogId) ?? null;

  const { data: linkedIssueIds = [] } = useQuery({
    queryKey: ["devlogs", selectedLogId, "linked-issues"],
    queryFn: () => devlogApi.getLinkedIssues(selectedLogId!),
    enabled: selectedLogId !== null,
  });

  const { data: linkedWorkIds = [] } = useQuery({
    queryKey: ["devlogs", selectedLogId, "linked-works"],
    queryFn: () => devlogApi.getLinkedWorks(selectedLogId!),
    enabled: selectedLogId !== null,
  });

  const { data: allIssues = [] } = useQuery({
    queryKey: ["issues"],
    queryFn: () => issueSearchApi.getIssues(),
  });

  const { data: allWorks = [] } = useQuery({
    queryKey: ["works"],
    queryFn: () => workSearchApi.getWorks(),
  });

  // 연결된 이슈/업무 객체
  const linkedIssues = (allIssues as LinkableItem[]).filter((i) =>
    linkedIssueIds.includes(i.id),
  );
  const linkedWorks = (allWorks as LinkableItem[]).filter((w) =>
    linkedWorkIds.includes(w.id),
  );

  // ── 뮤테이션 ──
  const createMutation = useMutation({
    mutationFn: devlogApi.createDevLog,
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      setSelectedLogId(typeof newId === "number" ? newId : null);
      setIsEditing(true);
    },
    onError: () => toast.error("일지 생성에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof devlogApi.updateDevLog>[1];
    }) => devlogApi.updateDevLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      setIsEditing(false);
      toast.success("저장되었습니다.");
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => devlogApi.deleteDevLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devlogs"] });
      setSelectedLogId(null);
      setIsEditing(false);
      toast.success("삭제되었습니다.");
    },
    onError: () => toast.error("삭제에 실패했습니다."),
  });

  // ── 핸들러 ──

  const handleNewLog = () => {
    const today = todayStr();
    createMutation.mutate({
      title: `${today} 개발일지`,
      logDate: today,
      sortOrder: 0,
    });
  };

  const handleSelectLog = (id: number) => {
    if (isEditing && selectedLogId === id) return;
    setSelectedLogId(id);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!selectedLog) return;
    setEditForm({
      title: selectedLog.title,
      logDate: selectedLog.logDate ?? todayStr(),
      content: selectedLog.content ?? "",
      summary: selectedLog.summary ?? "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedLogId) return;
    updateMutation.mutate({
      id: selectedLogId,
      data: {
        title: editForm.title,
        logDate: editForm.logDate || undefined,
        content: editForm.content || undefined,
        summary: editForm.summary || undefined,
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("이 일지를 삭제하시겠습니까?")) return;
    deleteMutation.mutate(id);
  };

  // 이슈 연결 확인
  const handleConfirmLinkIssues = async (selectedIds: number[]) => {
    if (!selectedLogId) return;
    const toAdd = selectedIds.filter((id) => !linkedIssueIds.includes(id));
    const toRemove = linkedIssueIds.filter((id) => !selectedIds.includes(id));
    try {
      await Promise.all([
        ...toAdd.map((issueId) => devlogApi.linkIssue(selectedLogId, issueId)),
        ...toRemove.map((issueId) =>
          devlogApi.unlinkIssue(selectedLogId, issueId),
        ),
      ]);
      queryClient.invalidateQueries({
        queryKey: ["devlogs", selectedLogId, "linked-issues"],
      });
      toast.success("이슈 연결이 업데이트되었습니다.");
    } catch {
      toast.error("이슈 연결 중 오류가 발생했습니다.");
    }
    setLinkIssueOpen(false);
  };

  // 업무 연결 확인
  const handleConfirmLinkWorks = async (selectedIds: number[]) => {
    if (!selectedLogId) return;
    const toAdd = selectedIds.filter((id) => !linkedWorkIds.includes(id));
    const toRemove = linkedWorkIds.filter((id) => !selectedIds.includes(id));
    try {
      await Promise.all([
        ...toAdd.map((workId) => devlogApi.linkWork(selectedLogId, workId)),
        ...toRemove.map((workId) =>
          devlogApi.unlinkWork(selectedLogId, workId),
        ),
      ]);
      queryClient.invalidateQueries({
        queryKey: ["devlogs", selectedLogId, "linked-works"],
      });
      toast.success("업무 연결이 업데이트되었습니다.");
    } catch {
      toast.error("업무 연결 중 오류가 발생했습니다.");
    }
    setLinkWorkOpen(false);
  };

  // 이슈 연결 해제
  const handleUnlinkIssue = async (issueId: number) => {
    if (!selectedLogId) return;
    try {
      await devlogApi.unlinkIssue(selectedLogId, issueId);
      queryClient.invalidateQueries({
        queryKey: ["devlogs", selectedLogId, "linked-issues"],
      });
      toast.success("이슈 연결이 해제되었습니다.");
    } catch {
      toast.error("이슈 연결 해제에 실패했습니다.");
    }
  };

  // 업무 연결 해제
  const handleUnlinkWork = async (workId: number) => {
    if (!selectedLogId) return;
    try {
      await devlogApi.unlinkWork(selectedLogId, workId);
      queryClient.invalidateQueries({
        queryKey: ["devlogs", selectedLogId, "linked-works"],
      });
      toast.success("업무 연결이 해제되었습니다.");
    } catch {
      toast.error("업무 연결 해제에 실패했습니다.");
    }
  };

  // ─── 렌더링 ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-49px)] overflow-hidden bg-background">
      {/* 좌측 사이드바 */}
      <div
        className="flex flex-col bg-muted border-r border-border shrink-0"
        style={{ width: sidebarWidth }}
      >
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between px-3 border-b border-border h-[49px] shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              개발일지
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs gap-1"
            onClick={handleNewLog}
            disabled={createMutation.isPending}
          >
            <Plus className="w-3.5 h-3.5" />새 일지
          </Button>
        </div>

        {/* 일지 목록 */}
        <div className="flex-1 overflow-y-auto py-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <span className="text-xs text-muted-foreground">로딩 중...</span>
            </div>
          ) : sortedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2">
              <p className="text-xs text-muted-foreground">일지가 없습니다</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleNewLog}
              >
                <Plus className="w-3 h-3 mr-1" />첫 일지 작성
              </Button>
            </div>
          ) : (
            sortedLogs.map((log) => {
              const isSelected = log.id === selectedLogId;
              return (
                <LogItem
                  key={log.id}
                  log={log}
                  isSelected={isSelected}
                  onSelect={() => handleSelectLog(log.id)}
                  onDelete={() => handleDelete(log.id)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* 리사이즈 핸들 */}
      <div
        className="w-1 cursor-col-resize bg-border hover:bg-primary/40 transition-colors shrink-0"
        onMouseDown={handleResizeMouseDown}
      />

      {/* 우측 상세 패널 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedLog ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p className="text-sm">← 일지를 선택하세요</p>
            </div>
          </div>
        ) : isEditing ? (
          <EditPanel
            editForm={editForm}
            onChange={setEditForm}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={updateMutation.isPending}
          />
        ) : (
          <ViewPanel
            log={selectedLog}
            linkedIssues={linkedIssues}
            linkedWorks={linkedWorks}
            onEdit={handleEdit}
            onDelete={() => handleDelete(selectedLog.id)}
            onOpenLinkIssue={() => setLinkIssueOpen(true)}
            onOpenLinkWork={() => setLinkWorkOpen(true)}
            onUnlinkIssue={handleUnlinkIssue}
            onUnlinkWork={handleUnlinkWork}
          />
        )}
      </div>

      {/* 이슈 연결 다이얼로그 */}
      {linkIssueOpen && (
        <LinkDialog
          title="이슈 연결"
          items={allIssues}
          linkedIds={linkedIssueIds}
          onClose={() => setLinkIssueOpen(false)}
          onConfirm={handleConfirmLinkIssues}
          getLabel={(item) => item.title}
          getStatus={(item) => item.status}
          statusStyle={ISSUE_STATUS_STYLE}
        />
      )}

      {/* 업무 연결 다이얼로그 */}
      {linkWorkOpen && (
        <LinkDialog
          title="업무 연결"
          items={allWorks}
          linkedIds={linkedWorkIds}
          onClose={() => setLinkWorkOpen(false)}
          onConfirm={handleConfirmLinkWorks}
          getLabel={(item) => item.title}
          getStatus={(item) => item.status}
          statusStyle={WORK_STATUS_STYLE}
        />
      )}
    </div>
  );
}

// ─── 사이드바 항목 ────────────────────────────────────────────────────────────

interface LogItemProps {
  log: DevLog;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function LogItem({ log, isSelected, onSelect, onDelete }: LogItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col gap-0.5 px-3 py-2.5 cursor-pointer transition-colors border-l-[3px]",
        isSelected
          ? "border-l-primary bg-background"
          : "border-l-transparent hover:bg-background/60",
      )}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-xs text-muted-foreground">
        {formatLogDate(log)}
      </span>
      <span className="text-sm font-medium text-foreground truncate pr-6">
        {log.title}
      </span>

      {/* 삭제 버튼 (hover 시) */}
      {hovered && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── 뷰 패널 ─────────────────────────────────────────────────────────────────

interface ViewPanelProps {
  log: DevLog;
  linkedIssues: LinkableItem[];
  linkedWorks: LinkableItem[];
  onEdit: () => void;
  onDelete: () => void;
  onOpenLinkIssue: () => void;
  onOpenLinkWork: () => void;
  onUnlinkIssue: (id: number) => void;
  onUnlinkWork: (id: number) => void;
}

function ViewPanel({
  log,
  linkedIssues,
  linkedWorks,
  onEdit,
  onDelete,
  onOpenLinkIssue,
  onOpenLinkWork,
  onUnlinkIssue,
  onUnlinkWork,
}: ViewPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 border-b border-border h-[49px] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-muted-foreground shrink-0">
            {formatLogDate(log)}
          </span>
          <h2 className="text-sm font-semibold text-foreground truncate">
            {log.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs gap-1"
            onClick={onEdit}
          >
            <Edit2 className="w-3.5 h-3.5" />
            편집
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
            삭제
          </Button>
        </div>
      </div>

      {/* 본문 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* 본문 (오늘 한 일) */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              오늘 한 일
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {log.content ? (
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {log.content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              내용이 없습니다.
            </p>
          )}
        </section>

        {/* 연결된 이슈 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              연결된 이슈
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs gap-1"
              onClick={onOpenLinkIssue}
            >
              <Link className="w-3 h-3" />
              이슈 연결
            </Button>
          </div>
          {linkedIssues.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              연결된 이슈가 없습니다.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {linkedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center gap-1.5 bg-muted border border-border rounded-md px-2.5 py-1 text-xs"
                >
                  <span className="text-foreground font-medium truncate max-w-[160px]">
                    {issue.title}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      ISSUE_STATUS_STYLE[issue.status] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {issue.status}
                  </span>
                  <button
                    onClick={() => onUnlinkIssue(issue.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 연결된 업무 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              연결된 업무
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs gap-1"
              onClick={onOpenLinkWork}
            >
              <Link className="w-3 h-3" />
              업무 연결
            </Button>
          </div>
          {linkedWorks.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              연결된 업무가 없습니다.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {linkedWorks.map((work) => (
                <div
                  key={work.id}
                  className="flex items-center gap-1.5 bg-muted border border-border rounded-md px-2.5 py-1 text-xs"
                >
                  <span className="text-foreground font-medium truncate max-w-[160px]">
                    {work.title}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      WORK_STATUS_STYLE[work.status] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {work.status}
                  </span>
                  <button
                    onClick={() => onUnlinkWork(work.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 총평 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              총평
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {log.summary ? (
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {log.summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              총평이 없습니다.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── 편집 패널 ────────────────────────────────────────────────────────────────

interface EditForm {
  title: string;
  logDate: string;
  content: string;
  summary: string;
}

interface EditPanelProps {
  editForm: EditForm;
  onChange: (form: EditForm) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

function EditPanel({
  editForm,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: EditPanelProps) {
  const set =
    (field: keyof EditForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...editForm, [field]: e.target.value });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 border-b border-border h-[49px] shrink-0">
        <span className="text-sm font-semibold text-foreground">일지 편집</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs"
            onClick={onCancel}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      {/* 편집 폼 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* 제목 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            제목
          </label>
          <input
            type="text"
            value={editForm.title}
            onChange={set("title")}
            placeholder="일지 제목"
            className="w-full text-sm bg-background text-foreground placeholder:text-muted-foreground border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* 날짜 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            날짜
          </label>
          <input
            type="date"
            value={editForm.logDate}
            onChange={set("logDate")}
            className="text-sm bg-background text-foreground border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* 본문 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            오늘 한 일
          </label>
          <textarea
            value={editForm.content}
            onChange={set("content")}
            rows={8}
            placeholder="오늘 한 일을 기록하세요..."
            className="w-full text-sm bg-background text-foreground placeholder:text-muted-foreground border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
          />
        </div>

        {/* 총평 */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            총평
          </label>
          <textarea
            value={editForm.summary}
            onChange={set("summary")}
            rows={3}
            placeholder="오늘 하루 총평..."
            className="w-full text-sm bg-background text-foreground placeholder:text-muted-foreground border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
