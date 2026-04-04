import { useState } from "react";
import { createPortal } from "react-dom";
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
  Link,
  Plus,
  ChevronRight,
  Plug,
  X,
  Maximize2,
} from "lucide-react";
import ApiDocPage from "@/pages/apidoc/ApiDocPage";

// ── 더미 채팅 ─────────────────────────────────────────────────────────────────
const INIT_MESSAGES = [
  {
    id: 1,
    user: "김민준",
    avatar: "민",
    content: "해커톤 파이팅! 🔥",
    time: "10:12",
    isMe: false,
  },
  {
    id: 2,
    user: "나",
    avatar: "나",
    content: "다들 화이팅입니다!",
    time: "10:13",
    isMe: true,
  },
  {
    id: 3,
    user: "이서연",
    avatar: "서",
    content: "Team B 준비 완료 👍",
    time: "10:15",
    isMe: false,
  },
];

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

// ── 팀 정의 ───────────────────────────────────────────────────────────────────
const TEAMS = [
  {
    id: 1,
    name: "Team A",
    project: "AI 코드 리뷰 어시스턴트",
    members: ["김민준", "이서연"],
    color: "from-blue-500/20 to-blue-600/5",
    accent: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/30",
    dot: "bg-blue-500",
  },
  {
    id: 2,
    name: "Team B",
    project: "실시간 협업 화이트보드",
    members: ["박지호", "최유진", "정하은"],
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
  },
];

// ── 더미 항목 데이터 ──────────────────────────────────────────────────────────
const DUMMY_FIGMA_LINKS = [
  { id: 1, title: "메인 화면 디자인", url: "https://figma.com/file/xxx" },
  { id: 2, title: "컴포넌트 라이브러리", url: "https://figma.com/file/yyy" },
];

const DUMMY_TASKS = [
  { id: 1, title: "로그인 API 연동", status: "DONE" as const, assignee: "김" },
  { id: 2, title: "메인 UI 구현", status: "DOING" as const, assignee: "이" },
  { id: 3, title: "테스트 코드 작성", status: "TODO" as const, assignee: null },
];

const DUMMY_ISSUES = [
  {
    id: 1,
    title: "로그인 시 토큰 만료 오류",
    priority: "HIGH" as const,
    status: "OPEN" as const,
  },
  {
    id: 2,
    title: "모바일 반응형 깨짐",
    priority: "MEDIUM" as const,
    status: "IN_PROGRESS" as const,
  },
  {
    id: 3,
    title: "다크모드 색상 수정",
    priority: "LOW" as const,
    status: "CLOSED" as const,
  },
];

const DUMMY_GITHUB = [
  {
    id: 1,
    title: "메인 레포지토리",
    url: "https://github.com/team/project",
    type: "repo" as const,
  },
];

const DUMMY_QNA = [
  {
    id: 1,
    question: "배포는 언제 하나요?",
    answer: "해커톤 종료 1시간 전까지 배포 완료해야 합니다.",
  },
  {
    id: 2,
    question: "발표 시간은 얼마나 되나요?",
    answer: "팀당 5분 발표 + 3분 Q&A입니다. 심사위원 3명이 채점합니다.",
  },
  { id: 3, question: "심사 기준은 무엇인가요?", answer: null },
];

