import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Play, Loader2 } from "lucide-react";

interface SqlInputBarProps {
  onExecute: (query: string) => void;
  isLoading: boolean;
}

export function SqlInputBar({ onExecute, isLoading }: SqlInputBarProps) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = query.substring(0, start) + "  " + query.substring(end);
      setQuery(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleExecute = () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onExecute(trimmed);
    setQuery("");
  };

  return (
    <div className="border-t border-border bg-background p-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              "SQL 쿼리를 입력하세요 (Ctrl+Enter 실행)\n예: SELECT * FROM users LIMIT 10"
            }
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          onClick={handleExecute}
          disabled={!query.trim() || isLoading}
          className="mb-0.5 h-10 px-4"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Ctrl+Enter로 실행 · Tab으로 들여쓰기
      </p>
    </div>
  );
}
