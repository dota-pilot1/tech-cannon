import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { Eye, Clock, AlertTriangle } from "lucide-react";
import type { Work, WorkStatus, WorkPriority } from "@/entities/work/types/work";

// ─── 상수 ─────────────────────────────────────────────────────────────────

const WORK_TYPE_LABELS: Record<string, string> = {
  APACHE: "🚁 아파치", DRONE: "🛸 드론", SNIPER: "🎯 저격총",
  HAMMER: "🔨 망치", ROCKET: "🚀 로켓", MISSILE: "💥 미사일",
  CANNON: "💣 캐논", SPEAR: "🔫 작살", SHIP: "⛵ 배", BOOK: "📚 책",
};

const WORK_TYPE_COLORS: Record<string, string> = {
  APACHE: "bg-amber-100 text-amber-800", DRONE: "bg-sky-100 text-sky-700",
  SNIPER: "bg-red-100 text-red-700", HAMMER: "bg-slate-100 text-slate-700",
  ROCKET: "bg-violet-100 text-violet-700", MISSILE: "bg-rose-100 text-rose-800",
  CANNON: "bg-orange-100 text-orange-700", SPEAR: "bg-red-100 text-red-700",
  SHIP: "bg-green-100 text-green-700", BOOK: "bg-emerald-100 text-emerald-700",
};

const PRIORITY_CONFIG: Record<WorkPriority, { icon: string; color: string }> = {
  CRITICAL: { icon: "🔥", color: "text-red-600 font-bold" },
  HIGH: { icon: "⚡", color: "text-orange-600 font-semibold" },
  MEDIUM: { icon: "📌", color: "text-yellow-600" },
  LOW: { icon: "💤", color: "text-gray-500" },
};

const PRIORITY_LABELS: Record<WorkPriority, string> = {
  LOW: "낮음", MEDIUM: "보통", HIGH: "높음", CRITICAL: "긴급",
};

interface ColumnConfig {
  id: WorkStatus;
  title: string;
  color: string;
  headerBg: string;
  dotColor: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: "TODO", title: "진행 전", color: "text-gray-700", headerBg: "bg-gray-50 border-gray-200", dotColor: "bg-gray-400" },
  { id: "IN_PROGRESS", title: "진행 중", color: "text-blue-700", headerBg: "bg-blue-50 border-blue-200", dotColor: "bg-blue-500" },
  { id: "TEST", title: "테스트", color: "text-purple-700", headerBg: "bg-purple-50 border-purple-200", dotColor: "bg-purple-500" },
  { id: "DONE", title: "완료", color: "text-green-700", headerBg: "bg-green-50 border-green-200", dotColor: "bg-green-500" },
];

// ─── Props ────────────────────────────────────────────────────────────────

