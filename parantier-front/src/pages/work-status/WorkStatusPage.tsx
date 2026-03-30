import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { RefreshCw, CheckCircle2, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workApi } from "@/entities/work/api/workApi";
import { Card, CardContent } from "@/shared/ui/card";
import { useTeamWorkSummary } from "./hooks/useTeamWorkSummary";
import { workStatusApi } from "@/api/workStatusApi";
import type {
  WorkStatusLog,
  TeamMemberWorkSummary,
  TeamMemberWork,
} from "@/api/workStatusApi";

// ──────────────────────────────────────────────
// 상수: 한글 레이블 & 시맨틱 색상
// ──────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  TODO: "할 일",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
  HOLD: "보류",
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  DONE: "bg-green-500/20 text-green-600 dark:text-green-400",
  HOLD: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
};

// 상태별 바 차트 색상 (배경 색상)
const STATUS_BAR_COLORS: Record<string, string> = {
  TODO: "bg-muted-foreground/30",
  IN_PROGRESS: "bg-blue-500",
  DONE: "bg-green-500",
  HOLD: "bg-yellow-500",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
  CRITICAL: "긴급",
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-600 dark:text-red-400",
  HIGH: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  LOW: "bg-muted text-muted-foreground",
};

// ──────────────────────────────────────────────
// 유틸 함수
// ──────────────────────────────────────────────

