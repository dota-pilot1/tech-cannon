import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { workStatusChatApi } from "@/entities/work/api/workStatusChatApi";
import type { WorkStatusChatMessageWithUser } from "@/entities/work/types/workStatusChat";
import { usePureWebSocket } from "@/shared/hooks/usePureWebSocket";

export function useWorkStatusChatHistory() {
  return useQuery({
    queryKey: ["work-status-chat"],
    queryFn: () => workStatusChatApi.getRecentMessages(100),
  });
}

export interface Participant {
  userId: number;
  username: string;
}

interface UseWorkStatusChatOptions {
  userId?: number;
  username?: string;
}

export function useWorkStatusChat({
  userId,
  username,
}: UseWorkStatusChatOptions = {}) {
  const [messages, setMessages] = useState<WorkStatusChatMessageWithUser[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { isConnected, isConnecting, send, subscribe, unsubscribe } =
    usePureWebSocket();

  // 메시지 구독 (onOpen 패턴 - isConnected 가드 제거)
  useEffect(() => {
    if (!userId || !username) return;

    const chatHandler = (data: unknown) => {
      const raw = data as WorkStatusChatMessageWithUser & {
        senderName?: string;
      };
      setMessages((prev) => [
        ...prev,
        {
          ...raw,
          username: raw.username ?? raw.senderName ?? "알 수 없음",
          createdAt: raw.createdAt ?? new Date().toISOString(),
        },
      ]);
    };

    subscribe("work-status", chatHandler);

    return () => unsubscribe("work-status", chatHandler);
  }, [userId, username, subscribe, unsubscribe]);

  // 참여자 구독 + JOIN (onOpen 패턴)
  useEffect(() => {
    if (!userId || !username) return;

    const participantHandler = (data: unknown) => {
      const payload = data as { participants: Participant[] };
      setParticipants(payload.participants ?? []);
    };

    subscribe("work-status-participants", participantHandler, () => {
      send({
        type: "JOIN",
        topic: "work-status-participants",
        data: { userId, username },
      });
    });

    return () => {
      send({
        type: "LEAVE",
        topic: "work-status-participants",
        data: { userId, username },
      });
      unsubscribe("work-status-participants", participantHandler);
    };
  }, [userId, username, send, subscribe, unsubscribe]);

  const sendMessage = (
    message: string,
    senderId: number,
    senderName: string,
  ) => {
    send({
      type: "CHAT",
      topic: "work-status",
      data: { senderId, senderName, message },
    });
  };

  return {
    messages,
    isConnected,
    isConnecting,
    participants,
    sendMessage,
  };
}

// ── 참여자 수만 구독하는 경량 훅 (채팅 탭 미진입 상태에서도 동작) ──────────
export function useWorkStatusParticipants({
  userId,
  username,
}: {
  userId?: number;
  username?: string;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { send, subscribe, unsubscribe } = usePureWebSocket();

  useEffect(() => {
    if (!userId || !username) return;

    const handler = (data: unknown) => {
      const payload = data as { participants: Participant[] };
      setParticipants(payload.participants ?? []);
    };

    subscribe("work-status-participants", handler, () => {
      send({
        type: "JOIN",
        topic: "work-status-participants",
        data: { userId, username },
      });
    });

    return () => {
      send({
        type: "LEAVE",
        topic: "work-status-participants",
        data: { userId, username },
      });
      unsubscribe("work-status-participants", handler);
      setParticipants([]);
    };
  }, [userId, username, send, subscribe, unsubscribe]);

  return { participants };
}