interface WorkKanbanViewProps {
  works: Work[];
  onWorkClick: (workId: number) => void;
  onStatusChange: (workId: number, status: WorkStatus) => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function WorkKanbanView({ works, onWorkClick, onStatusChange }: WorkKanbanViewProps) {
  const [activeWork, setActiveWork] = useState<Work | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // HOLD/BLOCKED 업무는 별도 처리
  const holdBlockedWorks = works.filter((w) => w.status === "HOLD" || w.status === "BLOCKED");

  const handleDragStart = (event: DragStartEvent) => {
    const work = works.find((w) => w.id === Number(event.active.id));
    setActiveWork(work || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveWork(null);
    const { active, over } = event;
    if (!over) return;

    const workId = Number(active.id);
    const newStatus = over.id as WorkStatus;
    const work = works.find((w) => w.id === workId);
    if (work && work.status !== newStatus) {
      onStatusChange(workId, newStatus);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 py-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 칸반 컬럼들 */}
        <div className="flex-1 flex gap-3 overflow-x-auto min-h-0">
          {COLUMNS.map((col) => {
            const colWorks = works.filter((w) => w.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                config={col}
                works={colWorks}
                onWorkClick={onWorkClick}
              />
            );
          })}
        </div>

        {/* 드래그 오버레이 */}
        <DragOverlay>
          {activeWork && <KanbanCardOverlay work={activeWork} />}
        </DragOverlay>
      </DndContext>

      {/* HOLD/BLOCKED 업무 (하단) */}
      {holdBlockedWorks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">보류 / 막힘</span>
            <Badge variant="secondary" className="text-[10px]">{holdBlockedWorks.length}</Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            {holdBlockedWorks.map((work) => (
              <button
                key={work.id}
                onClick={() => onWorkClick(work.id)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-colors hover:shadow-sm",
                  work.status === "HOLD" ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-red-50 border-red-200 text-red-700",
                )}
              >
                {work.status === "HOLD" ? "⏸️" : "🚫"} {work.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────

function KanbanColumn({
  config,
  works,
  onWorkClick,
}: {
  config: ColumnConfig;
  works: Work[];
  onWorkClick: (workId: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: config.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-[260px] max-w-[350px] flex flex-col rounded-xl border transition-colors",
        isOver ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card",
      )}
    >
      {/* 컬럼 헤더 */}
      <div className={cn("px-4 py-3 rounded-t-xl border-b", config.headerBg)}>
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", config.dotColor)} />
          <span className={cn("text-sm font-semibold", config.color)}>{config.title}</span>
          <Badge variant="secondary" className="text-[10px] ml-auto">{works.length}</Badge>
        </div>
      </div>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {works.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            업무를 여기로 드래그하세요
          </div>
        )}
        {works.map((work) => (
          <KanbanCard key={work.id} work={work} onWorkClick={onWorkClick} />
        ))}
      </div>
    </div>
  );
}

// ─── KanbanCard (Draggable) ───────────────────────────────────────────────

function KanbanCard({ work, onWorkClick }: { work: Work; onWorkClick: (id: number) => void }) {
  const priorityCfg = PRIORITY_CONFIG[work.priority];
  const isOverdue = work.dueDate ? new Date(work.dueDate) < new Date() && work.status !== "DONE" : false;

  // dnd-kit draggable via data attributes
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggableCard(work.id);

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-background p-3 transition-all cursor-grab active:cursor-grabbing",
        "hover:shadow-md hover:border-primary/30",
        isDragging && "opacity-30 shadow-none",
      )}
      {...attributes}
      {...listeners}
    >
      {/* 상단: 우선순위 + 상세 */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={cn("text-[11px]", priorityCfg.color)}>
          {priorityCfg.icon} {PRIORITY_LABELS[work.priority]}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onWorkClick(work.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary px-1 py-0.5 rounded hover:bg-muted transition-colors"
        >
          <Eye className="w-3 h-3" />
          상세
        </button>
      </div>

      {/* 제목 */}
      <p className={cn(
        "text-sm font-medium mb-2 line-clamp-2 leading-tight",
        work.status === "DONE" && "line-through text-muted-foreground",
      )}>
        {work.title}
      </p>

      {/* 하단: 유형 + 메타 */}
      <div className="flex items-center justify-between">
        <Badge className={cn("text-[9px] px-1.5 py-0", WORK_TYPE_COLORS[work.workType])}>
          {WORK_TYPE_LABELS[work.workType] || work.workType}
        </Badge>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {work.assigneeName && <span>{work.assigneeName}</span>}
          {work.dueDate && (
            <span className={cn("flex items-center gap-0.5", isOverdue ? "text-red-500" : "")}>
              {isOverdue ? <AlertTriangle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
              {new Date(work.dueDate).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KanbanCardOverlay (드래그 중 표시) ───────────────────────────────────

function KanbanCardOverlay({ work }: { work: Work }) {
  const priorityCfg = PRIORITY_CONFIG[work.priority];

  return (
    <div className="rounded-lg border-2 border-primary bg-background p-3 shadow-xl w-[280px] rotate-2 opacity-90">
      <div className="flex items-center gap-1 mb-1.5">
        <span className={cn("text-[11px]", priorityCfg.color)}>
          {priorityCfg.icon} {PRIORITY_LABELS[work.priority]}
        </span>
      </div>
      <p className="text-sm font-medium line-clamp-2">{work.title}</p>
      <div className="flex items-center justify-between mt-2">
        <Badge className={cn("text-[9px] px-1.5 py-0", WORK_TYPE_COLORS[work.workType])}>
          {WORK_TYPE_LABELS[work.workType] || work.workType}
        </Badge>
        {work.assigneeName && (
          <span className="text-[10px] text-muted-foreground">{work.assigneeName}</span>
        )}
      </div>
    </div>
  );
}

// ─── useDraggableCard hook ────────────────────────────────────────────────

import { useDraggable } from "@dnd-kit/core";

function useDraggableCard(workId: number) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: workId,
  });

  return { attributes, listeners, setNodeRef, transform, isDragging };
}
