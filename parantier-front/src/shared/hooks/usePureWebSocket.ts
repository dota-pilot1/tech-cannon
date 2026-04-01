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
  private enabled = false;
  private listeners = new Set<() => void>();

  // 외부에서 isConnected 상태 구독용
  getSnapshot = () => this.connected;

  subscribe_store = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }

  enable() {
    this.enabled = true;
    this.connect();
  }

  disable() {
    this.enabled = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private connect() {
    if (!this.enabled) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.ws?.readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      this.connected = true;
      this.notify();

      // 모든 구독 복원
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
      if (this.enabled) {
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

// 전역 싱글톤 인스턴스
const wsManager = new WsManager();

// 전역 enabled 참조 카운터 (여러 컴포넌트가 enabled=true 일 때 한 번만 연결)
let enabledCount = 0;

// ── React 훅 ─────────────────────────────────────────────────────────────────

interface UsePureWebSocketOptions {
  enabled?: boolean;
}

export function usePureWebSocket({
  enabled = true,
}: UsePureWebSocketOptions = {}) {
  // 싱글톤 스토어에서 isConnected 상태 구독
  const isConnected = useSyncExternalStore(
    wsManager.subscribe_store,
    wsManager.getSnapshot,
  );

  // enabled 변경 시 연결/해제 카운터 관리
  const prevEnabledRef = useRef(false);

  useEffect(() => {
    if (enabled && !prevEnabledRef.current) {
      enabledCount++;
      if (enabledCount === 1) wsManager.enable();
      prevEnabledRef.current = true;
    } else if (!enabled && prevEnabledRef.current) {
      enabledCount = Math.max(0, enabledCount - 1);
      if (enabledCount === 0) wsManager.disable();
      prevEnabledRef.current = false;
    }
  }, [enabled]);

  // 언마운트 시 카운터 감소
  useEffect(() => {
    return () => {
      if (prevEnabledRef.current) {
        enabledCount = Math.max(0, enabledCount - 1);
        if (enabledCount === 0) wsManager.disable();
        prevEnabledRef.current = false;
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
