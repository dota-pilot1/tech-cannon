import { MessageSquare, Trophy, Users, Clock, ChevronRight, Send } from "lucide-react";
import { useState } from "react";

// ── 더미 채팅 메시지 ──────────────────────────────────────────────────────────
const DUMMY_MESSAGES = [
  { id: 1, user: "김민준", avatar: "민", content: "해커톤 시작까지 얼마 남았나요?", time: "10:12", isMe: false },
  { id: 2, user: "나", avatar: "나", content: "이틀 남았어요! 팀 구성은 됐나요?", time: "10:13", isMe: true },
  { id: 3, user: "이서연", avatar: "서", content: "저희 팀은 AI 관련 주제로 잡았어요 🤖", time: "10:15", isMe: false },
  { id: 4, user: "박지호", avatar: "지", content: "아이디어 공유 환영합니다!", time: "10:17", isMe: false },
  { id: 5, user: "나", avatar: "나", content: "파이팅!! 🔥", time: "10:18", isMe: true },
];

// ── 더미 프로젝트 팀 ──────────────────────────────────────────────────────────
const DUMMY_TEAMS = [
  {
    id: 1,
    name: "Team Alpha",
    project: "AI 코드 리뷰 어시스턴트",
    members: ["김민준", "이서연"],
    status: "진행중",
    progress: 35,
    tags: ["AI", "Python", "GPT"],
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Team Beta",
    project: "실시간 협업 화이트보드",
    members: ["박지호", "최유진", "정하은"],
    status: "기획중",
    progress: 10,
    tags: ["React", "WebSocket"],
    color: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Team Gamma",
    project: "개발자 일정 관리 앱",
    members: ["강도현", "윤서아"],
    status: "진행중",
    progress: 60,
    tags: ["Flutter", "Firebase"],
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Team Delta",
    project: "팀원 매칭 플랫폼",
    members: ["임재원"],
    status: "팀원모집",
    progress: 5,
    tags: ["Next.js", "PostgreSQL"],
    color: "bg-amber-500",
  },
];

const STATUS_STYLE: Record<string, string> = {
  진행중: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  기획중: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  팀원모집: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  완료: "bg-muted text-muted-foreground",
};

export function HackathonPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(DUMMY_MESSAGES);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        user: "나",
        avatar: "나",
        content: message.trim(),
        time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
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
    <div className="flex h-[calc(100vh-64px)] bg-muted/30 gap-4 p-4 overflow-hidden">
      {/* ── 왼쪽: 채팅 ──────────────────────────────────────────────────── */}
      <div className="w-[380px] shrink-0 flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* 채팅 헤더 */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">해커톤 채팅</p>
            <p className="text-[11px] text-muted-foreground">전체 참가자 오픈 채팅</p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            실시간
          </span>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((msg) =>
            msg.isMe ? (
              /* 내 메시지 */
              <div key={msg.id} className="flex flex-col items-end gap-1">
                <div className="max-w-[75%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm">
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
              </div>
            ) : (
              /* 상대방 메시지 */
              <div key={msg.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {msg.avatar}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-muted-foreground font-medium">{msg.user}</span>
                  <div className="max-w-[75%] bg-muted text-foreground rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm">
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
              </div>
            )
          )}
        </div>

        {/* 입력창 */}
        <div className="shrink-0 px-4 py-3 border-t border-border bg-card">
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 오른쪽: 프로젝트 현황 ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* 상단 요약 카드 */}
        <div className="shrink-0 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Trophy className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">참가 팀</p>
              <p className="text-xl font-bold text-foreground">{DUMMY_TEAMS.length}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">참가 인원</p>
              <p className="text-xl font-bold text-foreground">
                {DUMMY_TEAMS.reduce((acc, t) => acc + t.members.length, 0)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">남은 시간</p>
              <p className="text-xl font-bold text-foreground">48h</p>
            </div>
          </div>
        </div>

        {/* 팀 목록 */}
        <div className="flex-1 rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
          {/* 헤더 */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">프로젝트 현황</span>
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                구현 예정
              </span>
            </div>
          </div>

          {/* 팀 카드 목록 */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {DUMMY_TEAMS.map((team) => (
              <div
                key={team.id}
                className="rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* 팀 색상 dot */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${team.color}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{team.name}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[team.status]}`}>
                          {team.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{team.project}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </div>

                {/* 진행률 */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">진행률</span>
                    <span className="text-[10px] font-semibold text-foreground">{team.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${team.color} opacity-80 transition-all`}
                      style={{ width: `${team.progress}%` }}
                    />
                  </div>
                </div>

                {/* 태그 + 멤버 */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    {team.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">{team.members.length}명</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
