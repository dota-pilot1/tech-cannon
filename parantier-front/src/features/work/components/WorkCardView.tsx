import { useMemo, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight, Eye, Clock, AlertTriangle } from "lucide-react";
import type {
  Work,
  WorkStatus,
  WorkPriority,
} from "@/entities/work/types/work";

// ─── 상수 (WorkPage와 동기화) ─────────────────────────────────────────────

const WORK_TYPE_LABELS: Record<string, string> = {
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

const WORK_TYPE_COLORS: Record<string, string> = {
  APACHE: "bg-amber-100 text-amber-800",
  DRONE: "bg-sky-100 text-sky-700",
  SNIPER: "bg-red-100 text-red-700",
  HAMMER: "bg-slate-100 text-slate-700",
  ROCKET: "bg-violet-100 text-violet-700",
  MISSILE: "bg-rose-100 text-rose-800",
  CANNON: "bg-orange-100 text-orange-700",
  SPEAR: "bg-red-100 text-red-700",
  SHIP: "bg-green-100 text-green-700",
  BOOK: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<WorkStatus, string> = {
  TODO: "진행 전",
  IN_PROGRESS: "진행 중",
  TEST: "테스트",
  DONE: "완료",
  HOLD: "보류",
  BLOCKED: "막힘",
};

const STATUS_CONFIG: Record<WorkStatus, { color: string; bgColor: string; progressColor: string; progress: number }> = {
  TODO: { color: "text-gray-600", bgColor: "bg-gray-50 border-gray-200", progressColor: "bg-gray-300", progress: 0 },
  IN_PROGRESS: { color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", progressColor: "bg-blue-500", progress: 40 },
  TEST: { color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200", progressColor: "bg-purple-500", progress: 70 },
  DONE: { color: "text-green-600", bgColor: "bg-green-50 border-green-200", progressColor: "bg-green-500", progress: 100 },
  HOLD: { color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200", progressColor: "bg-yellow-400", progress: 20 },
  BLOCKED: { color: "text-red-600", bgColor: "bg-red-50 border-red-200", progressColor: "bg-red-500", progress: 10 },
};

const PRIORITY_LABELS: Record<WorkPriority, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
  CRITICAL: "긴급",
};

const PRIORITY_CONFIG: Record<WorkPriority, { icon: string; color: string; dotColor: string }> = {
  CRITICAL: { icon: "🔥", color: "text-red-600 font-bold", dotColor: "bg-red-500" },
  HIGH: { icon: "⚡", color: "text-orange-600 font-semibold", dotColor: "bg-orange-400" },
  MEDIUM: { icon: "📌", color: "text-yellow-600", dotColor: "bg-yellow-400" },
  LOW: { icon: "💤", color: "text-gray-500", dotColor: "bg-gray-300" },
};

// ─── Props ────────────────────────────────────────────────────────────────

interface WorkCardViewProps {
  works: Work[];
  users: { id: number; username: string; email: string }[];
  onWorkClick: (workId: number) => void;
  onStatusChange: (workId: number, status: WorkStatus) => void;
  onAssigneeChange: (workId: number, assigneeId: number | null, assigneeName: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function WorkCardView({
  works,
  users,
  onWorkClick,
  onStatusChange,
  onAssigneeChange,
}: WorkCardViewProps) {
  // 담당자별 그룹핑
  const grouped = useMemo(() => {
    const map = new Map<string, { assigneeId: number | null; assigneeName: string; works: Work[] }>();

    // "미지정" 그룹
    map.set("__unassigned__", { assigneeId: null, assigneeName: "미지정", works: [] });

    works.forEach((w) => {
      const key = w.assigneeName || "__unassigned__";
      if (!map.has(key)) {
        map.set(key, { assigneeId: w.assigneeId ?? null, assigneeName: w.assigneeName || "미지정", works: [] });
      }
      map.get(key)!.works.push(w);
    });

    // 미지정 그룹이 비어있으면 제거
    if (map.get("__unassigned__")!.works.length === 0) {
      map.delete("__unassigned__");
    }

    return Array.from(map.values());
  }, [works]);

  return (
    <div className="h-full overflow-y-auto px-4 py-3 space-y-6">
      {grouped.length === 0 && (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          업무가 없습니다.
        </div>
      )}

      {grouped.map((group) => (
        <div key={group.assigneeName} className="space-y-3">
          {/* 그룹 헤더 */}
          <div className="flex items-center gap-2 pb-1 border-b border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {group.assigneeName.charAt(0)}
            </div>
            <span className="font-semibold text-sm">{group.assigneeName}</span>
            <Badge variant="secondary" className="text-xs">
              {group.works.length}건
            </Badge>
            {/* 상태 서머리 */}
            <div className="flex items-center gap-1 ml-auto">
              {(["TODO", "IN_PROGRESS", "TEST", "DONE", "HOLD", "BLOCKED"] as WorkStatus[]).map((s) => {
                const cnt = group.works.filter((w) => w.status === s).length;
                if (cnt === 0) return null;
                return (
                  <span key={s} className={cn("text-[10px] px-1.5 py-0.5 rounded", STATUS_CONFIG[s].bgColor, STATUS_CONFIG[s].color)}>
                    {STATUS_LABELS[s]} {cnt}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 카드 그리드 4열 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {group.works.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                users={users}
                onWorkClick={onWorkClick}
                onStatusChange={onStatusChange}
                onAssigneeChange={onAssigneeChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── WorkCard ─────────────────────────────────────────────────────────────

function WorkCard({
  work,
  users,
  onWorkClick,
  onStatusChange,
  onAssigneeChange,
}: {
  work: Work;
  users: { id: number; username: string; email: string }[];
  onWorkClick: (workId: number) => void;
  onStatusChange: (workId: number, status: WorkStatus) => void;
  onAssigneeChange: (workId: number, assigneeId: number | null, assigneeName: string) => void;
}) {
  const statusCfg = STATUS_CONFIG[work.status];
  const priorityCfg = PRIORITY_CONFIG[work.priority];
  const isOverdue = work.dueDate ? new Date(work.dueDate) < new Date() : false;
  const isDone = work.status === "DONE";

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:-translate-y-0.5",
        isDone ? "opacity-60 bg-muted/30 border-muted" : statusCfg.bgColor,
      )}
      onClick={() => onWorkClick(work.id)}
    >
      {/* 상단: 우선순위 + 상세 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs", priorityCfg.color)}>
          {priorityCfg.icon} {PRIORITY_LABELS[work.priority]}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWorkClick(work.id);
          }}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded hover:bg-background/80 transition-colors"
        >
          <Eye className="w-3 h-3" />
          상세
        </button>
      </div>

      {/* 제목 */}
      <h3 className={cn(
        "font-semibold text-sm mb-3 line-clamp-2 leading-tight",
        isDone && "line-through text-muted-foreground",
      )}>
        {work.title}
      </h3>

      {/* 진행 상태: 유형 배지 + 프로그레스 바 */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={cn("text-[10px] px-1.5 py-0 shrink-0", WORK_TYPE_COLORS[work.workType])}>
            {WORK_TYPE_LABELS[work.workType] || work.workType}
          </Badge>
          <div className="flex-1 flex items-center gap-1.5">
            <span className={cn("text-[11px] font-medium shrink-0", statusCfg.color)}>
              {STATUS_LABELS[work.status]}
            </span>
            <StatusSwitcher
              workId={work.id}
              currentStatus={work.status}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", statusCfg.progressColor)}
            style={{ width: `${statusCfg.progress}%` }}
          />
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        {/* 담당자 전환 */}
        <AssigneeSwitcher
          work={work}
          users={users}
          onAssigneeChange={onAssigneeChange}
        />

        {/* 마감일 */}
        {work.dueDate && (
          <div className={cn(
            "flex items-center gap-0.5",
            isOverdue && !isDone ? "text-red-500 font-medium" : ""
          )}>
            {isOverdue && !isDone ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span>
              {new Date(work.dueDate).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StatusSwitcher (카드 내 상태 빠른 전환) ──────────────────────────────

function StatusSwitcher({
  workId,
  currentStatus,
  onStatusChange,
}: {
  workId: number;
  currentStatus: WorkStatus;
  onStatusChange: (workId: number, status: WorkStatus) => void;
}) {
  const statusFlow: WorkStatus[] = ["TODO", "IN_PROGRESS", "TEST", "DONE"];
  const currentIdx = statusFlow.indexOf(currentStatus);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIdx < statusFlow.length - 1) {
      onStatusChange(workId, statusFlow[currentIdx + 1]);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIdx > 0) {
      onStatusChange(workId, statusFlow[currentIdx - 1]);
    }
  };

  // HOLD/BLOCKED는 주 흐름 밖이므로 다른 UI
  if (currentIdx === -1) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80"
          >
            변경
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-1.5" align="end">
          {statusFlow.map((s) => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onStatusChange(workId, s); }}
              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-accent"
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handlePrev}
        disabled={currentIdx <= 0}
        className="p-0.5 rounded hover:bg-background/80 disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>
      <button
        onClick={handleNext}
        disabled={currentIdx >= statusFlow.length - 1}
        className="p-0.5 rounded hover:bg-background/80 disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── AssigneeSwitcher (담당자 ⇄ 전환) ────────────────────────────────────

function AssigneeSwitcher({
  work,
  users,
  onAssigneeChange,
}: {
  work: Work;
  users: { id: number; username: string; email: string }[];
  onAssigneeChange: (workId: number, assigneeId: number | null, assigneeName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentIdx = users.findIndex((u) => u.id === work.assigneeId);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (users.length === 0) return;
    const prevIdx = currentIdx <= 0 ? users.length - 1 : currentIdx - 1;
    const user = users[prevIdx];
    onAssigneeChange(work.id, user.id, user.username);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (users.length === 0) return;
    const nextIdx = currentIdx >= users.length - 1 ? 0 : currentIdx + 1;
    const user = users[nextIdx];
    onAssigneeChange(work.id, user.id, user.username);
  };

  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handlePrev}
        className="p-0.5 rounded hover:bg-background/80"
        title="이전 담당자"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="text-xs px-1 py-0.5 rounded hover:bg-background/80 font-medium max-w-[60px] truncate">
            {work.assigneeName || "미지정"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1.5" align="start">
          <div className="max-h-40 overflow-y-auto space-y-0.5">
            <button
              onClick={() => {
                onAssigneeChange(work.id, null as unknown as number, "");
                setOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-accent text-muted-foreground"
            >
              미지정
            </button>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onAssigneeChange(work.id, u.id, u.username);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-xs rounded hover:bg-accent",
                  u.id === work.assigneeId && "bg-accent font-medium",
                )}
              >
                {u.username}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <button
        onClick={handleNext}
        className="p-0.5 rounded hover:bg-background/80"
        title="다음 담당자"
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
