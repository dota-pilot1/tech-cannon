import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { MessageWithUser } from "@/entities/issue/types/issueMessage";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";

interface ChatMessageProps {
  message: MessageWithUser;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const user = useStore(authStore, (state) => state.user);
  const isMyMessage = user?.id === message.userId;

  if (isMyMessage) {
    // 내 메시지: 우측 정렬
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%]">
          <div className="flex items-baseline justify-end gap-2 mb-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(
                new Date(
                  message.createdAt.endsWith("Z")
                    ? message.createdAt
                    : message.createdAt + "Z",
                ),
                {
                  addSuffix: true,
                  locale: ko,
                },
              )}
            </span>
            <span className="font-semibold text-sm">나</span>
          </div>
          <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 다른 사용자 메시지: 좌측 정렬
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
        {message.username[0].toUpperCase()}
      </div>
      <div className="flex-1 max-w-[70%]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm">{message.username}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(
              new Date(
                message.createdAt.endsWith("Z")
                  ? message.createdAt
                  : message.createdAt + "Z",
              ),
              {
                addSuffix: true,
                locale: ko,
              },
            )}
          </span>
        </div>
        <div className="bg-secondary rounded-lg px-4 py-2">
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>
      </div>
    </div>
  );
}
