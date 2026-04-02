import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarCheck,
  Code2,
  Database,
  GitPullRequest,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Star,
  ChevronRight,
  Lock,
} from "lucide-react";

type TabKey = "daily" | "algo" | "sql" | "review" | "rank";

const menuItems: {
  key: TabKey;
  icon: React.ReactNode;
  label: string;
  description: string;
  emoji: string;
  comingSoon?: boolean;
}[] = [
  {
    key: "daily",
    icon: <CalendarCheck className="w-5 h-5" />,
    label: "데일리 챌린지",
    description: "매일 새로운 코딩 챌린지에 도전하세요.",
    emoji: "📅",
  },
  {
    key: "algo",
    icon: <Code2 className="w-5 h-5" />,
    label: "알고리즘",
    description: "알고리즘 문제를 풀고 실력을 키우세요.",
    emoji: "🧩",
  },
  {
    key: "sql",
    icon: <Database className="w-5 h-5" />,
    label: "SQL 챌린지",
    description: "SQL 쿼리 문제를 풀어보세요.",
    emoji: "🗄️",
  },
  {
    key: "review",
    icon: <GitPullRequest className="w-5 h-5" />,
    label: "코드 리뷰",
    description: "팀원의 코드를 리뷰하고 피드백을 남기세요.",
    emoji: "👀",
  },
  {
    key: "rank",
    icon: <Trophy className="w-5 h-5" />,
    label: "랭킹",
    description: "팀 내 챌린지 랭킹을 확인하세요.",
    emoji: "🏆",
  },
];

const validTabs = new Set<TabKey>(["daily", "algo", "sql", "review", "rank"]);

function getInitialTab(): TabKey | null {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && validTabs.has(tab as TabKey)) return tab as TabKey;
  return null;
}

