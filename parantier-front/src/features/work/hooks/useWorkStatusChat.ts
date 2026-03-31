import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import { workStatusChatApi } from "@/entities/work/api/workStatusChatApi";
import type { WorkStatusChatMessageWithUser } from "@/entities/work/types/workStatusChat";

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

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
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!enabled) return;

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
        console.log("WorkStatusChat WebSocket Connected");
        setIsConnected(true);

        // 메시지 구독
        client.subscribe("/topic/work-status-chat", (message) => {
          try {
            const newMessage: WorkStatusChatMessageWithUser = JSON.parse(
              message.body,
            );
            setMessages((prev) => [...prev, newMessage]);
          } catch (e) {
            console.error("Failed to parse work-status-chat message:", e);
          }
        });

        // 참여자 목록 구독
        client.subscribe("/topic/work-status-participants", (message) => {
          try {
            const payload: { participants: Participant[] } = JSON.parse(
              message.body,
            );
            setParticipants(payload.participants ?? []);
          } catch (e) {
            console.error("Failed to parse participants message:", e);
          }
        });

        // 입장 이벤트 전송
        if (userId && username) {
          client.publish({
            destination: "/app/work-status/chat/join",
            body: JSON.stringify({ userId, username }),
          });
        }
      },

      onStompError: (frame) => {
        console.error("WorkStatusChat STOMP Error:", frame);
        setIsConnected(false);
      },

      onWebSocketClose: () => {
        console.log("WorkStatusChat WebSocket Disconnected");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      // 퇴장 이벤트 전송 후 연결 해제
      if (client.connected && userId) {
        client.publish({
          destination: "/app/work-status/chat/leave",
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
  }, [enabled, userId, username]);

  const sendMessage = (
    message: string,
    senderId: number,
    senderName: string,
  ) => {
    if (!clientRef.current?.connected) {
      console.error("WorkStatusChat WebSocket is not connected");
      return;
    }

    clientRef.current.publish({
      destination: "/app/work-status/chat",
      body: JSON.stringify({
        senderId,
        senderName,
        message,
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
