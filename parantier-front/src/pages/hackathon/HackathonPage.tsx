import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@tanstack/react-store";
import {
  Trophy,
  Users,
  Clock,
  MessageSquare,
  Send,
  Figma,
  CheckSquare,
  AlertCircle,
  Github,
  HelpCircle,
  Plus,
  ChevronRight,
  Plug,
  X,
  Maximize2,
  Trash2,
  ExternalLink,
  Loader2,
  Pencil,
} from "lucide-react";
import { authStore } from "@/entities/user/model/authStore";
import { useActiveEvent } from "@/features/hackathon/hooks/useHackathon";
import { useHackathonChat } from "@/features/hackathon/hooks/useHackathonChat";
import {
  useTeamLinks,
  useAddLink,
  useDeleteLink,
  useTeamTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTeamIssues,
  useCreateIssue,
  useUpdateIssue,
  useTeamFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  useJoinTeam,
  useLeaveTeam,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "@/features/hackathon/hooks/useHackathon";
import type {
  HackathonTeamResponse,
  HackathonTeamTask,
  HackathonTeamIssue,
  HackathonTeamFaq,
} from "@/features/hackathon/types/hackathon.types";
import { HackathonApiDocPage } from "@/features/hackathon/components/HackathonApiDocPage";

// ── 팀 색상 테마 매핑 ─────────────────────────────────────────────────────────
const TEAM_THEMES: Record<
  string,
  { color: string; accent: string; border: string; dot: string }
> = {
  blue: {
    color: "from-blue-500/20 to-blue-600/5",
    accent: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/30",
    dot: "bg-blue-500",
  },
  emerald: {
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  violet: {
    color: "from-violet-500/20 to-violet-600/5",
    accent: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-500/30",
    dot: "bg-violet-500",
  },
  rose: {
    color: "from-rose-500/20 to-rose-600/5",
    accent: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-500/30",
    dot: "bg-rose-500",
  },
  amber: {
    color: "from-amber-500/20 to-amber-600/5",
    accent: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
};

const COLOR_OPTIONS = [
  {
    value: "blue",
    label: "블루",
    dot: "bg-blue-500",
    preview:
      "from-blue-500/20 to-blue-600/5 border-blue-200 dark:border-blue-500/30",
  },
  {
    value: "emerald",
    label: "그린",
    dot: "bg-emerald-500",
    preview:
      "from-emerald-500/20 to-emerald-600/5 border-emerald-200 dark:border-emerald-500/30",
  },
  {
    value: "violet",
    label: "바이올렛",
    dot: "bg-violet-500",
    preview:
      "from-violet-500/20 to-violet-600/5 border-violet-200 dark:border-violet-500/30",
  },
  {
    value: "rose",
    label: "로즈",
    dot: "bg-rose-500",
    preview:
      "from-rose-500/20 to-rose-600/5 border-rose-200 dark:border-rose-500/30",
  },
  {
    value: "amber",
    label: "앰버",
    dot: "bg-amber-500",
    preview:
      "from-amber-500/20 to-amber-600/5 border-amber-200 dark:border-amber-500/30",
  },
];

const DEFAULT_THEME = TEAM_THEMES.blue;

function getTheme(colorTheme?: string) {
  return TEAM_THEMES[colorTheme ?? ""] ?? DEFAULT_THEME;
}

// ── 탭 정의 ───────────────────────────────────────────────────────────────────
type TabId = "figma" | "task" | "issue" | "github" | "faq";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "figma", label: "Figma", icon: <Figma className="w-3.5 h-3.5" /> },
  { id: "task", label: "Task", icon: <CheckSquare className="w-3.5 h-3.5" /> },
  {
    id: "issue",
    label: "Issue",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  { id: "github", label: "GitHub", icon: <Github className="w-3.5 h-3.5" /> },
  { id: "faq", label: "Q&A", icon: <HelpCircle className="w-3.5 h-3.5" /> },
];

// ── 상태/우선순위 스타일 헬퍼 ─────────────────────────────────────────────────
const TASK_STATUS_STYLE: Record<string, string> = {
  TODO: "bg-muted text-muted-foreground",
  DOING: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  DONE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const TASK_STATUS_LABEL: Record<string, string> = {
  TODO: "할 일",
  DOING: "진행 중",
  DONE: "완료",
};

const PRIORITY_STYLE: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  LOW: "bg-muted text-muted-foreground",
};

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "높음",
  MEDIUM: "중간",
  LOW: "낮음",
};

const ISSUE_STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  IN_PROGRESS:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  CLOSED: "bg-muted text-muted-foreground",
};

