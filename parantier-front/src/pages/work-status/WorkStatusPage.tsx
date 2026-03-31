import { useState, useEffect, useRef } from "react";
import { WorkStatusChatPanel } from "@/features/work/components/WorkStatusChatPanel";
import { Client } from "@stomp/stompjs";
import {
  RefreshCw,
  CheckCircle2,
  Users,
  MessageSquare,
  FlaskConical,
  ShieldAlert,
  X,
  Calendar,
  User,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  TEST: "테스트",
  DONE: "완료",
  HOLD: "보류",
  BLOCKED: "막힘",
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  TEST: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  DONE: "bg-green-500/20 text-green-600 dark:text-green-400",
  HOLD: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  BLOCKED: "bg-red-500/20 text-red-600 dark:text-red-400",
};

// 상태별 바 차트 색상 (배경 색상)
const STATUS_BAR_COLORS: Record<string, string> = {
  TODO: "bg-muted-foreground/30",
  IN_PROGRESS: "bg-blue-500",
  TEST: "bg-purple-500",
  DONE: "bg-green-500",
  HOLD: "bg-yellow-500",
  BLOCKED: "bg-red-500",
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
  test: number;
  done: number;
  hold: number;
  blocked: number;
  total: number;
}

function StatusBar({
  todo,
  inProgress,
  test,
  done,
  hold,
  blocked,
  total,
}: StatusBarProps) {
  if (total === 0) {
    return <div className="w-full h-2 rounded-full bg-muted" />;
  }

  const segments = [
    { key: "IN_PROGRESS", count: inProgress },
    { key: "TEST", count: test },
    { key: "DONE", count: done },
    { key: "TODO", count: todo },
    { key: "HOLD", count: hold },
    { key: "BLOCKED", count: blocked },
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
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 space-y-2 transition-shadow hover:shadow-sm">
      {/* 헤더: 아바타 + 이름 + 진행 중 배지 */}
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold
            ${
              isUnassigned
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            }`}
        >
          {getInitials(summary.username)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {summary.username}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            총 {summary.totalCount}개
          </p>
        </div>
        {summary.inProgressCount > 0 && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS["IN_PROGRESS"]}`}
          >
            진행 {summary.inProgressCount}
          </span>
        )}
        {(summary.testCount ?? 0) > 0 && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS["TEST"]}`}
          >
            테스트 {summary.testCount}
          </span>
        )}
      </div>

      {/* 상태 바 차트 */}
      <div className="space-y-1">
        <StatusBar
          todo={summary.todoCount}
          inProgress={summary.inProgressCount}
          test={summary.testCount ?? 0}
          done={summary.doneCount}
          hold={summary.holdCount}
          blocked={summary.blockedCount ?? 0}
          total={summary.totalCount}
        />
        {/* 범례 */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "TODO", count: summary.todoCount },
            { key: "IN_PROGRESS", count: summary.inProgressCount },
            { key: "TEST", count: summary.testCount ?? 0 },
            { key: "DONE", count: summary.doneCount },
            { key: "HOLD", count: summary.holdCount },
            { key: "BLOCKED", count: summary.blockedCount ?? 0 },
          ]
            .filter((s) => s.count > 0)
            .map(({ key, count }) => (
              <span
                key={key}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_BAR_COLORS[key]}`}
                />
                {STATUS_LABELS[key]} {count}
              </span>
            ))}
        </div>
      </div>

      {/* 업무 목록 */}
      {displayWorks.length > 0 && (
        <div className="space-y-1">
          {visibleWorks.map((work) => (
            <WorkListItem key={work.id} work={work} />
          ))}
          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-0.5 text-center transition-colors"
            >
              + {hiddenCount}개 더 보기
            </button>
          )}
          {expanded && displayWorks.length > MAX_VISIBLE && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-0.5 text-center transition-colors"
            >
              접기
            </button>
          )}
        </div>
      )}

      {summary.totalCount === 0 && (
        <p className="text-xs text-muted-foreground text-center py-0.5">
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
  const isDone = work.status === "DONE";
  const isTest = work.status === "TEST";

  return (
    <div className="flex items-center gap-1.5 rounded px-2 py-1 bg-muted/50 hover:bg-muted transition-colors">
      {isTest ? (
        <FlaskConical className="w-3.5 h-3.5 shrink-0 text-purple-500" />
      ) : (
        <CheckCircle2
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            isDone
              ? "text-green-500 dark:text-green-400"
              : "text-muted-foreground/40"
          }`}
        />
      )}
      <span className="text-xs text-foreground truncate flex-1">
        {work.title}
      </span>
      <span
        className={`text-xs px-1 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[work.priority]}`}
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
}

function LogItem({ log, isNew }: LogItemProps) {
  const isTest = log.changeType === "STATUS" && log.newValue === "TEST";
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-card
        ${isNew ? "animate-in slide-in-from-top-2 fade-in duration-300" : ""}
      `}
    >
      {isTest ? (
        <FlaskConical className="w-4 h-4 shrink-0 text-purple-500" />
      ) : (
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500 dark:text-green-400" />
      )}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-foreground truncate">
          {log.workTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {log.changedBy}님이 {isTest ? "테스트 중" : "완료"}했습니다{" "}
          {isTest ? "🧪" : "🎉"}
        </p>
      </div>
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

type LiveTab = "done" | "blocked" | "test";

interface LiveLogPanelProps {
  summaries: TeamMemberWorkSummary[];
}

function LiveLogPanel({ summaries }: LiveLogPanelProps) {
  const [logs, setLogs] = useState<WorkStatusLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [newLogIds, setNewLogIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<LiveTab>("done");
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const clientRef = useRef<Client | null>(null);

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

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // 현재 TEST 상태인 업무를 summaries에서 직접 추출
  const testWorks: Array<{ work: TeamMemberWork; assigneeName: string }> =
    summaries.flatMap((s) =>
      s.works
        .filter((w) => w.status === "TEST")
        .map((w) => ({ work: w, assigneeName: s.username })),
    );

  // 현재 BLOCKED 상태인 업무를 summaries에서 직접 추출
  const blockedWorks: Array<{ work: TeamMemberWork; assigneeName: string }> =
    summaries.flatMap((s) =>
      s.works
        .filter((w) => w.status === "BLOCKED")
        .map((w) => ({ work: w, assigneeName: s.username })),
    );

  const doneLogs = logs.filter(
    (l) => l.changeType === "STATUS" && l.newValue === "DONE",
  );
  const filteredLogs = doneLogs;

  const currentStatusWorks = activeTab === "test" ? testWorks : blockedWorks;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">업무 피드</h2>
          <div className="flex items-center gap-1">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
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
          {activeTab === "done"
            ? `최근 ${filteredLogs.length}개`
            : `현재 ${currentStatusWorks.length}개`}
        </span>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-3 shrink-0 bg-muted/50 p-0.5 rounded-lg">
        <button
          onClick={() => setActiveTab("done")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "done"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          완료
          {doneLogs.length > 0 && (
            <span className="bg-green-500/15 text-green-600 dark:text-green-400 text-xs px-1.5 rounded-full">
              {doneLogs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("blocked")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "blocked"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          막힘
          {blockedWorks.length > 0 && (
            <span className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs px-1.5 rounded-full">
              {blockedWorks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === "test"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          테스트 중
          {testWorks.length > 0 && (
            <span className="bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs px-1.5 rounded-full">
              {testWorks.length}
            </span>
          )}
        </button>
      </div>

      {/* 로그 목록 */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {activeTab !== "done" ? (
          currentStatusWorks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                {activeTab === "test" ? (
                  <FlaskConical className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium text-foreground">
                {activeTab === "test"
                  ? "테스트 중인 업무 없음"
                  : "막힌 업무 없음"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "test"
                  ? "테스트 상태로 변경되면 여기에 표시됩니다."
                  : "막힘 상태로 변경되면 여기에 표시됩니다."}
              </p>
            </div>
          ) : (
            currentStatusWorks.map(({ work, assigneeName }) => (
              <button
                key={work.id}
                onClick={() => setSelectedWorkId(work.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left cursor-pointer"
              >
                {activeTab === "test" ? (
                  <FlaskConical className="w-4 h-4 shrink-0 text-purple-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                )}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {work.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assigneeName} {activeTab === "test" ? "🧪" : "🚫"}
                  </p>
                </div>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[work.priority]}`}
                >
                  {PRIORITY_LABELS[work.priority]}
                </span>
              </button>
            ))
          )
        ) : isInitialLoading ? (
          <div className="space-y-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-3 px-3 py-2.5 rounded-lg border border-border bg-card animate-pulse"
              >
                <div className="w-6 h-6 rounded-md bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              완료된 업무 없음
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              업무가 완료되면 실시간으로 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <LogItem
              key={`${log.id}-${log.changedAt}`}
              log={log}
              isNew={newLogIds.has(log.id)}
            />
          ))
        )}
      </div>

      {/* 업무 상세 Sheet */}
      {selectedWorkId !== null && (
        <WorkDetailSheet
          workId={selectedWorkId}
          onClose={() => setSelectedWorkId(null)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 업무 상세 Sheet
// ──────────────────────────────────────────────

function WorkDetailSheet({
  workId,
  onClose,
}: {
  workId: number;
  onClose: () => void;
}) {
  const { data: work, isLoading } = useQuery({
    queryKey: ["works", workId],
    queryFn: () => workApi.getWork(workId),
    enabled: !!workId,
  });

  const statusLabel: Record<string, string> = {
    TODO: "할 일",
    IN_PROGRESS: "진행 중",
    TEST: "테스트",
    DONE: "완료",
    HOLD: "보류",
    BLOCKED: "막힘",
  };
  const statusColor: Record<string, string> = {
    TODO: "bg-muted text-muted-foreground",
    IN_PROGRESS: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    TEST: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    DONE: "bg-green-500/20 text-green-600 dark:text-green-400",
    HOLD: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    BLOCKED: "bg-red-500/20 text-red-600 dark:text-red-400",
  };
  const priorityLabel: Record<string, string> = {
    LOW: "낮음",
    MEDIUM: "보통",
    HIGH: "높음",
    CRITICAL: "긴급",
  };
  const priorityColor: Record<string, string> = {
    CRITICAL: "bg-red-500/20 text-red-600 dark:text-red-400",
    HIGH: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    MEDIUM: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    LOW: "bg-muted text-muted-foreground",
  };
  const workTypeLabel: Record<string, string> = {
    FEATURE: "기능개발",
    QA: "QA",
    COMMON: "일반",
  };

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      {/* Sheet 패널 */}
      <div className="fixed right-0 top-0 z-50 h-full w-[420px] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h3 className="text-base font-semibold text-foreground">업무 상세</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-24 bg-muted rounded" />
            </div>
          ) : work ? (
            <>
              {/* 제목 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">제목</p>
                <p className="text-base font-semibold text-foreground leading-snug">
                  {work.title}
                </p>
              </div>

              {/* 상태 / 우선순위 / 유형 */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusColor[work.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {work.status === "BLOCKED" && (
                    <ShieldAlert className="w-3 h-3" />
                  )}
                  {work.status === "TEST" && (
                    <FlaskConical className="w-3 h-3" />
                  )}
                  {statusLabel[work.status] ?? work.status}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${priorityColor[work.priority] ?? "bg-muted text-muted-foreground"}`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {priorityLabel[work.priority] ?? work.priority}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-muted text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {workTypeLabel[work.workType] ?? work.workType}
                </span>
              </div>

              {/* 담당자 / 마감일 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    담당자
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {work.assigneeName ?? "미지정"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    마감일
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {work.dueDate ? work.dueDate.slice(0, 10) : "없음"}
                  </p>
                </div>
              </div>

              {/* 내용 */}
              {work.content && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">내용</p>
                  <div className="bg-muted/50 rounded-lg px-3 py-2.5 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {work.content}
                  </div>
                </div>
              )}

              {/* 작성자 / 작성일 */}
              <div className="border-t border-border pt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>작성자</span>
                  <span className="text-foreground">{work.reporterName}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>작성일</span>
                  <span className="text-foreground">
                    {work.createdAt.slice(0, 10)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>최종 수정</span>
                  <span className="text-foreground">
                    {work.updatedAt.slice(0, 10)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              업무를 불러올 수 없습니다.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// 메인 페이지
// ──────────────────────────────────────────────

export function WorkStatusPage() {
  const { data: summaries = [] } = useTeamWorkSummary();
  const [leftTab, setLeftTab] = useState<"team" | "chat">("team");

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
        {/* 왼쪽: 탭 (팀원 현황 | 업무 채팅) */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          {/* 탭 헤더 */}
          <div className="flex shrink-0 border-b border-border px-2 pt-2">
            <button
              onClick={() => setLeftTab("team")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                leftTab === "team"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              팀원 현황
            </button>
            <button
              onClick={() => setLeftTab("chat")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                leftTab === "chat"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              업무 채팅
            </button>
          </div>
          <CardContent className="flex-1 min-h-0 overflow-hidden pt-4 flex flex-col">
            {leftTab === "team" ? <TeamWorkPanel /> : <WorkStatusChatPanel />}
          </CardContent>
        </Card>

        {/* 오른쪽: 실시간 변경 로그 */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardContent className="flex-1 min-h-0 overflow-hidden pt-6 flex flex-col">
            <LiveLogPanel summaries={summaries} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
