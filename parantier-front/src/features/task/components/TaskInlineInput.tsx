import { FolderOpen, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TaskInlineFolderInputProps {
  depth: number;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TaskInlineFolderInput({
  depth,
  value,
  onChange,
  onConfirm,
  onCancel,
}: TaskInlineFolderInputProps) {
  return (
    <div className={cn("flex items-center gap-2 py-1 px-3", depth > 0 ? "ml-4" : "")}>
      <FolderOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") onConfirm();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="이름 입력 후 Enter"
        className="flex-1 border border-ring rounded px-1.5 py-0.5 text-xs min-w-0 focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
      />
    </div>
  );
}

interface TaskInlineDocInputProps {
  depth: number;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TaskInlineDocInput({
  depth,
  value,
  onChange,
  onConfirm,
  onCancel,
}: TaskInlineDocInputProps) {
  return (
    <div className={cn("flex items-center gap-2 py-1 px-3", depth > 0 ? "ml-4" : "")}>
      <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") onConfirm();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="제목 입력 후 Enter"
        className="flex-1 border border-ring rounded px-1.5 py-0.5 text-xs min-w-0 focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
      />
    </div>
  );
}
