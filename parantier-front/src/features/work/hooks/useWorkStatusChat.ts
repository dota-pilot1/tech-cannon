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
  enabled?: boolean;
  userId?: number;
  username?: string;
}

export function useWorkStatusChat({
  enabled = true,
  userId,
  username,
}: UseWorkStatusChatOptions = {}) {
  const [messages, setMessages] = useState<WorkStatusChatMessageWithUser[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { isConnected, send, subscribe, unsubscribe } = usePureWebSocket({
    enabled: enabled && !!userId && !!username,
  });

  // 메시지 구독
  useEffect(() => {
    if (!isConnected) return;

    subscribe("work-status", (data) => {
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
    });

    return () => unsubscribe("work-status");
  }, [isConnected, subscribe, unsubscribe]);

  // 참여자 구독 + JOIN
  useEffect(() => {
    if (!isConnected || !userId || !username) return;

    subscribe("work-status-participants", (data) => {
      const payload = data as { participants: Participant[] };
      setParticipants(payload.participants ?? []);
    });

    send({
      type: "JOIN",
      topic: "work-status-participants",
      data: { userId, username },
    });

    return () => {
      send({
        type: "LEAVE",
        topic: "work-status-participants",
        data: { userId, username },
      });
      unsubscribe("work-status-participants");
    };
  }, [isConnected, userId, username, send, subscribe, unsubscribe]);

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

  const { isConnected, send, subscribe, unsubscribe } = usePureWebSocket({
    enabled: !!userId && !!username,
  });

  useEffect(() => {
    if (!isConnected || !userId || !username) return;

    subscribe("work-status-participants", (data) => {
      const payload = data as { participants: Participant[] };
      setParticipants(payload.participants ?? []);
    });

    send({
      type: "JOIN",
      topic: "work-status-participants",
      data: { userId, username },
    });

    return () => {
      send({
        type: "LEAVE",
        topic: "work-status-participants",
        data: { userId, username },
      });
      unsubscribe("work-status-participants");
      setParticipants([]);
    };
  }, [isConnected, userId, username, send, subscribe, unsubscribe]);

  return { participants };
}
