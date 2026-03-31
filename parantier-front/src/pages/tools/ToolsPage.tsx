import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Star, Terminal, BookOpen, FolderOpen, HelpCircle } from "lucide-react";
import { BookmarkTab } from "./tabs/BookmarkTab";
import { CommandTab } from "./tabs/CommandTab";
import { DevlogTab } from "./tabs/DevlogTab";
import { FilesTab } from "./tabs/FilesTab";
import { FaqTab } from "./tabs/FaqTab";

type TabKey = "bookmark" | "command" | "devlog" | "files" | "faq";

const menuItems: {
  key: TabKey;
  icon: React.ReactNode;
  label: string;
}[] = [
  { key: "bookmark", icon: <Star className="w-4 h-4" />, label: "즐겨찾기" },
  { key: "command", icon: <Terminal className="w-4 h-4" />, label: "명령어 저장" },
  { key: "devlog", icon: <BookOpen className="w-4 h-4" />, label: "개발 일지" },
  { key: "files", icon: <FolderOpen className="w-4 h-4" />, label: "파일 관리" },
  { key: "faq", icon: <HelpCircle className="w-4 h-4" />, label: "FAQ" },
];

const validTabs = new Set<TabKey>(["bookmark", "command", "devlog", "files", "faq"]);

function getInitialTab(): TabKey {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && validTabs.has(tab as TabKey)) {
    return tab as TabKey;
  }
  return "bookmark";
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
  }
}

export function ToolsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    navigate({ to: "/tools", search: { tab } });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* 사이드바 */}
      <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0">
        <div className="px-4 pt-6 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">도구</h2>
          <p className="text-xs text-muted-foreground mt-0.5">팀 생산성 도구 모음</p>
        </div>

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

      {/* 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto bg-background">
        {renderTab(activeTab)}
      </main>
    </div>
  );
}
