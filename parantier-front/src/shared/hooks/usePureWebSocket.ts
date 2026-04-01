import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

interface WsMessage {
  type: string;
  topic: string;
  data: unknown;
}

type MessageHandler = (data: unknown) => void;

interface SubscriptionEntry {
  handler: MessageHandler;
  onOpen?: () => void;
}

// ── 싱글톤 WebSocket 관리자 ──────────────────────────────────────────────────

class WsManager {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, SubscriptionEntry>();
  private connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private refCount = 0; // 몇 개의 훅이 enable 중인지
  private listeners = new Set<() => void>();

  getSnapshot = () => this.connected;

  subscribeStore = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }

  /** enabled=true 인 훅 하나가 마운트될 때 호출 */
  acquire() {
    this.refCount++;
    if (this.refCount === 1) {
      this.connect();
    }
  }

  /** enabled=true 인 훅 하나가 언마운트되거나 enabled=false 될 때 호출 */
  release() {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) {
      this.teardown();
    }
  }

  private teardown() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    if (this.connected) {
      this.connected = false;
      this.notify();
    }
  }

  private connect() {
    if (this.refCount === 0) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.ws?.readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      this.connected = true;
      this.notify();

      // 모든 구독 복원: SUBSCRIBE 전송 + onOpen 콜백 실행
      this.subscriptions.forEach(({ onOpen }, topic) => {
        ws.send(JSON.stringify({ type: "SUBSCRIBE", topic, data: null }));
        onOpen?.();
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        const entry = this.subscriptions.get(msg.topic);
        if (entry) entry.handler(msg.data);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = () => {
      this.connected = false;
      this.notify();
      // 아직 사용 중이면 재연결
      if (this.refCount > 0) {
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      }
    };

    ws.onerror = (e) => {
      console.error("WS error:", e);
    };
  }

  send(msg: WsMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  addSubscription(topic: string, entry: SubscriptionEntry) {
    this.subscriptions.set(topic, entry);
    // 이미 연결돼있으면 즉시 SUBSCRIBE + onOpen 실행
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "SUBSCRIBE", topic, data: null }));
      entry.onOpen?.();
    }
  }

  removeSubscription(topic: string) {
    this.subscriptions.delete(topic);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "UNSUBSCRIBE", topic, data: null }));
    }
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// 전역 싱글톤
const wsManager = new WsManager();

// ── React 훅 ─────────────────────────────────────────────────────────────────

interface UsePureWebSocketOptions {
  enabled?: boolean;
}

export function usePureWebSocket({
  enabled = true,
}: UsePureWebSocketOptions = {}) {
  const isConnected = useSyncExternalStore(
    wsManager.subscribeStore,
    wsManager.getSnapshot,
  );

  // 이 훅 인스턴스가 현재 acquire 중인지 추적
  const acquiredRef = useRef(false);

  useEffect(() => {
    if (enabled && !acquiredRef.current) {
      acquiredRef.current = true;
      wsManager.acquire();
    } else if (!enabled && acquiredRef.current) {
      acquiredRef.current = false;
      wsManager.release();
    }
  }, [enabled]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (acquiredRef.current) {
        acquiredRef.current = false;
        wsManager.release();
      }
    };
  }, []);

  const send = useCallback((msg: WsMessage) => {
    wsManager.send(msg);
  }, []);

  const subscribe = useCallback(
    (topic: string, handler: MessageHandler, onOpen?: () => void) => {
      wsManager.addSubscription(topic, { handler, onOpen });
    },
    [],
  );

  const unsubscribe = useCallback((topic: string) => {
    wsManager.removeSubscription(topic);
  }, []);

  return { isConnected, send, subscribe, unsubscribe };
}
