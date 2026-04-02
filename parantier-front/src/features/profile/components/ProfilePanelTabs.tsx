import { useState } from "react";
import { MessageSquare, Bookmark, NotebookPen, BookMarked } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { MessagesTab } from "./MessagesTab";
import { BookmarksTab } from "./BookmarksTab";
import { MemosTab } from "./MemosTab";
import { DevLogsTab } from "./DevLogsTab";

type TabId = "messages" | "bookmarks" | "memos" | "devlogs";

const TABS = [
  { id: "messages" as TabId, label: "메시지함", Icon: MessageSquare },
  { id: "bookmarks" as TabId, label: "즐겨찾기", Icon: Bookmark },
  { id: "memos" as TabId, label: "메모장", Icon: NotebookPen },
  { id: "devlogs" as TabId, label: "개발 일지", Icon: BookMarked },
];

export function ProfilePanelTabs() {
  const [active, setActive] = useState<TabId>("messages");

  return (
    <Card className="p-0 overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-border">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              active === id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-4 min-h-[500px]">
        {active === "messages" && <MessagesTab />}
        {active === "bookmarks" && <BookmarksTab />}
        {active === "memos" && <MemosTab />}
        {active === "devlogs" && <DevLogsTab />}
      </div>
    </Card>
  );
}
