import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import { meetingChatApi } from "@/entities/meeting/api/meetingChatApi";
import type { MeetingChatMessageWithUser } from "@/entities/meeting/types/meetingChat";

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

export function useMeetingChatHistory(channelId: number) {
  return useQuery({
    queryKey: ["meeting-chat", channelId],
    queryFn: () => meetingChatApi.getRecentMessages(100, channelId),
    enabled: channelId > 0,
  });
}

export function useMeetingChannels() {
  return useQuery({
    queryKey: ["meeting-channels"],
    queryFn: () => meetingChatApi.getChannels(),
    staleTime: 1000 * 60 * 5,
  });
}

export interface Participant {
  userId: number;
  username: string;
}

interface UseMeetingChatOptions {
  enabled?: boolean;
  userId?: number;
  username?: string;
  channelId: number;
}

export function useMeetingChat({
  enabled = true,
  userId,
  username,
  channelId,
}: UseMeetingChatOptions) {
  const [messages, setMessages] = useState<MeetingChatMessageWithUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const clientRef = useRef<Client | null>(null);
  const channelSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(
    null,
  );

  // ── WebSocket 연결 (userId / username 바뀔 때만 재연결) ──────────────────
  useEffect(() => {
    if (!enabled || !userId || !username) return;

    const accessToken = localStorage.getItem("accessToken");

    const client = new Client({
      brokerURL: WEBSOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},

      onConnect: () => {
        console.log("MeetingChat WebSocket Connected");
        setIsConnected(true);

        // 연결 시점의 channelId를 클로저로 캡처 (채널 변경은 아래 별도 effect 처리)
        const currentChannelId = channelId;
        if (channelSubscriptionRef.current) {
          channelSubscriptionRef.current.unsubscribe();
          channelSubscriptionRef.current = null;
        }

        const sub = client.subscribe(
          `/topic/meeting-chat/${currentChannelId}`,
          (message) => {
            try {
              const raw = JSON.parse(message.body);
              const newMessage: MeetingChatMessageWithUser = {
                ...raw,
                username: raw.username ?? raw.senderName ?? "알 수 없음",
                createdAt: raw.createdAt ?? new Date().toISOString(),
              };
              setMessages((prev) => [...prev, newMessage]);
            } catch (e) {
              console.error("Failed to parse meeting-chat message:", e);
            }
          },
        );
        channelSubscriptionRef.current = sub;

        // 참여자 목록 구독
        client.subscribe("/topic/meeting-participants", (message) => {
          try {
            const payload: { participants: Participant[] } = JSON.parse(
              message.body,
            );
            setParticipants(payload.participants ?? []);
          } catch (e) {
            console.error("Failed to parse meeting participants message:", e);
          }
        });

        // 입장 이벤트 전송
        client.publish({
          destination: "/app/meeting/chat/join",
          body: JSON.stringify({ userId, username }),
        });
      },

      onStompError: (frame) => {
        console.error("MeetingChat STOMP Error:", frame);
        setIsConnected(false);
      },

      onWebSocketClose: () => {
        console.log("MeetingChat WebSocket Disconnected");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      channelSubscriptionRef.current = null;
      if (client.connected && userId) {
        client.publish({
          destination: "/app/meeting/chat/leave",
          body: JSON.stringify({ userId, username }),
        });
      }
      if (client.active) {
        client.deactivate();
      }
      setMessages([]);
      setIsConnected(false);
      setParticipants([]);
    };
    // channelId는 아래 별도 effect에서 구독 교체로 처리하므로 exhaustive-deps 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId, username]);

  // ── 채널 변경 시: 메시지 초기화 + 구독 교체 ─────────────────────────────
  useEffect(() => {
    // 초기 마운트 시엔 연결 effect의 onConnect에서 구독하므로 skip
    const client = clientRef.current;
    if (!client?.connected) return;

    // 이전 채널 구독 해제
    if (channelSubscriptionRef.current) {
      channelSubscriptionRef.current.unsubscribe();
      channelSubscriptionRef.current = null;
    }

    // 메시지 초기화 — 다음 태스크로 미뤄 effect 내 직접 setState 경고 방지
    const clearTimer = setTimeout(() => setMessages([]), 0);

    // 새 채널 구독
    const sub = client.subscribe(
      `/topic/meeting-chat/${channelId}`,
      (message) => {
        try {
          const raw = JSON.parse(message.body);
          const newMessage: MeetingChatMessageWithUser = {
            ...raw,
            username: raw.username ?? raw.senderName ?? "알 수 없음",
            createdAt: raw.createdAt ?? new Date().toISOString(),
          };
          setMessages((prev) => [...prev, newMessage]);
        } catch (e) {
          console.error("Failed to parse meeting-chat message:", e);
        }
      },
    );
    channelSubscriptionRef.current = sub;

    return () => {
      clearTimeout(clearTimer);
      sub.unsubscribe();
      channelSubscriptionRef.current = null;
    };
  }, [channelId]);

  const sendMessage = (
    message: string,
    senderId: number,
    senderName: string,
  ) => {
    if (!clientRef.current?.connected) {
      console.error("MeetingChat WebSocket is not connected");
      return;
    }

    clientRef.current.publish({
      destination: "/app/meeting/chat",
      body: JSON.stringify({
        senderId,
        senderName,
        message,
        channelId,
      }),
    });
  };

  return {
    messages,
    isConnected,
    participants,
    sendMessage,
  };
}

// ── 참여자 수만 구독하는 경량 훅 ──────────────────────────────────────────────
export function useMeetingParticipants({
  userId,
  username,
}: {
  userId?: number;
  username?: string;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!userId || !username) return;
    if (clientRef.current?.active) return;

    const accessToken = localStorage.getItem("accessToken");

    const client = new Client({
      brokerURL: WEBSOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},

      onConnect: () => {
        client.subscribe("/topic/meeting-participants", (message) => {
          try {
            const payload: { participants: Participant[] } = JSON.parse(
              message.body,
            );
            setParticipants(payload.participants ?? []);
          } catch (e) {
            console.error("Failed to parse meeting participants message:", e);
          }
        });
      },

      onStompError: () => {},
      onWebSocketClose: () => {},
    });

    clientRef.current = client;
    client.activate();
  }, [userId, username]);

  useEffect(() => {
    connect();
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      setParticipants([]);
    };
  }, [connect]);

  return { participants };
}
