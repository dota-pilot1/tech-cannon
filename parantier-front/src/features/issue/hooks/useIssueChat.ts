import { useEffect, useState } from "react";
import type { MessageWithUser } from "@/entities/issue/types/issueMessage";
import { usePureWebSocket } from "@/shared/hooks/usePureWebSocket";

interface UseIssueChatOptions {
  issueId: number;
}

/**
 * 순수 WebSocket을 사용한 실시간 이슈 채팅 훅
 *
 * - 실시간 메시지만 관리 (history는 useIssueMessages로 가져옴)
 * - 컴포넌트가 마운트될 때 WebSocket 연결
 * - 컴포넌트가 언마운트될 때 WebSocket 연결 해제
 */
export function useIssueChat({ issueId }: UseIssueChatOptions) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);

  const { isConnected, send, subscribe, unsubscribe } = usePureWebSocket();

  useEffect(() => {
    if (!issueId) return;
    const topic = `issue/${issueId}`;

    const handler = (data: unknown) => {
      const raw = data as MessageWithUser & { senderName?: string };
      setMessages((prev) => [
        ...prev,
        {
          ...raw,
          username: raw.username ?? raw.senderName ?? "알 수 없음",
          createdAt: raw.createdAt ?? new Date().toISOString(),
        },
      ]);
    };

    subscribe(topic, handler);

    return () => unsubscribe(topic, handler);
  }, [issueId, subscribe, unsubscribe]);

  /**
   * 메시지 전송
   */
  const sendMessage = (message: string, userId: number, username: string) => {
    send({
      type: "CHAT",
      topic: `issue/${issueId}`,
      data: { senderId: userId, senderName: username, message },
    });
  };

  return {
    messages,
    isConnected,
    sendMessage,
  };
}
