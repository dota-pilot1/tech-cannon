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
  { id: "faq", label: "FAQ", icon: <HelpCircle className="w-3.5 h-3.5" /> },
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

// ── 탭 콘텐츠 플레이스홀더 ────────────────────────────────────────────────────
function TabContent({ tab, teamName }: { tab: TabId; teamName: string }) {
  const configs: Record<
    TabId,
    { icon: React.ReactNode; title: string; desc: string; btnLabel: string }
  > = {
    figma: {
      icon: <Figma className="w-8 h-8 opacity-20" />,
      title: "Figma 링크 없음",
      desc: "팀의 디자인 파일 링크를 등록하세요",
      btnLabel: "Figma 링크 추가",
    },
    task: {
      icon: <CheckSquare className="w-8 h-8 opacity-20" />,
      title: "등록된 Task 없음",
      desc: `${teamName}의 개발 태스크를 등록하세요`,
      btnLabel: "Task 추가",
    },
    issue: {
      icon: <AlertCircle className="w-8 h-8 opacity-20" />,
      title: "등록된 Issue 없음",
      desc: "이슈를 등록하고 진행 상황을 추적하세요",
      btnLabel: "Issue 등록",
    },
    github: {
      icon: <Github className="w-8 h-8 opacity-20" />,
      title: "GitHub 연동 없음",
      desc: "팀 레포지토리를 연결하세요",
      btnLabel: "GitHub 연결",
    },
    faq: {
      icon: <HelpCircle className="w-8 h-8 opacity-20" />,
      title: "등록된 FAQ 없음",
      desc: "자주 묻는 질문과 답변을 등록하세요",
      btnLabel: "FAQ 추가",
    },
  };

  const cfg = configs[tab];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground select-none">
      {cfg.icon}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/60">{cfg.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{cfg.desc}</p>
      </div>
      <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:text-primary transition-colors mt-1">
        <Plus className="w-3.5 h-3.5" />
        {cfg.btnLabel}
      </button>
      <p className="text-[10px] text-muted-foreground/50 mt-1">구현 예정</p>
    </div>
  );
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
        <TabContent tab={activeTab} teamName={team.name} />
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