/* ─────────────────── 데일리 챌린지 ─────────────────── */
function DailyTab() {
  return (
    <div className="p-6 space-y-5">
      {/* 오늘의 챌린지 */}
      <div className="rounded-xl border border-border bg-primary/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            📅 오늘의 챌린지 · Day 42
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            18:24:09 남음
          </span>
        </div>
        <h2 className="text-base font-bold text-foreground mb-1">
          FizzBuzz 변형 문제
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          1부터 N까지 숫자 중 3의 배수는 "Fizz", 5의 배수는 "Buzz", 15의 배수는
          "FizzBuzz"를 출력하되, 7의 배수일 경우 "Lucky"를 추가 출력하세요.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
            난이도: 쉬움
          </span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            언어 자유
          </span>
        </div>
      </div>

      {/* 참여 현황 */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          오늘의 참여 현황
        </h3>
        <div className="space-y-2">
          {[
            {
              name: "김민준",
              time: "09:12",
              status: "완료",
              color: "text-green-500",
            },
            {
              name: "이서연",
              time: "10:45",
              status: "완료",
              color: "text-green-500",
            },
            {
              name: "박지훈",
              time: "11:30",
              status: "도전 중",
              color: "text-yellow-500",
            },
            {
              name: "최수아",
              time: "-",
              status: "미참여",
              color: "text-muted-foreground",
            },
            {
              name: "정하은",
              time: "-",
              status: "미참여",
              color: "text-muted-foreground",
            },
          ].map((user) => (
            <div
              key={user.name}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-card text-sm"
            >
              <span className="font-medium text-foreground">{user.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  {user.time}
                </span>
                <span className={`text-xs font-medium ${user.color}`}>
                  {user.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 연속 달성 */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          🔥 연속 달성 현황
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold border ${
                i < 7
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "bg-muted/30 border-border text-muted-foreground"
              }`}
            >
              {i < 7 ? <Flame className="w-4 h-4" /> : i + 1}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          현재 7일 연속 달성 중 🔥
        </p>
      </div>
    </div>
  );
}

/* ─────────────────── 알고리즘 ─────────────────── */
function AlgoTab() {
  const problems = [
    { id: 1, title: "두 수의 합", level: "쉬움", tag: "배열", solved: true },
    { id: 2, title: "유효한 괄호", level: "쉬움", tag: "스택", solved: true },
    {
      id: 3,
      title: "최장 공통 부분 수열",
      level: "보통",
      tag: "DP",
      solved: false,
    },
    {
      id: 4,
      title: "이진 탐색 트리",
      level: "보통",
      tag: "트리",
      solved: false,
    },
    {
      id: 5,
      title: "다익스트라 최단 경로",
      level: "어려움",
      tag: "그래프",
      solved: false,
      locked: true,
    },
    {
      id: 6,
      title: "N-Queen 문제",
      level: "어려움",
      tag: "백트래킹",
      solved: false,
      locked: true,
    },
  ];

  const levelColor: Record<string, string> = {
    쉬움: "text-green-600 dark:text-green-400 bg-green-500/10",
    보통: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
    어려움: "text-red-600 dark:text-red-400 bg-red-500/10",
  };

  return (
    <div className="p-6 space-y-4">
      {/* 진행률 */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">2</p>
          <p className="text-xs text-muted-foreground">해결</p>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>전체 진행률</span>
            <span>2 / 6</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: "33%" }}
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">33%</p>
          <p className="text-xs text-muted-foreground">달성률</p>
        </div>
      </div>

      {/* 문제 목록 */}
      <div className="space-y-2">
        {problems.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {p.solved ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : p.locked ? (
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${p.locked ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {p.id}. {p.title}
                </p>
                <p className="text-xs text-muted-foreground">{p.tag}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${levelColor[p.level]}`}
              >
                {p.level}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── SQL 챌린지 ─────────────────── */
function SqlTab() {
  const problems = [
    {
      id: 1,
      title: "활성 유저 조회",
      desc: "is_active = true인 유저를 조회하세요.",
      level: "쉬움",
      solved: true,
    },
    {
      id: 2,
      title: "게시글 작성자 JOIN",
      desc: "posts와 users를 JOIN해서 작성자 이름을 함께 조회하세요.",
      level: "쉬움",
      solved: true,
    },
    {
      id: 3,
      title: "댓글 수 집계",
      desc: "각 게시글의 댓글 수를 GROUP BY로 집계하세요.",
      level: "보통",
      solved: false,
    },
    {
      id: 4,
      title: "좋아요 TOP 5",
      desc: "좋아요가 가장 많은 게시글 5개를 구하세요.",
      level: "보통",
      solved: false,
    },
    {
      id: 5,
      title: "대댓글 재귀 조회",
      desc: "parent_id를 활용해 계층형 댓글을 조회하세요.",
      level: "어려움",
      solved: false,
    },
  ];

  const levelColor: Record<string, string> = {
    쉬움: "text-green-600 dark:text-green-400 bg-green-500/10",
    보통: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
    어려움: "text-red-600 dark:text-red-400 bg-red-500/10",
  };

  return (
    <div className="p-6 space-y-4">
      {/* 안내 */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-sm text-primary">
        💡 SQL 연습장의 실제 DB를 기반으로 한 챌린지예요. SQL 탭에서 직접 쿼리를
        실행해보세요!
      </div>

      {/* 문제 목록 */}
      <div className="space-y-2">
        {problems.map((p) => (
          <div
            key={p.id}
            className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="mt-0.5">
              {p.solved ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground">
                  {p.id}. {p.title}
                </p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${levelColor[p.level]}`}
                >
                  {p.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── 코드 리뷰 ─────────────────── */
function ReviewTab() {
  const reviews = [
    {
      id: 1,
      author: "박지훈",
      title: "N+1 해결 코드 리뷰 요청",
      desc: "fetch join으로 해결했는데 더 좋은 방법이 있을까요?",
      comments: 3,
      time: "2시간 전",
      status: "리뷰 중",
      statusColor: "text-yellow-500 bg-yellow-500/10",
    },
    {
      id: 2,
      author: "윤채원",
      title: "React useCallback 최적화",
      desc: "불필요한 리렌더링을 막기 위해 useCallback을 사용했습니다.",
      comments: 5,
      time: "어제",
      status: "완료",
      statusColor: "text-green-500 bg-green-500/10",
    },
    {
      id: 3,
      author: "임도현",
      title: "Docker compose 설정 검토",
      desc: "처음 작성한 docker-compose.yml 파일입니다. 피드백 부탁드려요.",
      comments: 1,
      time: "3일 전",
      status: "완료",
      statusColor: "text-green-500 bg-green-500/10",
    },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          리뷰 요청 목록
        </h3>
        <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
          + 리뷰 요청
        </button>
      </div>

      {/* 목록 */}
      <div className="space-y-2">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="px-4 py-3.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-sm font-medium text-foreground">{r.title}</p>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${r.statusColor}`}
              >
                {r.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {r.desc}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{r.author}</span>
              <span>💬 {r.comments}개</span>
              <span>{r.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── 랭킹 ─────────────────── */
function RankTab() {
  const ranks = [
    {
      rank: 1,
      name: "김민준",
      score: 1240,
      solved: 42,
      streak: 15,
      badge: "🥇",
    },
    {
      rank: 2,
      name: "이서연",
      score: 1105,
      solved: 38,
      streak: 10,
      badge: "🥈",
    },
    { rank: 3, name: "강태양", score: 980, solved: 33, streak: 7, badge: "🥉" },
    { rank: 4, name: "한소희", score: 870, solved: 29, streak: 5, badge: "" },
    { rank: 5, name: "박지훈", score: 740, solved: 24, streak: 3, badge: "" },
    { rank: 6, name: "오준서", score: 610, solved: 20, streak: 2, badge: "" },
    { rank: 7, name: "정하은", score: 480, solved: 16, streak: 1, badge: "" },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* 내 순위 */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
          5
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            나의 현재 순위
          </p>
          <p className="text-xs text-muted-foreground">
            박지훈 · 740점 · 24문제 해결
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary font-medium">
          <Flame className="w-3.5 h-3.5" />
          3일 연속
        </div>
      </div>

      {/* 랭킹 테이블 */}
      <div className="space-y-1.5">
        {ranks.map((r) => (
          <div
            key={r.rank}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
              r.name === "박지훈"
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card hover:bg-muted/30"
            }`}
          >
            <div className="w-6 text-center">
              {r.badge ? (
                <span className="text-base">{r.badge}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-medium">
                  {r.rank}
                </span>
              )}
            </div>
            <p className="flex-1 text-sm font-medium text-foreground">
              {r.name}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                {r.solved}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {r.streak}일
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                {r.score.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── renderTab ─────────────────── */
function renderTab(tab: TabKey) {
  switch (tab) {
    case "daily":
      return <DailyTab />;
    case "algo":
      return <AlgoTab />;
    case "sql":
      return <SqlTab />;
    case "review":
      return <ReviewTab />;
    case "rank":
      return <RankTab />;
  }
}

/* ─────────────────── ChallengePage ─────────────────── */
export function ChallengePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey | null>(getInitialTab);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    navigate({ to: "/challenge", search: { tab } });
  };

  const handleHome = () => {
    setActiveTab(null);
    navigate({ to: "/challenge" });
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-4xl h-[680px] flex rounded-2xl border border-border shadow-lg overflow-hidden bg-card">
        {/* ── 왼쪽 사이드바 ── */}
        <aside className="w-52 border-r border-border bg-muted/30 flex flex-col shrink-0">
          <button
            onClick={handleHome}
            className="px-4 pt-5 pb-4 border-b border-border text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🏆</span>
              <h2 className="text-sm font-semibold text-foreground">챌린지</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              코딩 챌린지 모음
            </p>
          </button>

          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-0.5 px-2">
              {menuItems.map(({ key, icon, label }) => (
                <li key={key}>
                  <button
                    onClick={() => handleTabChange(key)}
                    className={[
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                      activeTab === key
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* ── 오른쪽 본문 ── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {activeTab ? (
            renderTab(activeTab)
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <span className="text-4xl mb-4">🏆</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                챌린지
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                왼쪽 메뉴에서 챌린지를 선택하면
                <br />
                여기에 내용이 표시됩니다.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
