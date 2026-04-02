import { MessageSquare } from "lucide-react";

export function MessagesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
      <MessageSquare className="w-10 h-10 opacity-30" />
      <p className="text-sm font-medium">쪽지함</p>
      <p className="text-xs opacity-60">준비 중입니다.</p>
    </div>
  );
}
