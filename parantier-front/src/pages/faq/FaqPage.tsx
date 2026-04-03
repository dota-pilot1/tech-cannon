import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  HelpCircle,
  Code2,
  BookOpen,
  Shield,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

type TabKey = "general" | "dev" | "onboarding" | "policy" | "contact";

const menuItems: {
  key: TabKey;
  icon: React.ReactNode;
  label: string;
  emoji: string;
  comingSoon?: boolean;
}[] = [
  {
    key: "general",
    icon: <HelpCircle className="w-5 h-5" />,
    label: "일반 FAQ",
    emoji: "❓",
  },
  {
    key: "dev",
    icon: <Code2 className="w-5 h-5" />,
    label: "개발 FAQ",
    emoji: "💻",
  },
  {
    key: "onboarding",
    icon: <BookOpen className="w-5 h-5" />,
    label: "온보딩 가이드",
    emoji: "📚",
    comingSoon: true,
  },
  {
    key: "policy",
    icon: <Shield className="w-5 h-5" />,
    label: "정책/규정",
    emoji: "📋",
    comingSoon: true,
  },
  {
    key: "contact",
    icon: <MessageSquare className="w-5 h-5" />,
    label: "문의하기",
    emoji: "💬",
    comingSoon: true,
  },
];

const validTabs = new Set<TabKey>(["general", "dev", "onboarding", "policy", "contact"]);

function getInitialTab(): TabKey | null {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && validTabs.has(tab as TabKey)) return tab as TabKey;
  return null;
}

/* ─────────────────── 일반 FAQ ─────────────────── */
const generalFaqs = [
  {
    id: 1,
    question: "TechCannon은 어떤 서비스인가요?",
    answer:
      "TechCannon은 팀의 생산성을 높이기 위한 개발자 협업 플랫폼입니다. 이슈 관리, 스터디, 챌린지, 문서 관리 등 다양한 기능을 제공합니다.",
  },
  {
    id: 2,
    question: "계정을 만들려면 어떻게 하나요?",
    answer:
      "우측 상단의 '회원가입' 버튼을 클릭하여 이메일과 비밀번호를 입력하면 바로 가입할 수 있습니다.",
  },
  {
    id: 3,
    question: "비밀번호를 잊어버렸어요.",
    answer:
      "현재 비밀번호 재설정 기능은 준비 중입니다. 관리자에게 문의해 주세요.",
  },
  {
    id: 4,
    question: "팀원을 초대하려면?",
    answer:
      "관리자 권한이 있는 경우 Admin > 유저 관리 메뉴에서 팀원을 추가할 수 있습니다.",
  },
  {
    id: 5,
    question: "다크 모드를 지원하나요?",
    answer:
      "네, 우측 상단의 테마 토글 버튼을 통해 라이트/다크 모드를 전환할 수 있습니다.",
  },
];