// ── 상태/우선순위 스타일 헬퍼 ─────────────────────────────────────────────────
const TASK_STATUS_STYLE = {
  TODO: "bg-muted text-muted-foreground",
  DOING: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  DONE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const PRIORITY_STYLE = {
  HIGH: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  LOW: "bg-muted text-muted-foreground",
};

const ISSUE_STATUS_STYLE = {
  OPEN: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  IN_PROGRESS:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  CLOSED: "bg-muted text-muted-foreground",
};

// ── 상세 다이얼로그 공통 래퍼 ─────────────────────────────────────────────────
function DetailDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-[680px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div
          className="shrink-0 flex items-center justify-between px-5 border-b border-border"
          style={{ height: "49px" }}
        >
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

// ── EmptyState 헬퍼 ───────────────────────────────────────────────────────────
function EmptyState({
  icon,
  label,
  desc,
  btnLabel,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  btnLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground select-none py-8">
      {icon}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/60">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:text-primary transition-colors mt-1">
        <Plus className="w-3.5 h-3.5" />
        {btnLabel}
      </button>
    </div>
  );
}

// ── 탭 콘텐츠 ────────────────────────────────────────────────────────────────
function TabContent({ tab }: { tab: TabId }) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // ── Figma 탭 ──
  if (tab === "figma") {
    const selected = DUMMY_FIGMA_LINKS.find((f) => f.id === selectedItem);
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">
            {DUMMY_FIGMA_LINKS.length}개
          </span>
          <button className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> 추가
          </button>
        </div>
        {DUMMY_FIGMA_LINKS.length === 0 ? (
          <EmptyState
            icon={<Figma className="w-8 h-8 opacity-20" />}
            label="Figma 링크 없음"
            desc="팀의 디자인 파일 링크를 등록하세요"
            btnLabel="Figma 링크 추가"
          />
        ) : (
          DUMMY_FIGMA_LINKS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedItem(f.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left group"
            >
              <Figma className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {f.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {f.url}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
            </button>
          ))
        )}
        {selected && (
          <DetailDialog
            title={selected.title}
            onClose={() => setSelectedItem(null)}
          >
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
              <div
                className="rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-center"
                style={{ height: "300px" }}
              >
                <div className="text-center text-muted-foreground">
                  <Figma className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Figma 미리보기</p>
                  <p className="text-[10px] mt-0.5">구현 예정</p>
                </div>
              </div>
            </div>
          </DetailDialog>
        )}
      </div>
    );
  }

  // ── Task 탭 ──
  if (tab === "task") {
    const selected = DUMMY_TASKS.find((t) => t.id === selectedItem);
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">
            {DUMMY_TASKS.length}개
          </span>
          <button className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> Task 추가
          </button>
        </div>
        {DUMMY_TASKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedItem(t.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left group"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="flex-1 text-xs font-medium text-foreground truncate">
              {t.title}
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${TASK_STATUS_STYLE[t.status]}`}
            >
              {t.status}
            </span>
            {t.assignee && (
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                {t.assignee}
              </div>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
        {selected && (
          <DetailDialog
            title={selected.title}
            onClose={() => setSelectedItem(null)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${TASK_STATUS_STYLE[selected.status]}`}
                >
                  {selected.status}
                </span>
                {selected.assignee && (
                  <span className="text-xs text-muted-foreground">
                    담당자: {selected.assignee}
                  </span>
                )}
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                상세 내용 · 체크리스트 · 마감일 — 구현 예정
              </div>
            </div>
          </DetailDialog>
        )}
      </div>
    );
  }

  // ── Issue 탭 ──
  if (tab === "issue") {
    const selected = DUMMY_ISSUES.find((i) => i.id === selectedItem);
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">
            {DUMMY_ISSUES.length}개
          </span>
          <button className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> Issue 등록
          </button>
        </div>
        {DUMMY_ISSUES.map((issue) => (
          <button
            key={issue.id}
            onClick={() => setSelectedItem(issue.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left group"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="flex-1 text-xs font-medium text-foreground truncate">
              {issue.title}
            </span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${PRIORITY_STYLE[issue.priority]}`}
            >
              {issue.priority}
            </span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${ISSUE_STATUS_STYLE[issue.status]}`}
            >
              {issue.status}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
        {selected && (
          <DetailDialog
            title={selected.title}
            onClose={() => setSelectedItem(null)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLE[selected.priority]}`}
                >
                  {selected.priority}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${ISSUE_STATUS_STYLE[selected.status]}`}
                >
                  {selected.status}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                상세 내용 · 댓글 · 상태 변경 — 구현 예정
              </div>
            </div>
          </DetailDialog>
        )}
      </div>
    );
  }

  // ── GitHub 탭 ──
  if (tab === "github") {
    const selected = DUMMY_GITHUB.find((g) => g.id === selectedItem);
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">
            {DUMMY_GITHUB.length}개
          </span>
          <button className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> GitHub 연결
          </button>
        </div>
        {DUMMY_GITHUB.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedItem(g.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left group"
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
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
              {g.type}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
        {selected && (
          <DetailDialog
            title={selected.title}
            onClose={() => setSelectedItem(null)}
          >
            <div className="flex flex-col gap-3">
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {selected.url}
              </a>
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                PR · 커밋 목록 · 레포 정보 — 구현 예정
              </div>
            </div>
          </DetailDialog>
        )}
      </div>
    );
  }

  // ── Q&A 탭 ──
  if (tab === "faq") {
    const selected = DUMMY_QNA.find((q) => q.id === selectedItem);
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">
            {DUMMY_QNA.length}개
          </span>
          <button className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> Q&A 추가
          </button>
        </div>
        {DUMMY_QNA.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelectedItem(q.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left group"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                Q. {q.question}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {q.answer ? `A. ${q.answer}` : "미답변"}
              </p>
            </div>
            {!q.answer && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 shrink-0 font-medium">
                미답변
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
        {selected && (
          <DetailDialog title="Q&A 상세" onClose={() => setSelectedItem(null)}>
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Question
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selected.question}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                  Answer
                </p>
                {selected.answer ? (
                  <p className="text-sm text-foreground">{selected.answer}</p>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                    <HelpCircle className="w-6 h-6 opacity-30" />
                    <p className="text-xs">아직 답변이 없습니다</p>
                    <button className="text-xs text-primary hover:text-primary/80 border border-dashed border-primary/30 px-3 py-1.5 rounded-lg">
                      + 답변 작성
                    </button>
                  </div>
                )}
              </div>
            </div>
          </DetailDialog>
        )}
      </div>
    );
  }

  return null;
}

// ── API 문서 다이얼로그 ────────────────────────────────────────────────────────
function ApiDocDialog({
  teamName,
  onClose,
}: {
  teamName: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* 다이얼로그 헤더 */}
      <div
        className="shrink-0 flex items-center justify-between px-5 border-b border-border bg-card"
        style={{ height: "49px" }}
      >
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {teamName} · API 문서
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            팀 전용
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
        >
          <X className="w-4 h-4" />
          닫기
        </button>
      </div>

      {/* ApiDocPage 풀스크린 임베드 */}
      <div className="flex-1 overflow-hidden">
        <ApiDocPage />
      </div>
    </div>,
    document.body,
  );
}

// ── 팀 카드 ───────────────────────────────────────────────────────────────────
function TeamCard({ team }: { team: (typeof TEAMS)[0] }) {
  const [activeTab, setActiveTab] = useState<TabId>("figma");
  const [apiDocOpen, setApiDocOpen] = useState(false);

  return (
    <div
      className={`flex-1 flex flex-col rounded-2xl border ${team.border} bg-gradient-to-b ${team.color} bg-card shadow-sm overflow-hidden`}
    >
      {/* 카드 헤더 */}
      <div className="shrink-0 px-5 py-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${team.dot}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${team.accent}`}>
                  {team.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {team.members.length}명
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {team.project}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {team.members.map((m, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
                title={m}
              >
                {m[0]}
              </div>
            ))}
          </div>
        </div>

        {/* 링크 예시 영역 */}
        <div className="flex items-center gap-2 mt-3">
          <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted">
            <Link className="w-3 h-3" />
            링크 추가
          </button>
          <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted">
            <ChevronRight className="w-3 h-3" />
            프로젝트 상세
          </button>
        </div>
      </div>

      {/* 탭 헤더 */}
      <div className="shrink-0 flex items-center px-3 pt-2 border-b border-border/60 bg-muted/10">
        <div className="flex items-center gap-0.5 flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                activeTab === tab.id
                  ? `${team.accent} border-b-2 border-current bg-background/60`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* API 버튼 */}
        <button
          onClick={() => setApiDocOpen(true)}
          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 mb-1"
          title={`${team.name} API 문서`}
        >
          <Plug className="w-3 h-3" />
          API
          <Maximize2 className="w-2.5 h-2.5 opacity-60" />
        </button>
      </div>

      {/* API 문서 풀스크린 다이얼로그 */}
      {apiDocOpen && (
        <ApiDocDialog
          teamName={team.name}
          onClose={() => setApiDocOpen(false)}
        />
      )}

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        <TabContent tab={activeTab} />
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export function HackathonPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(INIT_MESSAGES);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        user: "나",
        avatar: "나",
        content: message.trim(),
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
      },
    ]);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-muted/30 p-4 gap-4 overflow-hidden">
      {/* ── 상단 요약 카드 ─────────────────────────────────────────────────── */}
      <div className="shrink-0 grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">참가 팀</p>
            <p className="text-xl font-bold text-foreground">2팀</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">참가 인원</p>
            <p className="text-xl font-bold text-foreground">
              {TEAMS.reduce((acc, t) => acc + t.members.length, 0)}명
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">남은 시간</p>
            <p className="text-xl font-bold text-foreground">48h</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">채팅</p>
            <p className="text-xl font-bold text-foreground">
              {messages.length}개
            </p>
          </div>
        </div>
      </div>

      {/* ── 본문: 채팅(좌) + 2팀 카드(우) ─────────────────────────────────── */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* 왼쪽: 채팅 */}
        <div className="w-72 shrink-0 flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* 채팅 헤더 */}
          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3.5 border-b border-border bg-muted/20">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">오픈 채팅</p>
              <p className="text-[10px] text-muted-foreground">전체 참가자</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Live
            </span>
          </div>

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
            {messages.map((msg) =>
              msg.isMe ? (
                <div key={msg.id} className="flex flex-col items-end gap-0.5">
                  <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-1.5 text-xs">
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    {msg.time}
                  </span>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {msg.user}
                    </span>
                    <div className="max-w-[85%] bg-muted text-foreground rounded-2xl rounded-tl-sm px-3 py-1.5 text-xs">
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* 입력창 */}
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
                disabled={!message.trim()}
                className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity shrink-0"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 2팀 카드 가로 배치 */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {TEAMS.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
