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

interface UseWorkStatusChatOptions {
  enabled?: boolean;
}

export function useWorkStatusChat({ enabled = true }: UseWorkStatusChatOptions = {}) {
  const [messages, setMessages] = useState<WorkStatusChatMessageWithUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Map<number, string>>(new Map());
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

        client.subscribe("/topic/work-status-chat", (message) => {
          try {
            const newMessage: WorkStatusChatMessageWithUser = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
            // 참여자 업데이트
            setParticipants((prev) => {
              const next = new Map(prev);
              next.set(newMessage.userId, newMessage.username);
              return next;
            });
          } catch (e) {
            console.error("Failed to parse work-status-chat message:", e);
          }
        });
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
      if (client.active) {
        client.deactivate();
      }
      setMessages([]);
      setIsConnected(false);
    };
  }, [enabled]);

  const sendMessage = (message: string, userId: number, username: string) => {
    if (!clientRef.current?.connected) {
      console.error("WorkStatusChat WebSocket is not connected");
      return;
    }

    clientRef.current.publish({
      destination: "/app/work-status/chat",
      body: JSON.stringify({
        senderId: userId,
        senderName: username,
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
