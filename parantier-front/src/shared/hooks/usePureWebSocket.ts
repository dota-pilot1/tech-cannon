import { useEffect, useCallback, useSyncExternalStore } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

export interface WsMessage {
  type: string;
  topic: string;
  data: unknown;
}

type MessageHandler = (data: unknown) => void;

interface TopicEntry {
  handlers: Set<MessageHandler>;
  onOpen?: () => void;
}

// ── 싱글톤 WsManager ──────────────────────────────────────────────────────────
class WsManager {
  private ws: WebSocket | null = null;
  private topics = new Map<string, TopicEntry>();
  private connected = false;
  private connecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private refCount = 0;
  private storeListeners = new Set<() => void>();

  getSnapshot = () => this.connected;
  getConnectingSnapshot = () => this.connecting;
  subscribeStore = (cb: () => void) => {
    this.storeListeners.add(cb);
    return () => this.storeListeners.delete(cb);
  };
  private notify() {
    this.storeListeners.forEach((l) => l());
  }

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

    this.connecting = true;
    this.notify();
    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      console.log("[WS] connected, topics=", [...this.topics.keys()]);
      this.connected = true;
      this.connecting = false;
      this.notify();
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
      } catch (e) {
        console.error("[WS] parse error:", e);
      }
    };

    ws.onclose = () => {
      this.connected = false;
      this.connecting = false;
      this.notify();
      if (this.refCount > 0) {
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      }
    };

    ws.onerror = (e) => {
      console.error("[WS] error:", e);
    };
  }

  send(msg: WsMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  addHandler(topic: string, handler: MessageHandler, onOpen?: () => void) {
    console.log(
      "[WS] addHandler",
      topic,
      "isOpen=",
      this.ws?.readyState === WebSocket.OPEN,
    );
    let entry = this.topics.get(topic);
    if (!entry) {
      entry = { handlers: new Set(), onOpen };
      this.topics.set(topic, entry);
    } else {
      if (onOpen) entry.onOpen = onOpen;
    }
    entry.handlers.add(handler);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "SUBSCRIBE", topic, data: null }));
      onOpen?.();
    }
  }

  removeHandler(topic: string, handler: MessageHandler) {
    const entry = this.topics.get(topic);
    if (!entry) return;
    entry.handlers.delete(handler);
    if (entry.handlers.size === 0) {
      this.topics.delete(topic);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({ type: "UNSUBSCRIBE", topic, data: null }),
        );
      }
    }
  }
}

const wsManager = new WsManager();

// ── React 훅 ─────────────────────────────────────────────────────────────────

export function usePureWebSocket() {
  const isConnected = useSyncExternalStore(
    wsManager.subscribeStore,
    wsManager.getSnapshot,
  );
  const isConnecting = useSyncExternalStore(
    wsManager.subscribeStore,
    wsManager.getConnectingSnapshot,
  );

  // 마운트 시 한 번만 acquire, 언마운트 시 한 번만 release
  // enabled는 addHandler 시점에 체크 (wsManager.acquire는 항상 호출)
  useEffect(() => {
    wsManager.acquire();
    return () => {
      wsManager.release();
    };
  }, []); // 의존성 배열 비움 - 마운트/언마운트 시에만 실행

  const send = useCallback((msg: WsMessage) => wsManager.send(msg), []);

  const subscribe = useCallback(
    (topic: string, handler: MessageHandler, onOpen?: () => void) => {
      wsManager.addHandler(topic, handler, onOpen);
    },
    [],
  );

  const unsubscribe = useCallback((topic: string, handler: MessageHandler) => {
    wsManager.removeHandler(topic, handler);
  }, []);

  return { isConnected, isConnecting, send, subscribe, unsubscribe };
}
