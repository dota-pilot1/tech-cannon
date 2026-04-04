import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { hackathonApi } from "../api/hackathonApi";
import type { HackathonChatMessage } from "../types/hackathon.types";
import { usePureWebSocket } from "@/shared/hooks/usePureWebSocket";

export function useHackathonChatHistory(eventId: number | null) {
  return useQuery({
    queryKey: ["hackathon-chat", eventId],
    queryFn: () => hackathonApi.getChatHistory(eventId!, 50),
    enabled: !!eventId,
  });
}

export function useHackathonChat({
  userId,
  username,
  eventId,
}: {
  userId?: number;
  username?: string;
  eventId: number | null;
}) {
  const [messages, setMessages] = useState<HackathonChatMessage[]>([]);
  const { isConnected, send, subscribe, unsubscribe } = usePureWebSocket();

  // 토픽 구독
  const chatHandlerRef = useRef<((data: unknown) => void) | null>(null);
  useEffect(() => {
    if (!eventId) return;
    const topic = `hackathon-chat/${eventId}`;

    const handler = (data: unknown) => {
      const raw = data as HackathonChatMessage & {
        senderName?: string;
        message?: string;
      };
      setMessages((prev) => [
        ...prev,
        {
          ...raw,
          content: raw.content ?? raw.message ?? "",
          username: raw.username ?? raw.senderName ?? "알 수 없음",
          createdAt: raw.createdAt ?? new Date().toISOString(),
        },
      ]);
    };

    chatHandlerRef.current = handler;
    subscribe(topic, handler);

    return () => {
      unsubscribe(topic, handler);
      chatHandlerRef.current = null;
    };
  }, [eventId, subscribe, unsubscribe]);

  // 히스토리 로드 (eventId 변경 시 메시지 초기화 후 재로드)
  const historyLoaded = useRef(false);
  const prevEventIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!eventId) return;

    // eventId가 바뀌었으면 플래그 리셋
    if (prevEventIdRef.current !== eventId) {
      historyLoaded.current = false;
      prevEventIdRef.current = eventId;
    }

    if (historyLoaded.current) return;

    hackathonApi
      .getChatHistory(eventId, 50)
      .then((history: HackathonChatMessage[]) => {
        setMessages(history);
        historyLoaded.current = true;
      })
      .catch(() => {});
  }, [eventId]);

  const sendMessage = (messageText: string) => {
    if (!eventId || !userId || !username) return;
    send({
      type: "CHAT",
      topic: `hackathon-chat/${eventId}`,
      data: {
        senderId: userId,
        senderName: username,
        message: messageText,
        eventId,
      },
    });
  };

  return { messages, isConnected, sendMessage, setMessages };
}
