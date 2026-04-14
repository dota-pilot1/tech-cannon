import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Badge } from "@/shared/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { ChevronLeft, ChevronRight, Eye, Clock, AlertTriangle, CheckCircle2, Undo2 } from "lucide-react";
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
  const IN_PROGRESS_ORDER: WorkStatus[] = ["IN_PROGRESS", "TODO", "TEST", "HOLD", "BLOCKED"];

  const { incomplete, done } = useMemo(() => {
    const doneWorks = works
      .filter((w) => w.status === "DONE")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const statusGroups = IN_PROGRESS_ORDER
      .map((status) => ({
        status,
        works: works.filter((w) => w.status === status),
      }))
      .filter((g) => g.works.length > 0);

    return { incomplete: statusGroups, done: doneWorks };
  }, [works]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<WorkStatus>>(new Set());
  const [activeWork, setActiveWork] = useState<Work | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const toggleGroup = (status: WorkStatus) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const work = works.find((w) => w.id === Number(event.active.id));
    setActiveWork(work || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveWork(null);
    const { active, over } = event;
    if (!over) return;

    const workId = Number(active.id);
    const dropZone = over.id as string;
    const work = works.find((w) => w.id === workId);
    if (!work) return;

    if (dropZone === "zone-done" && work.status !== "DONE") {
      onStatusChange(workId, "DONE");
    } else if (dropZone === "zone-incomplete" && work.status === "DONE") {
      onStatusChange(workId, "TODO");
    }
  };

  const totalIncomplete = incomplete.reduce((sum, g) => sum + g.works.length, 0);

  if (works.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        업무가 없습니다.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-y-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* ── 왼쪽: 미완료 (드롭 영역) ── */}
          <DroppableZone id="zone-incomplete" isOver={activeWork?.status === "DONE"} className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* 헤더 */}
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-2 h-5 rounded-full bg-blue-500" />
                <span className="font-bold text-sm">진행 중</span>
                <Badge variant="secondary" className="text-xs">{totalIncomplete}건</Badge>
                <div className="flex items-center gap-1 ml-auto">
                  {incomplete.map((g) => (
                    <span key={g.status} className={cn("text-[10px] px-1.5 py-0.5 rounded", STATUS_CONFIG[g.status].bgColor, STATUS_CONFIG[g.status].color)}>
                      {STATUS_LABELS[g.status]} {g.works.length}
                    </span>
                  ))}
                </div>
              </div>

              {/* 상태별 소그룹 */}
              {totalIncomplete === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  미완료 업무가 없습니다
                </div>
              ) : (
                incomplete.map((group) => (
                  <div key={group.status} className="space-y-2">
                    <button
                      onClick={() => toggleGroup(group.status)}
                      className="flex items-center gap-2 w-full text-left group/header"
                    >
                      <ChevronRight
                        className={cn(
                          "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                          !collapsedGroups.has(group.status) && "rotate-90",
                        )}
                      />
                      <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[group.status].progressColor)} />
                      <span className={cn("text-xs font-semibold", STATUS_CONFIG[group.status].color)}>
                        {STATUS_LABELS[group.status]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({group.works.length})</span>
                    </button>

                    {!collapsedGroups.has(group.status) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-5">
                        {group.works.map((work) => (
                          <DraggableWorkCard
                            key={work.id}
                            work={work}
                            users={users}
                            onWorkClick={onWorkClick}
                            onStatusChange={onStatusChange}
                            onAssigneeChange={onAssigneeChange}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </DroppableZone>

          {/* ── 구분선 ── */}
          <div className="hidden lg:block w-px bg-border shrink-0" />

          {/* ── 오른쪽: 완료 (드롭 영역) ── */}
          <DroppableZone id="zone-done" isOver={activeWork !== null && activeWork.status !== "DONE"} className="flex-1 min-w-0">
            <div className="space-y-4">
              {/* 헤더 */}
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-2 h-5 rounded-full bg-green-500" />
                <span className="font-bold text-sm">완료</span>
                <Badge variant="secondary" className="text-xs">{done.length}건</Badge>
              </div>

              {done.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  {activeWork && activeWork.status !== "DONE"
                    ? "여기에 놓으면 완료 처리됩니다"
                    : "완료된 업무가 없습니다"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {done.map((work) => (
                    <DraggableWorkCard
                      key={work.id}
                      work={work}
                      users={users}
                      onWorkClick={onWorkClick}
                      onStatusChange={onStatusChange}
                      onAssigneeChange={onAssigneeChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </DroppableZone>
        </div>
      </div>

      {/* 드래그 오버레이 */}
      <DragOverlay>
        {activeWork && <DragOverlayCard work={activeWork} />}
      </DragOverlay>
    </DndContext>
  );
}

// ─── DroppableZone ───────────────────────────────────────────────────────

function DroppableZone({
  id,
  isOver: shouldHighlight,
  className: extraClassName,
  children,
}: {
  id: string;
  isOver: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const highlight = isOver && shouldHighlight;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl transition-all duration-200",
        highlight && id === "zone-done" && "ring-2 ring-green-400/50 bg-green-50/30",
        highlight && id === "zone-incomplete" && "ring-2 ring-blue-400/50 bg-blue-50/30",
        extraClassName,
      )}
    >
      {children}
    </div>
  );
}

// ─── DragOverlayCard (드래그 중 미리보기) ────────────────────────────────

function DragOverlayCard({ work }: { work: Work }) {
  const priorityCfg = PRIORITY_CONFIG[work.priority];
  const statusCfg = STATUS_CONFIG[work.status];

  return (
    <div className={cn(
      "rounded-xl border-2 border-primary p-4 shadow-xl w-[280px] rotate-2 opacity-90",
      statusCfg.bgColor,
    )}>
      <div className="flex items-center gap-1 mb-2">
        <span className={cn("text-xs", priorityCfg.color)}>
          {priorityCfg.icon} {PRIORITY_LABELS[work.priority]}
        </span>
      </div>
      <p className="text-sm font-semibold line-clamp-2">{work.title}</p>
      <div className="flex items-center justify-between mt-2">
        <Badge className={cn("text-[10px] px-1.5 py-0", WORK_TYPE_COLORS[work.workType])}>
          {WORK_TYPE_LABELS[work.workType] || work.workType}
        </Badge>
        {work.assigneeName && (
          <span className="text-[10px] text-muted-foreground">{work.assigneeName}</span>
        )}
      </div>
    </div>
  );
}

// ─── DraggableWorkCard (드래그 가능한 카드 래퍼) ─────────────────────────

function DraggableWorkCard(props: {
  work: Work;
  users: { id: number; username: string; email: string }[];
  onWorkClick: (workId: number) => void;
  onStatusChange: (workId: number, status: WorkStatus) => void;
  onAssigneeChange: (workId: number, assigneeId: number | null, assigneeName: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.work.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-30")}
      {...attributes}
      {...listeners}
    >
      <WorkCard {...props} />
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
        statusCfg.bgColor,
      )}
      onClick={() => onWorkClick(work.id)}
    >
      {/* 상단: 우선순위 + 완료/되돌리기 + 상세 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs", priorityCfg.color)}>
          {priorityCfg.icon} {PRIORITY_LABELS[work.priority]}
        </span>
        <div className="flex items-center gap-1">
          {/* 완료/되돌리기 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(work.id, isDone ? "TODO" : "DONE");
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              "flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded transition-colors",
              isDone
                ? "text-yellow-600 hover:bg-yellow-100"
                : "text-green-600 hover:bg-green-100",
            )}
            title={isDone ? "진행 전으로 되돌리기" : "완료 처리"}
          >
            {isDone ? <Undo2 className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {isDone ? "되돌리기" : "완료"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWorkClick(work.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded hover:bg-background/80 transition-colors"
          >
            <Eye className="w-3 h-3" />
            상세
          </button>
        </div>
      </div>

      {/* 제목 */}
      <h3 className={cn(
        "font-semibold text-sm mb-3 line-clamp-2 leading-tight",
        isDone && "line-through text-muted-foreground",
      )}>
        {work.title}
      </h3>

      {/* 진행 상태: 프로그레스 바 + 유형 배지 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[11px] font-medium shrink-0", statusCfg.color)}>
              {STATUS_LABELS[work.status]}
            </span>
            <StatusSwitcher
              workId={work.id}
              currentStatus={work.status}
              onStatusChange={onStatusChange}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className={cn("text-[10px] px-1.5 py-0 shrink-0", WORK_TYPE_COLORS[work.workType])}>
              {WORK_TYPE_LABELS[work.workType] || work.workType}
            </Badge>
            {work.prize > 0 && (
              <span className="text-[10px] font-semibold text-amber-600">{work.prize.toLocaleString()}원</span>
            )}
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
