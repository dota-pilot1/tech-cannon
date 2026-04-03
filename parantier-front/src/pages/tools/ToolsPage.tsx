import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Star,
  Terminal,
  BookOpen,
  FolderOpen,
  HelpCircle,
  Braces,
  LayoutTemplate,
} from "lucide-react";
import { BookmarkTab } from "./tabs/BookmarkTab";
import { CommandTab } from "./tabs/CommandTab";
import { DevlogTab } from "./tabs/DevlogTab";
import { FilesTab } from "./tabs/FilesTab";
import { FaqTab } from "./tabs/FaqTab";
import { SnippetTab } from "./tabs/SnippetTab";
import { TemplateTab } from "./tabs/TemplateTab";

type TabKey =
  | "bookmark"
  | "command"
  | "devlog"
  | "files"
  | "faq"
  | "snippet"
  | "template";

const menuItems: {
  key: TabKey;
  icon: React.ReactNode;
  label: string;
  description: string;
  emoji: string;
  comingSoon?: boolean;
}[] = [
  {
    key: "bookmark",
    icon: <Star className="w-5 h-5" />,
    label: "즐겨찾기",
    description: "URL 즐겨찾기를 저장하고 팀과 공유하세요.",
    emoji: "⭐",
    comingSoon: true,
  },
  {
    key: "command",
    icon: <Terminal className="w-5 h-5" />,
    label: "명령어 저장",
    description: "자주 쓰는 CLI 명령어와 스니펫을 저장하세요.",
    emoji: "💻",
    comingSoon: true,
  },
  {
    key: "devlog",
    icon: <BookOpen className="w-5 h-5" />,
    label: "개발 일지",
    description: "개발 과정을 기록하고 회고하세요.",
    emoji: "📔",
    comingSoon: true,
  },
  {
    key: "files",
    icon: <FolderOpen className="w-5 h-5" />,
    label: "파일 관리",
    description: "팀 파일을 업로드하고 공유하세요.",
    emoji: "📁",
    comingSoon: true,
  },
  {
    key: "faq",
    icon: <HelpCircle className="w-5 h-5" />,
    label: "FAQ",
    description: "자주 묻는 질문과 답변을 관리하세요.",
    emoji: "❓",
    comingSoon: true,
  },
  {
    key: "snippet",
    icon: <Braces className="w-5 h-5" />,
    label: "코드 스니펫",
    description: "자주 쓰는 코드 스니펫을 저장하고 공유하세요.",
    emoji: "📝",
    comingSoon: true,
  },
  {
    key: "template",
    icon: <LayoutTemplate className="w-5 h-5" />,
    label: "템플릿",
    description: "반복 사용하는 문서/코드 템플릿을 관리하세요.",
    emoji: "🗂️",
    comingSoon: true,
  },
];

const validTabs = new Set<TabKey>([
  "bookmark",
  "command",
  "devlog",
  "files",
  "faq",
  "snippet",
  "template",
]);

function getInitialTab(): TabKey | null {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && validTabs.has(tab as TabKey)) return tab as TabKey;
  return null;
}

function renderTab(tab: TabKey) {
  switch (tab) {
    case "bookmark":
      return <BookmarkTab />;
    case "command":
      return <CommandTab />;
    case "devlog":
      return <DevlogTab />;
    case "files":
      return <FilesTab />;
    case "faq":
      return <FaqTab />;
    case "snippet":
      return <SnippetTab />;
    case "template":
      return <TemplateTab />;
  }
}

export function ToolsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey | null>(getInitialTab);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    navigate({ to: "/tools", search: { tab } });
  };

  const handleHome = () => {
    setActiveTab(null);
    navigate({ to: "/tools" });
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
              <span className="text-base">🛠️</span>
              <h2 className="text-sm font-semibold text-foreground">도구</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              팀 생산성 도구 모음
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
            /* 탭 콘텐츠 */
            renderTab(activeTab)
          ) : (
            /* 홈: 안내 */
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <span className="text-4xl mb-4">🛠️</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                도구를 선택하세요
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                왼쪽 메뉴에서 사용할 도구를 선택하면
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