const ISSUE_STATUS_LABEL: Record<string, string> = {
  OPEN: "오픈",
  IN_PROGRESS: "진행 중",
  CLOSED: "종료",
};

// ── 공통 다이얼로그 래퍼 ─────────────────────────────────────────────────────
// ── TeamFormDialog ────────────────────────────────────────────────────────────
function TeamFormDialog({
  eventId,
  team,
  onClose,
}: {
  eventId: number;
  team?: HackathonTeamResponse;
  onClose: () => void;
}) {
  const isEdit = !!team;
  const createTeam = useCreateTeam(eventId);
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const [form, setForm] = useState({
    name: team?.name ?? "",
    project: team?.project ?? "",
    colorTheme: team?.colorTheme ?? "blue",
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (isEdit) {
      updateTeam.mutate(
        { teamId: team!.id, req: form },
        { onSuccess: onClose },
      );
    } else {
      createTeam.mutate(form, { onSuccess: onClose });
    }
  };

  const handleDelete = () => {
    if (
      !confirm(
        `"${team!.name}" 팀을 삭제할까요?\n하위 데이터(링크/Task/Issue/FAQ)가 모두 삭제됩니다.`,
      )
    )
      return;
    deleteTeam.mutate(team!.id, { onSuccess: onClose });
  };

  const isPending =
    createTeam.isPending || updateTeam.isPending || deleteTeam.isPending;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-[440px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 h-12 border-b border-border shrink-0">
          <span className="text-sm font-semibold">
            {isEdit ? "팀 수정" : "팀 추가"}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              팀 이름 *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Team A"
              className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              프로젝트명
            </label>
            <input
              value={form.project}
              onChange={(e) =>
                setForm((p) => ({ ...p, project: e.target.value }))
              }
              placeholder="AI 코드 리뷰 어시스턴트"
              className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">
              색상 테마
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() =>
                    setForm((p) => ({ ...p, colorTheme: c.value }))
                  }
                  className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all ${
                    form.colorTheme === c.value
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${c.dot}`} />
                  <span className="text-[10px] text-muted-foreground">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`px-5 pb-5 flex items-center ${isEdit ? "justify-between" : "justify-end"} gap-2`}
        >
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              팀 삭제
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !form.name.trim()}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? "처리 중..." : isEdit ? "저장" : "추가"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── AddTeamCard ───────────────────────────────────────────────────────────────
function AddTeamCard({ eventId }: { eventId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-full min-h-[200px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all gap-3 text-muted-foreground hover:text-primary"
      >
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium">팀 추가</span>
      </button>
      {open && (
        <TeamFormDialog eventId={eventId} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function Dialog({
  title,
  onClose,
  children,
  width = "w-[560px]",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 ${width} max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
      >
        <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-border">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
      {icon}
      <p className="text-xs font-medium text-foreground/60">{label}</p>
      <p className="text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}

// ── Figma 탭 ─────────────────────────────────────────────────────────────────
function FigmaTab({ teamId }: { teamId: number }) {
  const { data: links = [], isLoading } = useTeamLinks(teamId);
  const addLink = useAddLink(teamId);
  const deleteLink = useDeleteLink(teamId);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", url: "" });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = links.filter((l) => l.linkType === "figma");
  const selected = filtered.find((l) => l.id === selectedId);

  const handleAdd = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    addLink.mutate(
      { linkType: "figma", title: form.title.trim(), url: form.url.trim() },
      {
        onSuccess: () => {
          setAddOpen(false);
          setForm({ title: "", url: "" });
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">
          {filtered.length}개
        </span>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80"
        >
          <Plus className="w-3 h-3" /> 추가
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Figma className="w-8 h-8 opacity-20" />}
          label="Figma 링크 없음"
          desc="팀의 디자인 파일을 등록하세요"
        />
      ) : (
        filtered.map((f) => (
          <div
            key={f.id}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors group"
          >
            <Figma className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <button
              className="flex-1 min-w-0 text-left"
              onClick={() => setSelectedId(f.id)}
            >
              <p className="text-xs font-medium text-foreground truncate">
                {f.title}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {f.url}
              </p>
            </button>
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-colors"
              title="열기"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
            <button
              onClick={() => deleteLink.mutate(f.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-colors"
              title="삭제"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </button>
          </div>
        ))
      )}

      {addOpen && (
        <Dialog title="Figma 링크 추가" onClose={() => setAddOpen(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                제목
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="메인 화면 디자인"
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Figma URL
              </label>
              <input
                value={form.url}
                onChange={(e) =>
                  setForm((p) => ({ ...p, url: e.target.value }))
                }
                placeholder="https://figma.com/file/..."
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={addLink.isPending}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {selected && (
        <Dialog title={selected.title} onClose={() => setSelectedId(null)}>
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Figma URL</p>
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {selected.url}
              </a>
            </div>
            <a
              href={selected.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Figma에서 열기
            </a>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ── Task 탭 ──────────────────────────────────────────────────────────────────
function TaskTab({ teamId }: { teamId: number }) {
  const { data: tasks = [], isLoading } = useTeamTasks(teamId);
  const createTask = useCreateTask(teamId);
  const updateTask = useUpdateTask(teamId);
  const deleteTask = useDeleteTask(teamId);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<HackathonTeamTask | null>(
    null,
  );
  const [form, setForm] = useState({ title: "", status: "TODO" });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    createTask.mutate(
      { title: form.title.trim(), status: form.status },
      {
        onSuccess: () => {
          setAddOpen(false);
          setForm({ title: "", status: "TODO" });
        },
      },
    );
  };

  const handleStatusChange = (task: HackathonTeamTask, status: string) => {
    updateTask.mutate({
      taskId: task.id,
      req: {
        title: task.title,
        status,
        assigneeId: task.assigneeId,
        dueAt: task.dueAt,
      },
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );

  const columns = ["TODO", "DOING", "DONE"] as const;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">
          {tasks.length}개
        </span>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80"
        >
          <Plus className="w-3 h-3" /> Task 추가
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8 opacity-20" />}
          label="Task 없음"
          desc="팀의 할 일을 등록하세요"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            if (colTasks.length === 0) return null;
            return (
              <div key={col}>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TASK_STATUS_STYLE[col]}`}
                  >
                    {TASK_STATUS_LABEL[col]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {colTasks.length}
                  </span>
                </div>
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors mb-1 group"
                  >
                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() => setSelectedTask(t)}
                    >
                      <p className="text-xs font-medium text-foreground truncate">
                        {t.title}
                      </p>
                      {t.assigneeName && (
                        <p className="text-[10px] text-muted-foreground">
                          담당: {t.assigneeName}
                        </p>
                      )}
                    </button>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t, e.target.value)}
                      className="text-[10px] bg-muted border-0 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {columns.map((s) => (
                        <option key={s} value={s}>
                          {TASK_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteTask.mutate(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {addOpen && (
        <Dialog title="Task 추가" onClose={() => setAddOpen(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                제목
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Task 제목"
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                상태
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {["TODO", "DOING", "DONE"].map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={createTask.isPending}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {selectedTask && (
        <Dialog
          title={selectedTask.title}
          onClose={() => setSelectedTask(null)}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${TASK_STATUS_STYLE[selectedTask.status]}`}
              >
                {TASK_STATUS_LABEL[selectedTask.status]}
              </span>
              {selectedTask.assigneeName && (
                <span className="text-xs text-muted-foreground">
                  담당: {selectedTask.assigneeName}
                </span>
              )}
            </div>
            {selectedTask.dueAt && (
              <p className="text-xs text-muted-foreground">
                마감: {new Date(selectedTask.dueAt).toLocaleDateString("ko-KR")}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <select
                defaultValue={selectedTask.status}
                onChange={(e) => {
                  handleStatusChange(selectedTask, e.target.value);
                  setSelectedTask(null);
                }}
                className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {["TODO", "DOING", "DONE"].map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ── Issue 탭 ─────────────────────────────────────────────────────────────────
function IssueTab({ teamId }: { teamId: number }) {
  const { data: issues = [], isLoading } = useTeamIssues(teamId);
  const createIssue = useCreateIssue(teamId);
  const updateIssue = useUpdateIssue(teamId);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<HackathonTeamIssue | null>(
    null,
  );
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "MEDIUM",
    status: "OPEN",
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    createIssue.mutate(
      {
        title: form.title.trim(),
        content: form.content,
        priority: form.priority,
        status: form.status,
      },
      {
        onSuccess: () => {
          setAddOpen(false);
          setForm({
            title: "",
            content: "",
            priority: "MEDIUM",
            status: "OPEN",
          });
        },
      },
    );
  };

  const handleStatusChange = (issue: HackathonTeamIssue, status: string) => {
    updateIssue.mutate({
      issueId: issue.id,
      req: {
        title: issue.title,
        content: issue.content,
        priority: issue.priority,
        status,
        assigneeId: issue.assigneeId,
      },
    });
    if (selectedIssue?.id === issue.id)
      setSelectedIssue((p) =>
        p ? { ...p, status: status as HackathonTeamIssue["status"] } : null,
      );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">
          {issues.length}개
        </span>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80"
        >
          <Plus className="w-3 h-3" /> Issue 등록
        </button>
      </div>
      {issues.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 opacity-20" />}
          label="이슈 없음"
          desc="팀의 이슈를 등록하세요"
        />
      ) : (
        issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors group"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <button
              className="flex-1 min-w-0 text-left"
              onClick={() => setSelectedIssue(issue)}
            >
              <p className="text-xs font-medium text-foreground truncate">
                {issue.title}
              </p>
            </button>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${PRIORITY_STYLE[issue.priority]}`}
            >
              {PRIORITY_LABEL[issue.priority]}
            </span>
            <select
              value={issue.status}
              onChange={(e) => handleStatusChange(issue, e.target.value)}
              className="text-[10px] bg-muted border-0 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {["OPEN", "IN_PROGRESS", "CLOSED"].map((s) => (
                <option key={s} value={s}>
                  {ISSUE_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        ))
      )}

      {addOpen && (
        <Dialog title="이슈 등록" onClose={() => setAddOpen(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                제목
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="이슈 제목"
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                내용 (선택)
              </label>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="상세 내용..."
                rows={3}
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  우선순위
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, priority: e.target.value }))
                  }
                  className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {["HIGH", "MEDIUM", "LOW"].map((s) => (
                    <option key={s} value={s}>
                      {PRIORITY_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  상태
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                  className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {["OPEN", "IN_PROGRESS", "CLOSED"].map((s) => (
                    <option key={s} value={s}>
                      {ISSUE_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={createIssue.isPending}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                등록
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {selectedIssue && (
        <Dialog
          title={selectedIssue.title}
          onClose={() => setSelectedIssue(null)}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLE[selectedIssue.priority]}`}
              >
                {PRIORITY_LABEL[selectedIssue.priority]}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${ISSUE_STATUS_STYLE[selectedIssue.status]}`}
              >
                {ISSUE_STATUS_LABEL[selectedIssue.status]}
              </span>
            </div>
            {selectedIssue.content && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-foreground whitespace-pre-wrap">
                  {selectedIssue.content}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <select
                defaultValue={selectedIssue.status}
                onChange={(e) =>
                  handleStatusChange(selectedIssue, e.target.value)
                }
                className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {["OPEN", "IN_PROGRESS", "CLOSED"].map((s) => (
                  <option key={s} value={s}>
                    {ISSUE_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ── GitHub 탭 ─────────────────────────────────────────────────────────────────
function GithubTab({ teamId }: { teamId: number }) {
  const { data: links = [], isLoading } = useTeamLinks(teamId);
  const addLink = useAddLink(teamId);
  const deleteLink = useDeleteLink(teamId);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", url: "" });

  const filtered = links.filter((l) => l.linkType === "github");

  const handleAdd = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    addLink.mutate(
      { linkType: "github", title: form.title.trim(), url: form.url.trim() },
      {
        onSuccess: () => {
          setAddOpen(false);
          setForm({ title: "", url: "" });
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">
          {filtered.length}개
        </span>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80"
        >
          <Plus className="w-3 h-3" /> GitHub 연결
        </button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Github className="w-8 h-8 opacity-20" />}
          label="GitHub 링크 없음"
          desc="레포지토리 링크를 등록하세요"
        />
      ) : (
        filtered.map((g) => (
          <div
            key={g.id}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors group"
          >
            <Github className="w-3.5 h-3.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {g.title}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {g.url}
              </p>
            </div>
            <a
              href={g.url}
              target="_blank"
              rel="noreferrer"
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
            <button
              onClick={() => deleteLink.mutate(g.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </button>
          </div>
        ))
      )}

      {addOpen && (
        <Dialog title="GitHub 레포 연결" onClose={() => setAddOpen(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                이름
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="메인 레포지토리"
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                GitHub URL
              </label>
              <input
                value={form.url}
                onChange={(e) =>
                  setForm((p) => ({ ...p, url: e.target.value }))
                }
                placeholder="https://github.com/..."
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={addLink.isPending}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                연결
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ── FAQ 탭 ───────────────────────────────────────────────────────────────────
function FaqTab({ teamId }: { teamId: number }) {
  const { data: faqs = [], isLoading } = useTeamFaqs(teamId);
  const createFaq = useCreateFaq(teamId);
  const updateFaq = useUpdateFaq(teamId);
  const deleteFaq = useDeleteFaq(teamId);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<HackathonTeamFaq | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [editForm, setEditForm] = useState({ question: "", answer: "" });

  const handleAdd = () => {
    if (!form.question.trim()) return;
    createFaq.mutate(
      {
        question: form.question.trim(),
        answer: form.answer.trim() || undefined,
        orderNum: faqs.length,
      },
      {
        onSuccess: () => {
          setAddOpen(false);
          setForm({ question: "", answer: "" });
        },
      },
    );
  };

  const handleEdit = () => {
    if (!editItem || !editForm.question.trim()) return;
    updateFaq.mutate(
      {
        faqId: editItem.id,
        req: {
          question: editForm.question.trim(),
          answer: editForm.answer.trim() || undefined,
          orderNum: editItem.orderNum,
        },
      },
      {
        onSuccess: () => setEditItem(null),
      },
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">
          {faqs.length}개
        </span>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80"
        >
          <Plus className="w-3 h-3" /> Q&A 추가
        </button>
      </div>
      {faqs.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="w-8 h-8 opacity-20" />}
          label="Q&A 없음"
          desc="자주 묻는 질문을 등록하세요"
        />
      ) : (
        faqs.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-border bg-background overflow-hidden"
          >
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors group"
              onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <p className="flex-1 text-xs font-medium text-foreground text-left">
                Q. {q.question}
              </p>
              {!q.answer && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 shrink-0">
                  미답변
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditItem(q);
                  setEditForm({ question: q.question, answer: q.answer ?? "" });
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFaq.mutate(q.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
            {expandedId === q.id && (
              <div className="px-3 pb-3 border-t border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-2 mb-1">
                  Answer
                </p>
                {q.answer ? (
                  <p className="text-xs text-foreground whitespace-pre-wrap">
                    {q.answer}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    아직 답변이 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {addOpen && (
        <Dialog title="Q&A 추가" onClose={() => setAddOpen(false)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                질문
              </label>
              <input
                value={form.question}
                onChange={(e) =>
                  setForm((p) => ({ ...p, question: e.target.value }))
                }
                placeholder="질문을 입력하세요"
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                답변 (선택)
              </label>
              <textarea
                value={form.answer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, answer: e.target.value }))
                }
                placeholder="답변을 입력하세요"
                rows={3}
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setAddOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={createFaq.isPending}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {editItem && (
        <Dialog title="Q&A 수정" onClose={() => setEditItem(null)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                질문
              </label>
              <input
                value={editForm.question}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, question: e.target.value }))
                }
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                답변
              </label>
              <textarea
                value={editForm.answer}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, answer: e.target.value }))
                }
                rows={4}
                className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setEditItem(null)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                disabled={updateFaq.isPending}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ── API 문서 다이얼로그 ────────────────────────────────────────────────────────
function ApiDocDialog({
  teamId,
  teamName,
  onClose,
}: {
  teamId: number;
  teamName: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{teamName} · API 문서</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            팀 전용
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted"
        >
          <X className="w-4 h-4" /> 닫기
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <HackathonApiDocPage teamId={teamId} teamName={teamName} />
      </div>
    </div>,
    document.body,
  );
}

// ── 팀 카드 ───────────────────────────────────────────────────────────────────
function TeamCard({
  team,
  currentUserId,
  isAdmin,
  eventId,
}: {
  team: HackathonTeamResponse;
  currentUserId?: number;
  isAdmin?: boolean;
  eventId: number;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("figma");
  const [apiDocOpen, setApiDocOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const theme = getTheme(team.colorTheme);
  const joinTeam = useJoinTeam();
  const leaveTeam = useLeaveTeam();

  const isMember =
    !!currentUserId && team.members.some((m) => m.userId === currentUserId);

  return (
    <div
      className={`flex flex-col rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.color} bg-card shadow-sm overflow-hidden`}
      style={{ minHeight: "420px" }}
    >
      {/* 카드 헤더 */}
      <div className="shrink-0 px-5 py-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dot}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${theme.accent}`}>
                  {team.name}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => setEditOpen(true)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="팀 수정"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {team.members.length}명
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {team.project || "프로젝트 미설정"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {team.members.slice(0, 5).map((m) => (
                <div
                  key={m.userId}
                  className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
                  title={m.username}
                >
                  {m.username[0]}
                </div>
              ))}
            </div>
            {currentUserId &&
              team.id !== 0 &&
              (isMember ? (
                <button
                  onClick={() =>
                    leaveTeam.mutate({ teamId: team.id, userId: currentUserId })
                  }
                  disabled={leaveTeam.isPending}
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 shrink-0"
                >
                  {leaveTeam.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  탈퇴
                </button>
              ) : (
                <button
                  onClick={() =>
                    joinTeam.mutate({ teamId: team.id, userId: currentUserId })
                  }
                  disabled={joinTeam.isPending}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg ${theme.accent} bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 shrink-0`}
                >
                  {joinTeam.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  참가
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* 탭 헤더 */}
      <div className="shrink-0 flex items-center px-3 pt-2 border-b border-border/60 bg-muted/10">
        <div className="flex items-center gap-0.5 flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${activeTab === tab.id ? `${theme.accent} border-b-2 border-current bg-background/60` : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setApiDocOpen(true)}
          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 mb-1"
        >
          <Plug className="w-3 h-3" />
          API
          <Maximize2 className="w-2.5 h-2.5 opacity-60" />
        </button>
      </div>

      {editOpen && (
        <TeamFormDialog
          eventId={eventId}
          team={team}
          onClose={() => setEditOpen(false)}
        />
      )}
      {apiDocOpen && (
        <ApiDocDialog
          teamId={team.id}
          teamName={team.name}
          onClose={() => setApiDocOpen(false)}
        />
      )}

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "figma" && <FigmaTab teamId={team.id} />}
        {activeTab === "task" && <TaskTab teamId={team.id} />}
        {activeTab === "issue" && <IssueTab teamId={team.id} />}
        {activeTab === "github" && <GithubTab teamId={team.id} />}
        {activeTab === "faq" && <FaqTab teamId={team.id} />}
      </div>
    </div>
  );
}

// ── 카운트다운 타이머 훅 ──────────────────────────────────────────────────────
function useCountdown(endAt: string | null) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!endAt) return;
    const calc = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("종료");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return remaining;
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export function HackathonPage() {
  const auth = useStore(authStore, (s) => s);
  const isAdmin = auth.user?.role === "ROLE_ADMIN";
  const { data: event, isLoading: eventLoading } = useActiveEvent();

  const eventId = event?.id ?? null;
  const endAt = event?.endAt ?? null;
  useCountdown(endAt);

  const { messages, isConnected, sendMessage } = useHackathonChat({
    userId: auth.user?.id,
    username: auth.user?.username,
    eventId,
  });

  const [message, setMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 오면 스크롤 아래로
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage("");
  }, [message, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const teams = event?.teams ?? [];

  // 이벤트 없을 때 폴백 팀 (더미 UI 유지)
  const displayTeams: HackathonTeamResponse[] =
    teams.length > 0
      ? teams
      : [
          {
            id: 0,
            eventId: 0,
            name: "Team A",
            project: "AI 코드 리뷰 어시스턴트",
            colorTheme: "blue",
            orderNum: 0,
            createdAt: "",
            members: [],
          },
          {
            id: 0,
            eventId: 0,
            name: "Team B",
            project: "실시간 협업 화이트보드",
            colorTheme: "emerald",
            orderNum: 1,
            createdAt: "",
            members: [],
          },
        ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-muted/30 p-4 gap-4 overflow-hidden">
      {/* ── 상단 요약 카드 ─────────────────────────────────────────────────── */}
      <div className="shrink-0 grid grid-cols-4 gap-3">
        {[
          {
            icon: <Trophy className="w-4 h-4 text-muted-foreground/40" />,
            bg: "bg-muted/30",
            label: "참가 팀",
          },
          {
            icon: <Users className="w-4 h-4 text-muted-foreground/40" />,
            bg: "bg-muted/30",
            label: "참가 인원",
          },
          {
            icon: <Clock className="w-4 h-4 text-muted-foreground/40" />,
            bg: "bg-muted/30",
            label: "남은 시간",
          },
          {
            icon: (
              <MessageSquare className="w-4 h-4 text-muted-foreground/40" />
            ),
            bg: "bg-muted/30",
            label: "채팅",
          },
        ].map(({ icon, bg, label }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}
            >
              {icon}
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="text-sm font-medium text-muted-foreground/50">
                구현 예정
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 본문 ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* 왼쪽: 팀 카드들 (1열 세로 스크롤) */}
        <div className="flex-1 overflow-y-auto">
          {eventLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayTeams.map((team, idx) => (
                <TeamCard
                  key={team.id || idx}
                  team={team}
                  currentUserId={auth.user?.id}
                  isAdmin={isAdmin}
                  eventId={eventId ?? 0}
                />
              ))}
              {isAdmin && eventId && <AddTeamCard eventId={eventId} />}
            </div>
          )}
        </div>

        {/* 오른쪽: 오픈 채팅 */}
        <div className="w-[520px] shrink-0 flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b border-border bg-muted/20">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">오픈 채팅</p>
              <p className="text-[10px] text-muted-foreground">전체 참가자</p>
            </div>
            <span
              className={`flex items-center gap-1 text-[10px] font-medium shrink-0 ${isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${isConnected ? "bg-emerald-500" : "bg-muted-foreground"}`}
              />
              {isConnected ? "Live" : "연결 중"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
            {messages.map((msg, idx) => {
              const isMe = msg.userId === auth.user?.id;
              const time = new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return isMe ? (
                <div
                  key={msg.id ?? idx}
                  className="flex flex-col items-end gap-0.5"
                >
                  <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-1.5 text-xs">
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    {time}
                  </span>
                </div>
              ) : (
                <div key={msg.id ?? idx} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {(msg.username ?? "?")[0]}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {msg.username}
                    </span>
                    <div className="max-w-[85%] bg-muted text-foreground rounded-2xl rounded-tl-sm px-3 py-1.5 text-xs">
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      {time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          <div className="shrink-0 px-3 py-3 border-t border-border">
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지 입력..."
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || !isConnected}
                className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity shrink-0"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
