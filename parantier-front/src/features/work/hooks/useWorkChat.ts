import { useEffect, useState } from "react";
import type { WorkMessageWithUser } from "@/entities/work/types/workMessage";
import { usePureWebSocket } from "@/shared/hooks/usePureWebSocket";

interface UseWorkChatOptions {
  workId: number;
}

/**
 * 순수 WebSocket을 사용한 업무 실시간 채팅 훅
 *
 * - 실시간 메시지만 관리 (history는 useWorkMessages로 가져옴)
 * - 컴포넌트가 마운트될 때 WebSocket 연결
 * - 컴포넌트가 언마운트될 때 WebSocket 연결 해제
 */
export function useWorkChat({ workId }: UseWorkChatOptions) {
  const [messages, setMessages] = useState<WorkMessageWithUser[]>([]);

  const { isConnected, send, subscribe, unsubscribe } = usePureWebSocket();

  useEffect(() => {
    if (!workId) return;
    const topic = `work/${workId}`;

    const handler = (data: unknown) => {
      const raw = data as WorkMessageWithUser & { senderName?: string };
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
  }, [workId, subscribe, unsubscribe]);

  /**
   * 메시지 전송
   */
  const sendMessage = (message: string, userId: number, username: string) => {
    send({
      type: "CHAT",
      topic: `work/${workId}`,
      data: { senderId: userId, senderName: username, message },
    });
  };

  return {
    messages,
    isConnected,
    sendMessage,
  };
}
