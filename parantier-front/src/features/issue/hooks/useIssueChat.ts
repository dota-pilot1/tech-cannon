import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import type { MessageWithUser } from "@/entities/issue/types/issueMessage";

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

interface UseIssueChatOptions {
  issueId: number;
  enabled?: boolean;
}

/**
 * WebSocket을 사용한 실시간 채팅 훅
 *
 * - 실시간 메시지만 관리 (history는 useIssueMessages로 가져옴)
 * - 컴포넌트가 마운트될 때 WebSocket 연결
 * - 컴포넌트가 언마운트될 때 WebSocket 연결 해제
 */
export function useIssueChat({ issueId, enabled = true }: UseIssueChatOptions) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!enabled || !issueId) return;

    // STOMP 클라이언트 생성
    const client = new Client({
      brokerURL: WEBSOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("WebSocket Connected");
        setIsConnected(true);

        // 해당 이슈의 메시지 구독
        client.subscribe(`/topic/issues/${issueId}`, (message) => {
          console.log("Received message:", message.body);
          const newMessage: MessageWithUser = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      },

      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
        setIsConnected(false);
      },

      onWebSocketClose: () => {
        console.log("WebSocket Disconnected");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    // Cleanup: 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (client.active) {
        client.deactivate();
      }
      setMessages([]);
      setIsConnected(false);
    };
  }, [issueId, enabled]);

  /**
   * 메시지 전송
   */
  const sendMessage = (message: string, userId: number, username: string) => {
    if (!clientRef.current?.connected) {
      console.error("WebSocket is not connected");
      return;
    }

    console.log("Sending message:", message);
    clientRef.current.publish({
      destination: `/app/issues/${issueId}/message`,
      body: JSON.stringify({
        senderId: userId,
        senderName: username,
        message: message,
      }),
    });
  };

  return {
    messages, // 실시간으로 받은 메시지들
    isConnected,
    sendMessage,
  };
}
