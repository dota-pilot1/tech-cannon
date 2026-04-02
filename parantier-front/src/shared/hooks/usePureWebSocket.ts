import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

export interface WsMessage {
  type: string;
  topic: string;
  data: unknown;
}

type MessageHandler = (data: unknown) => void;

// 토픽별 핸들러 엔트리 (다중 핸들러 + onOpen 콜백)
interface TopicEntry {
  handlers: Set<MessageHandler>;
  onOpen?: () => void;
}

// ── 싱글톤 WsManager ──────────────────────────────────────────────────────────
class WsManager {
  private ws: WebSocket | null = null;
  private topics = new Map<string, TopicEntry>();
  private connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private refCount = 0;
  private storeListeners = new Set<() => void>();

  // useSyncExternalStore 인터페이스
  getSnapshot = () => this.connected;
  subscribeStore = (cb: () => void) => {
    this.storeListeners.add(cb);
    return () => this.storeListeners.delete(cb);
  };
  private notify() { this.storeListeners.forEach((l) => l()); }

  // 연결 수명: 여러 훅이 acquire/release 해도 안전
  acquire() {
    this.refCount++;
    console.log("[WS] acquire refCount=", this.refCount);
    if (this.refCount === 1) this.connect();
  }

  release() {
    this.refCount = Math.max(0, this.refCount - 1);
    console.log("[WS] release refCount=", this.refCount);
    if (this.refCount === 0) this.teardown();
  }

  private teardown() {
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    this.ws?.close();
    this.ws = null;
    if (this.connected) { this.connected = false; this.notify(); }
  }

  private connect() {
    if (this.refCount === 0) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.ws?.readyState === WebSocket.CONNECTING) return;

    console.log("[WS] connecting to", WS_URL);
    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      console.log("[WS] connected, topics=", [...this.topics.keys()]);
      this.connected = true;
      this.notify();
      // 재연결 시 모든 구독 복원 + onOpen 재실행
      this.topics.forEach(({ onOpen }, topic) => {
        ws.send(JSON.stringify({ type: "SUBSCRIBE", topic, data: null }));
        onOpen?.();
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        const entry = this.topics.get(msg.topic);
        if (entry) entry.handlers.forEach((h) => h(msg.data));
      } catch (e) { console.error("[WS] parse error:", e); }
    };

    ws.onclose = () => {
      console.log("[WS] closed, refCount=", this.refCount);
      this.connected = false;
      this.notify();
      if (this.refCount > 0) {
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      }
    };

    ws.onerror = (e) => { console.error("[WS] error:", e); };
  }

  send(msg: WsMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  // 핸들러 추가 (토픽당 여러 핸들러 가능)
  addHandler(topic: string, handler: MessageHandler, onOpen?: () => void) {
    let entry = this.topics.get(topic);
    if (!entry) {
      entry = { handlers: new Set(), onOpen };
      this.topics.set(topic, entry);
    } else {
      if (onOpen) entry.onOpen = onOpen; // 나중 등록이 우선
    }
    entry.handlers.add(handler);

    // 이미 연결돼있으면 즉시 SUBSCRIBE + onOpen 실행
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[WS] addHandler immediate SUBSCRIBE+onOpen for", topic);
      this.ws.send(JSON.stringify({ type: "SUBSCRIBE", topic, data: null }));
      onOpen?.();
    }
  }

  // 핸들러 제거 (해당 토픽 핸들러가 모두 없어지면 UNSUBSCRIBE)
  removeHandler(topic: string, handler: MessageHandler) {
    const entry = this.topics.get(topic);
    if (!entry) return;
    entry.handlers.delete(handler);
    if (entry.handlers.size === 0) {
      this.topics.delete(topic);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "UNSUBSCRIBE", topic, data: null }));
      }
    }
  }
}

const wsManager = new WsManager();

// ── React 훅 ─────────────────────────────────────────────────────────────────
interface UsePureWebSocketOptions { enabled?: boolean; }

export function usePureWebSocket({ enabled = true }: UsePureWebSocketOptions = {}) {
  const isConnected = useSyncExternalStore(wsManager.subscribeStore, wsManager.getSnapshot);
  const acquiredRef = useRef(false);

  // enabled 변경 및 언마운트 시 acquire/release (하나의 effect로 통합)
  useEffect(() => {
    if (enabled && !acquiredRef.current) {
      acquiredRef.current = true;
      wsManager.acquire();
    } else if (!enabled && acquiredRef.current) {
      acquiredRef.current = false;
      wsManager.release();
    }
    // cleanup: 언마운트 or enabled가 false로 바뀔 때
    return () => {
      if (acquiredRef.current) {
        acquiredRef.current = false;
        wsManager.release();
      }
    };
  }, [enabled]);

  const send = useCallback((msg: WsMessage) => wsManager.send(msg), []);

  const subscribe = useCallback(
    (topic: string, handler: MessageHandler, onOpen?: () => void) => {
      wsManager.addHandler(topic, handler, onOpen);
    },
    []
  );

  const unsubscribe = useCallback(
    (topic: string, handler: MessageHandler) => {
      wsManager.removeHandler(topic, handler);
    },
    []
  );

  return { isConnected, send, subscribe, unsubscribe };
}
