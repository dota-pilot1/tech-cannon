import { useEffect, useRef, useMemo } from "react";
import { WifiOff, AlertCircle } from "lucide-react";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ChatInput } from "@/features/issue/components/ChatInput";
import {
  useWorkStatusChat,
  useWorkStatusChatHistory,
  type Participant,
} from "../hooks/useWorkStatusChat";
import type { WorkStatusChatMessageWithUser } from "@/entities/work/types/workStatusChat";

// ── 참여자 아바타 ────────────────────────────────────────────────────────────
function ParticipantAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(name.length - 1).toUpperCase() : "?";
  return (
    <div
      className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0"
      title={name}
    >
      {initial}
    </div>
  );
}

// ── 메시지 아이템 ────────────────────────────────────────────────────────────
function ChatMessageItem({
  message,
  myUserId,
}: {
  message: WorkStatusChatMessageWithUser;
  myUserId: number | undefined;
}) {
  const isMe = myUserId === message.userId;
  const timeStr = formatDistanceToNow(
    new Date(
      message.createdAt.endsWith("Z")
        ? message.createdAt
        : message.createdAt + "Z",
    ),
    { addSuffix: true, locale: ko },
  );

  if (isMe) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[72%]">
          <div className="flex items-baseline justify-end gap-1.5 mb-1">
            <span className="text-xs text-muted-foreground">{timeStr}</span>
            <span className="text-xs font-semibold text-foreground">나</span>
          </div>
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2">
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
        {message.username
          ? message.username.charAt(message.username.length - 1).toUpperCase()
          : "?"}
      </div>
      <div className="flex-1 max-w-[72%]">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-xs font-semibold text-foreground">
            {message.username}
          </span>
          <span className="text-xs text-muted-foreground">{timeStr}</span>
        </div>
        <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2">
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 메인 패널 ────────────────────────────────────────────────────────────────
export function WorkStatusChatPanel() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useStore(authStore, (state) => state.user);
  const isAuthenticated = useStore(authStore, (state) => state.isAuthenticated);

  // REST API: 과거 메시지
  const { data: history = [], isLoading } = useWorkStatusChatHistory();

  // WebSocket: 실시간 (탭 진입 시 userId/username 전달 → 즉시 join 이벤트)
  const {
    messages: realtime,
    isConnected,
    participants,
    sendMessage,
  } = useWorkStatusChat({
    enabled: true,
    userId: user?.id,
    username: user?.username,
  });

  // 과거 + 실시간 합치기 (id 기준 중복 제거)
  const allMessages = useMemo(() => {
    const map = new Map<number, WorkStatusChatMessageWithUser>();
    [...history, ...realtime].forEach((m) => map.set(m.id, m));
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [history, realtime]);

  // 참여자: 서버에서 받은 실시간 participants 그대로 사용
  const allParticipants: Participant[] = participants;

  // 새 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = (message: string) => {
    if (!user?.id) return;
    sendMessage(message, user.id, user.username);
  };

  const isUserReady = isAuthenticated && !!user?.id;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 참여자 영역 */}
      <div className="shrink-0 border-b border-border pb-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            참여자
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? "bg-green-500 animate-pulse"
                  : "bg-muted-foreground"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isConnected
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            >
              {isConnected ? "연결됨" : "연결 중..."}
            </span>
          </div>
        </div>
        {allParticipants.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            아직 참여자가 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allParticipants.map((p) => (
              <div key={p.userId} className="flex items-center gap-1.5">
                <ParticipantAvatar name={p.username} />
                <span className="text-xs text-foreground">{p.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${i % 2 === 0 ? "" : "justify-end"}`}
              >
                {i % 2 === 0 && (
                  <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                )}
                <div className="space-y-1.5 max-w-[60%]">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-8 bg-muted rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-sm font-medium text-foreground">
              아직 메시지가 없습니다
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              첫 메시지를 보내보세요 💬
            </p>
          </div>
        ) : (
          <>
            {allMessages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} myUserId={user?.id} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 연결 경고 */}
      {!isConnected && !isLoading && (
        <div className="shrink-0 px-0 py-2">
          <div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
            <WifiOff className="w-3.5 h-3.5 text-destructive shrink-0" />
            <p className="text-xs text-destructive">
              실시간 연결이 끊어졌습니다. 재연결 중...
            </p>
          </div>
        </div>
      )}

      {/* 사용자 미준비 경고 */}
      {!isUserReady && (
        <div className="shrink-0 py-2">
          <div className="flex items-center gap-2 p-2.5 bg-muted border border-border rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              사용자 정보를 불러오는 중입니다...
            </p>
          </div>
        </div>
      )}

      {/* 입력창 */}
      <div className="shrink-0 -mx-0">
        <ChatInput
          onSend={handleSend}
          disabled={!isConnected || !isUserReady}
        />
      </div>
    </div>
  );
}
