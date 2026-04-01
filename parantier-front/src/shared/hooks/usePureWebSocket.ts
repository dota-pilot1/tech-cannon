import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
} from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

interface WsMessage {
  type: string;
  topic: string;
  data: unknown;
}

type MessageHandler = (data: unknown) => void;

interface SubscriptionEntry {
  handler: MessageHandler;
  onOpen?: () => void; // 연결됐을 때 추가로 실행할 작업 (JOIN 등)
}

interface UsePureWebSocketOptions {
  enabled?: boolean;
}

export function usePureWebSocket({
  enabled = true,
}: UsePureWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<Map<string, SubscriptionEntry>>(new Map());
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);
  const connectRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    enabledRef.current = enabled;
  });

  // ws가 OPEN일 때만 전송, 아니면 무시
  const sendRaw = useCallback((msg: WsMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }, []);

  // 외부에서 사용하는 send
  const send = useCallback(
    (msg: WsMessage) => {
      sendRaw(msg);
    },
    [sendRaw],
  );

  // topic 구독 + 연결 시 실행할 onOpen 콜백 등록
  const subscribe = useCallback(
    (topic: string, handler: MessageHandler, onOpen?: () => void) => {
      subscriptionsRef.current.set(topic, { handler, onOpen });
      // 이미 연결된 상태면 즉시 SUBSCRIBE 전송
      sendRaw({ type: "SUBSCRIBE", topic, data: null });
      // onOpen도 즉시 실행 (이미 연결돼있으면)
      if (wsRef.current?.readyState === WebSocket.OPEN && onOpen) {
        onOpen();
      }
    },
    [sendRaw],
  );

  const unsubscribe = useCallback(
    (topic: string) => {
      subscriptionsRef.current.delete(topic);
      sendRaw({ type: "UNSUBSCRIBE", topic, data: null });
    },
    [sendRaw],
  );

  const connect = useCallback(() => {
    if (!enabledRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);

      // 모든 구독 복원: SUBSCRIBE 전송 + onOpen 콜백 실행
      subscriptionsRef.current.forEach(({ onOpen }, topic) => {
        ws.send(JSON.stringify({ type: "SUBSCRIBE", topic, data: null }));
        // JOIN 등 연결 시 필요한 작업 재실행
        if (onOpen) {
          onOpen();
        }
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        const entry = subscriptionsRef.current.get(msg.topic);
        if (entry) entry.handler(msg.data);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (enabledRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          connectRef.current?.();
        }, 2000);
      }
    };

    ws.onerror = (e) => {
      console.error("WS error:", e);
    };
  }, []);

  useLayoutEffect(() => {
    connectRef.current = connect;
  });

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    }
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, connect]);

  return { isConnected, send, subscribe, unsubscribe };
}