function GeneralFaqTab() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">❓ 일반 FAQ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          서비스 이용에 관한 자주 묻는 질문을 확인하세요.
        </p>
      </div>

      {/* 검색 인풋 */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="FAQ 검색..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* 아코디언 목록 */}
      <ul className="space-y-2">
        {generalFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <li
              key={faq.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-card hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-primary shrink-0 rotate-0 transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 py-3 bg-muted/30 border-t border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────── 개발 FAQ ─────────────────── */
const devFaqCategories = [
  {
    category: "환경 설정",
    items: [
      {
        id: 101,
        question: "로컬 개발 환경 설정은?",
        answer:
          "Node.js 18+, Java 21 환경이 필요합니다. README.md를 참고해 주세요.",
      },
      {
        id: 102,
        question: "백엔드 API 포트는?",
        answer:
          "기본 포트는 8080입니다. 프론트는 Vite 기본 포트 5173을 사용합니다.",
      },
    ],
  },
  {
    category: "배포",
    items: [
      {
        id: 201,
        question: "배포는 어떻게 하나요?",
        answer:
          "deploy.sh 스크립트를 실행하거나 GitHub Actions를 통해 자동 배포됩니다.",
      },
      {
        id: 202,
        question: "환경 변수 설정은?",
        answer:
          ".env 파일을 루트에 생성하고 VITE_API_BASE_URL 등을 설정해 주세요.",
      },
    ],
  },
  {
    category: "트러블슈팅",
    items: [
      {
        id: 301,
        question: "CORS 에러가 발생해요.",
        answer:
          "백엔드 SecurityConfig의 CORS 설정을 확인하세요. 개발 환경에서는 http://localhost:5173을 허용해야 합니다.",
      },
      {
        id: 302,
        question: "JWT 토큰 만료 처리는?",
        answer:
          "현재 액세스 토큰 만료 시 자동 갱신 기능은 개발 중입니다. 만료 시 재로그인이 필요합니다.",
      },
    ],
  },
];

function DevFaqTab() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">💻 개발 FAQ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          개발 환경, 배포, 트러블슈팅 관련 FAQ입니다.
        </p>
      </div>

      {/* 카테고리별 섹션 */}
      <div className="space-y-5">
        {devFaqCategories.map((cat) => (
          <section key={cat.category}>
            {/* 카테고리 헤더 */}
            <div className="mb-2 px-3 py-1.5 rounded-md bg-primary/10 inline-block">
              <span className="text-xs font-semibold text-primary">
                {cat.category}
              </span>
            </div>

            {/* 아코디언 목록 */}
            <ul className="space-y-1.5">
              {cat.items.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <li
                    key={faq.id}
                    className="rounded-lg border border-border overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(faq.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-card hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3 bg-muted/30 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Coming Soon 탭 ─────────────────── */
function ComingSoonTab({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <span className="text-4xl mb-4">{emoji}</span>
      <h2 className="text-lg font-semibold text-foreground mb-2">{label}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        해당 기능은 현재 준비 중입니다.
        <br />
        조금만 기다려 주세요!
      </p>
      <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
        Coming Soon
      </span>
    </div>
  );
}

/* ─────────────────── renderTab ─────────────────── */
function renderTab(tab: TabKey) {
  switch (tab) {
    case "general":
      return <GeneralFaqTab />;
    case "dev":
      return <DevFaqTab />;
    case "onboarding":
      return <ComingSoonTab emoji="📚" label="온보딩 가이드" />;
    case "policy":
      return <ComingSoonTab emoji="📋" label="정책/규정" />;
    case "contact":
      return <ComingSoonTab emoji="💬" label="문의하기" />;
  }
}

/* ─────────────────── FaqPage ─────────────────── */
export function FaqPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey | null>(getInitialTab);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    navigate({ to: "/faq", search: { tab } });
  };

  const handleHome = () => {
    setActiveTab(null);
    navigate({ to: "/faq" });
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-4xl h-[680px] flex rounded-2xl border border-border shadow-lg overflow-hidden bg-card">
        {/* ── 왼쪽 사이드바 ── */}
        <aside className="w-52 border-r border-border bg-muted/30 flex flex-col shrink-0">
          {/* 헤더 */}
          <button
            onClick={handleHome}
            className="px-4 pt-5 pb-4 border-b border-border text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">❓</span>
              <h2 className="text-sm font-semibold text-foreground">FAQ</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              자주 묻는 질문
            </p>
          </button>

          {/* 메뉴 */}
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-0.5 px-2">
              {menuItems.map(({ key, icon, label, comingSoon }) => (
                <li key={key}>
                  <button
                    onClick={() => handleTabChange(key)}
                    className={[
                      "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                      activeTab === key
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2.5">
                      {icon}
                      <span>{label}</span>
                    </span>
                    {comingSoon && (
                      <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full shrink-0">
                        Soon
                      </span>
                    )}
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
              <span className="text-4xl mb-4">❓</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                FAQ를 선택하세요
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                왼쪽 메뉴에서 보고 싶은 FAQ를 선택하면
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