function getRelativeTime(isoString: string): string {
  const now = Date.now();
  // 타임존 정보 없는 LocalDateTime 문자열은 UTC로 처리 (서버가 UTC 저장)
  const utcString =
    isoString.endsWith("Z") || isoString.includes("+")
      ? isoString
      : isoString + "Z";
  const then = new Date(utcString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 10) return "방금 전";
  if (diffSec < 60) return `${diffSec}초 전`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

function getInitials(name: string): string {
  if (!name) return "?";
  // 한글 이름이면 마지막 글자, 영어면 첫 두 글자 대문자
  const trimmed = name.trim();
  if (/[가-힣]/.test(trimmed)) {
    return trimmed.charAt(trimmed.length - 1);
  }
  return trimmed
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ──────────────────────────────────────────────
// 하위 컴포넌트: 상태 바 차트
// ──────────────────────────────────────────────

interface StatusBarProps {
  todo: number;
  inProgress: number;
  done: number;
  hold: number;
  total: number;
}

function StatusBar({ todo, inProgress, done, hold, total }: StatusBarProps) {
  if (total === 0) {
    return <div className="w-full h-2 rounded-full bg-muted" />;
  }

  const segments = [
    { key: "IN_PROGRESS", count: inProgress },
    { key: "DONE", count: done },
    { key: "TODO", count: todo },
    { key: "HOLD", count: hold },
  ].filter((s) => s.count > 0);

  return (
    <div className="w-full h-2 rounded-full overflow-hidden flex gap-px bg-muted">
      {segments.map(({ key, count }) => (
        <div
          key={key}
          className={`h-full ${STATUS_BAR_COLORS[key]} transition-all duration-500`}
          style={{ width: `${(count / total) * 100}%` }}
          title={`${STATUS_LABELS[key]}: ${count}개`}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// 하위 컴포넌트: 팀원 업무 카드
// ──────────────────────────────────────────────

interface MemberCardProps {
  summary: TeamMemberWorkSummary;
}

function MemberCard({ summary }: MemberCardProps) {
  const [expanded, setExpanded] = useState(false);

  const inProgressWorks = summary.works.filter(
    (w) => w.status === "IN_PROGRESS",
  );
  const otherWorks = summary.works.filter((w) => w.status !== "IN_PROGRESS");

  // 진행 중 → 나머지 순으로 표시, 최대 3개
  const displayWorks = [...inProgressWorks, ...otherWorks];
  const MAX_VISIBLE = 3;
  const visibleWorks = expanded
    ? displayWorks
    : displayWorks.slice(0, MAX_VISIBLE);
  const hiddenCount = displayWorks.length - MAX_VISIBLE;

  const isUnassigned = summary.userId === -1;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3 transition-shadow hover:shadow-sm">
      {/* 헤더: 아바타 + 이름 + 진행 중 배지 */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold
            ${
              isUnassigned
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            }`}
        >
          {getInitials(summary.username)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {summary.username}
          </p>
          <p className="text-xs text-muted-foreground">
            총 {summary.totalCount}개
          </p>
        </div>
        {summary.inProgressCount > 0 && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS["IN_PROGRESS"]}`}
          >
            진행 중 {summary.inProgressCount}
          </span>
        )}
      </div>

      {/* 상태 바 차트 */}
      <div className="space-y-1.5">
        <StatusBar
          todo={summary.todoCount}
          inProgress={summary.inProgressCount}
          done={summary.doneCount}
          hold={summary.holdCount}
          total={summary.totalCount}
        />
        {/* 범례 */}
        <div className="flex gap-3 flex-wrap">
          {[
            { key: "TODO", count: summary.todoCount },
            { key: "IN_PROGRESS", count: summary.inProgressCount },
            { key: "DONE", count: summary.doneCount },
            { key: "HOLD", count: summary.holdCount },
          ]
            .filter((s) => s.count > 0)
            .map(({ key, count }) => (
              <span
                key={key}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${STATUS_BAR_COLORS[key]}`}
                />
                {STATUS_LABELS[key]} {count}
              </span>
            ))}
        </div>
      </div>

      {/* 진행 중 업무 목록 */}
      {displayWorks.length > 0 && (
        <div className="space-y-1.5">
          {visibleWorks.map((work) => (
            <WorkListItem key={work.id} work={work} />
          ))}

          {/* 펼치기/접기 버튼 */}
          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-1 text-center transition-colors"
            >
              + {hiddenCount}개 더 보기
            </button>
          )}
          {expanded && displayWorks.length > MAX_VISIBLE && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-1 text-center transition-colors"
            >
              접기
            </button>
          )}
        </div>
      )}

      {summary.totalCount === 0 && (
        <p className="text-xs text-muted-foreground text-center py-1">
          배정된 업무 없음
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 하위 컴포넌트: 업무 목록 아이템 (카드 내부)
// ──────────────────────────────────────────────

function WorkListItem({ work }: { work: TeamMemberWork }) {
  const queryClient = useQueryClient();
  const isDone = work.status === "DONE";

  const { mutate: toggleDone, isPending } = useMutation({
    mutationFn: () => workApi.updateStatus(work.id, isDone ? "HOLD" : "DONE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
    },
  });

  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/50 hover:bg-muted transition-colors">
      {/* 완료 체크박스 */}
      <button
        onClick={() => toggleDone()}
        disabled={isPending}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
        title={isDone ? "완료 취소 (보류로 변경)" : "완료로 변경"}
      >
        <CheckCircle2
          className={`w-4 h-4 transition-colors ${
            isDone
              ? "text-green-500 dark:text-green-400"
              : "text-muted-foreground"
          }`}
        />
      </button>
      <span className="text-xs text-foreground truncate flex-1">
        {work.title}
      </span>
      <span
        className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[work.priority]}`}
      >
        {PRIORITY_LABELS[work.priority]}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// 하위 컴포넌트: 로그 아이템
// ──────────────────────────────────────────────

interface LogItemProps {
  log: WorkStatusLog;
  isNew?: boolean;
  onUncheck: (workId: number, logId: number) => void;
}

function LogItem({ log, isNew, onUncheck }: LogItemProps) {
  const { mutate: revertToHold, isPending } = useMutation({
    mutationFn: () => workApi.updateStatus(log.workId, "HOLD"),
    onSuccess: () => {
      onUncheck(log.workId, log.id);
    },
  });

  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 rounded-lg border border-border bg-card
        ${isNew ? "animate-in slide-in-from-top-2 fade-in duration-300" : ""}
      `}
    >
      {/* 체크박스 */}
      <button
        onClick={() => revertToHold()}
        disabled={isPending}
        className="shrink-0 text-green-500 dark:text-green-400 hover:text-muted-foreground transition-colors disabled:opacity-50"
        title="체크 해제 시 보류로 변경"
      >
        <CheckCircle2 className="w-5 h-5" />
      </button>

      {/* 내용 */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-semibold text-foreground truncate">
          {log.workTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {log.changedBy}님이 완료했습니다 🎉
        </p>
      </div>

      {/* 시간 */}
      <span className="text-xs text-muted-foreground shrink-0">
        {getRelativeTime(log.changedAt)}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// 왼쪽 패널: 팀원 업무 현황
// ──────────────────────────────────────────────

function TeamWorkPanel() {
  const {
    data: summaries = [],
    isLoading,
    isFetching,
    refetch,
  } = useTeamWorkSummary();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            팀원 업무 현황
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            30초마다 자동 갱신
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          새로고침
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : summaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              업무 데이터 없음
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              등록된 업무가 없습니다.
            </p>
          </div>
        ) : (
          summaries.map((summary) => (
            <MemberCard key={summary.userId} summary={summary} />
          ))
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 오른쪽 패널: 실시간 변경 로그
// ──────────────────────────────────────────────

const MAX_LOGS = 100;

function LiveLogPanel() {
  const [logs, setLogs] = useState<WorkStatusLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [newLogIds, setNewLogIds] = useState<Set<number>>(new Set());
  const clientRef = useRef<Client | null>(null);
  const queryClient = useQueryClient();

  // 최초 REST API로 최근 50개 로그 가져오기
  useEffect(() => {
    workStatusApi
      .getRecentLogs(50)
      .then((initialLogs) => {
        // workId 기준 중복 제거 (가장 최신 로그만 유지)
        const seen = new Set<number>();
        const deduped = initialLogs.filter((log) => {
          if (seen.has(log.workId)) return false;
          seen.add(log.workId);
          return true;
        });
        setLogs(deduped);
      })
      .catch((err) => {
        console.error("Failed to load initial work status logs:", err);
      })
      .finally(() => {
        setIsInitialLoading(false);
      });
  }, []);

  // WebSocket STOMP 연결
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},

      onConnect: () => {
        console.log("WorkStatus WebSocket Connected");
        setIsConnected(true);

        client.subscribe("/topic/work-status", (message) => {
          try {
            const log: WorkStatusLog = JSON.parse(message.body);
            setLogs((prev) => {
              // 같은 workId의 이전 로그 제거 후 맨 위에 추가
              const filtered = prev.filter((l) => l.workId !== log.workId);
              return [log, ...filtered].slice(0, MAX_LOGS);
            });
            // fade-in 애니메이션을 위해 새 로그 ID 추적
            setNewLogIds((prev) => {
              const next = new Set(prev);
              next.add(log.id);
              return next;
            });
            // 3초 후 애니메이션 클래스 제거
            setTimeout(() => {
              setNewLogIds((prev) => {
                const next = new Set(prev);
                next.delete(log.id);
                return next;
              });
            }, 3000);
          } catch (e) {
            console.error("Failed to parse work-status message:", e);
          }
        });
      },

      onStompError: (frame) => {
        console.error("WorkStatus STOMP error:", frame);
        setIsConnected(false);
      },

      onWebSocketClose: () => {
        console.log("WorkStatus WebSocket Disconnected");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  // 상대 시간 자동 갱신 (1분마다)
  const handleUncheck = (workId: number, logId: number) => {
    // 로그 목록에서 해당 항목 제거
    setLogs((prev) =>
      prev.filter((l) => l.workId !== workId || l.id !== logId),
    );
    // 왼쪽 팀원 카드도 갱신
    queryClient.invalidateQueries({ queryKey: ["team-work-summary"] });
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            업무 완료 피드
          </h2>
          {/* LIVE 인디케이터 */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isConnected
                  ? "bg-green-500 animate-pulse"
                  : "bg-muted-foreground"
              }`}
            />
            <span
              className={`text-xs font-semibold tracking-wide ${
                isConnected
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            >
              {isConnected ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          최근 {logs.length}개
        </span>
      </div>

      {/* 로그 목록 */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isInitialLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-3 px-3 py-3 rounded-lg border border-border bg-card animate-pulse"
              >
                <div className="w-7 h-7 rounded-md bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-48" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              완료된 업무 없음
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              업무가 완료되면 실시간으로 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <LogItem
              key={`${log.id}-${log.changedAt}`}
              log={log}
              isNew={newLogIds.has(log.id)}
              onUncheck={handleUncheck}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 메인 페이지
// ──────────────────────────────────────────────

export function WorkStatusPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* 페이지 헤더 */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-foreground">업무 현황</h1>
        <p className="text-sm text-muted-foreground mt-1">
          팀원별 업무 진행 상황과 실시간 완료 현황을 확인합니다.
        </p>
      </div>

      {/* 본문: 좌우 2분할 */}
      <div className="flex-1 min-h-0 px-6 pb-6 grid grid-cols-2 gap-6">
        {/* 왼쪽: 팀원 업무 현황 */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardContent className="flex-1 min-h-0 overflow-hidden pt-6 flex flex-col">
            <TeamWorkPanel />
          </CardContent>
        </Card>

        {/* 오른쪽: 실시간 변경 로그 */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardContent className="flex-1 min-h-0 overflow-hidden pt-6 flex flex-col">
            <LiveLogPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
