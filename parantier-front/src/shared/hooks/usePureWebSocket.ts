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

interface UsePureWebSocketOptions {
  enabled?: boolean;
}

export function usePureWebSocket({
  enabled = true,
}: UsePureWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<Map<string, MessageHandler>>(new Map());
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);
  const connectRef = useRef<(() => void) | null>(null);

  // useLayoutEffect로 렌더 중 ref 변경 경고 없이 최신값 동기화
  useLayoutEffect(() => {
    enabledRef.current = enabled;
  });

  const send = useCallback((msg: WsMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const subscribe = useCallback(
    (topic: string, handler: MessageHandler) => {
      handlersRef.current.set(topic, handler);
      send({ type: "SUBSCRIBE", topic, data: null });
    },
    [send],
  );

  const unsubscribe = useCallback(
    (topic: string) => {
      handlersRef.current.delete(topic);
      send({ type: "UNSUBSCRIBE", topic, data: null });
    },
    [send],
  );

  const connect = useCallback(() => {
    if (!enabledRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // 재연결 시 기존 구독 복원
      handlersRef.current.forEach((_, topic) => {
        ws.send(JSON.stringify({ type: "SUBSCRIBE", topic, data: null }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        const handler = handlersRef.current.get(msg.topic);
        if (handler) handler(msg.data);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (enabledRef.current) {
        // connectRef를 통해 최신 connect 함수 참조 (forward-reference 해결)
        reconnectTimerRef.current = setTimeout(() => {
          connectRef.current?.();
        }, 2000);
      }
    };

    ws.onerror = (e) => {
      console.error("WS error:", e);
    };
  }, []);

  // connect가 확정된 후 connectRef를 effect 안에서 동기화
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
      // onclose 콜백이 setIsConnected(false)를 처리하므로 여기서는 close()만 호출
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
