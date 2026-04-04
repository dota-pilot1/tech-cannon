import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingChatApi } from "@/entities/meeting/api/meetingChatApi";
import type { ReorderChannelItem } from "@/entities/meeting/api/meetingChatApi";
import type { MeetingChatMessageWithUser } from "@/entities/meeting/types/meetingChat";
import { usePureWebSocket } from "@/shared/hooks/usePureWebSocket";

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

export function useCreateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => meetingChatApi.createChannel(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-channels"] });
      toast.success("채널이 추가됐습니다.");
    },
    onError: () => toast.error("채널 추가에 실패했습니다."),
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      orderNum,
    }: {
      id: number;
      name: string;
      orderNum: number;
    }) => meetingChatApi.updateChannel(id, name, orderNum),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-channels"] });
      toast.success("채널이 수정됐습니다.");
    },
    onError: () => toast.error("채널 수정에 실패했습니다."),
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => meetingChatApi.deleteChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-channels"] });
      toast.success("채널이 삭제됐습니다.");
    },
    onError: () => toast.error("채널 삭제에 실패했습니다."),
  });
}

export function useReorderChannels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ items }: { items: ReorderChannelItem[] }) =>
      meetingChatApi.reorderChannels(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-channels"] });
      toast.success("순서가 저장됐습니다.");
    },
    onError: () => toast.error("순서 변경에 실패했습니다."),
  });
}

export interface Participant {
  userId: number;
  username: string;
}

interface UseMeetingChatOptions {
  userId?: number;
  username?: string;
  channelId: number;
}

export function useMeetingChat({
  userId,
  username,
  channelId,
}: UseMeetingChatOptions) {
  console.log(
    "[MeetingChat] render userId=",
    userId,
    "username=",
    username,
    "channelId=",
    channelId,
  );
  const [messages, setMessages] = useState<MeetingChatMessageWithUser[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { isConnected, send, subscribe, unsubscribe } = usePureWebSocket();

  const isConnecting = !isConnected;

  // 채널 구독
  const chatHandlerRef = useRef<((data: unknown) => void) | null>(null);
  useEffect(() => {
    if (!channelId) return;
    const topic = `meeting/${channelId}`;

    const handler = (data: unknown) => {
      const raw = data as MeetingChatMessageWithUser & { senderName?: string };
      setMessages((prev) => [
        ...prev,
        {
          ...raw,
          username: raw.username ?? raw.senderName ?? "알 수 없음",
          createdAt: raw.createdAt ?? new Date().toISOString(),
        },
      ]);
    };
    chatHandlerRef.current = handler;
    subscribe(topic, handler);

    return () => {
      unsubscribe(topic, handler);
      chatHandlerRef.current = null;
    };
  }, [channelId, subscribe, unsubscribe]);

  // 참여자 구독 + JOIN (채널별 토픽)
  const participantHandlerRef = useRef<((data: unknown) => void) | null>(null);
  useEffect(() => {
    if (!userId || !username || !channelId) return;

    const topic = `meeting-participants/${channelId}`;

    const handler = (data: unknown) => {
      const payload = data as { participants: Participant[] };
      setParticipants(payload.participants ?? []);
    };
    participantHandlerRef.current = handler;

    subscribe(topic, handler, () => {
      send({
        type: "JOIN",
        topic,
        data: { userId, username },
      });
    });

    return () => {
      send({
        type: "LEAVE",
        topic,
        data: { userId, username },
      });
      unsubscribe(topic, handler);
      participantHandlerRef.current = null;
    };
  }, [userId, username, channelId, send, subscribe, unsubscribe]);

  // 채널 변경 시 메시지 초기화
  const prevChannelRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      prevChannelRef.current !== null &&
      prevChannelRef.current !== channelId
    ) {
      const timer = setTimeout(() => setMessages([]), 0);
      prevChannelRef.current = channelId;
      return () => clearTimeout(timer);
    }
    prevChannelRef.current = channelId;
  }, [channelId]);

  const sendMessage = (
    message: string,
    senderId: number,
    senderName: string,
  ) => {
    send({
      type: "CHAT",
      topic: `meeting/${channelId}`,
      data: { senderId, senderName, message, channelId },
    });
  };

  return { messages, isConnected, isConnecting, participants, sendMessage };
}

// ── 참여자 수만 구독하는 경량 훅 ──────────────────────────────────────────────
export function useMeetingParticipants({
  userId,
  username,
  channelId,
}: {
  userId?: number;
  username?: string;
  channelId?: number;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { send, subscribe, unsubscribe } = usePureWebSocket();

  useEffect(() => {
    if (!userId || !username || !channelId) return;

    const topic = `meeting-participants/${channelId}`;

    const handler = (data: unknown) => {
      const payload = data as { participants: Participant[] };
      setParticipants(payload.participants ?? []);
    };

    subscribe(topic, handler, () => {
      send({
        type: "JOIN",
        topic,
        data: { userId, username },
      });
    });

    return () => {
      send({
        type: "LEAVE",
        topic,
        data: { userId, username },
      });
      unsubscribe(topic, handler);
      setParticipants([]);
    };
  }, [userId, username, channelId, send, subscribe, unsubscribe]);

  return { participants };
}

// ── 사이드바용: 모든 채널의 참가자수를 추적 ───────────────────────────────────
export function useAllChannelParticipantCounts({
  userId,
  username,
  channelIds,
}: {
  userId?: number;
  username?: string;
  channelIds: number[];
}) {
  const [participantCounts, setParticipantCounts] = useState<
    Record<number, number>
  >({});
  const { subscribe, unsubscribe, send } = usePureWebSocket();

  // channelIds.join(",") 을 의존성으로 써서 배열 참조 변경에 안정적으로 반응
  const channelIdsKey = channelIds.join(",");

  // 1. 초기 REST API로 전체 채널 스냅샷 로드
  useEffect(() => {
    if (channelIds.length === 0) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/meeting/channels/participant-counts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((r) => r.json())
      .then((data: Record<string, number>) => {
        const counts: Record<number, number> = {};
        Object.entries(data).forEach(([k, v]) => {
          counts[Number(k)] = v;
        });
        setParticipantCounts(counts);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelIdsKey]);

  // 2. 모든 채널 구독 + PING으로 현재 참가자 즉시 요청
  useEffect(() => {
    if (!userId || !username || channelIds.length === 0) return;

    const handlers: Array<{ topic: string; handler: (data: unknown) => void }> =
      [];

    channelIds.forEach((channelId) => {
      const topic = `meeting-participants/${channelId}`;
      const handler = (data: unknown) => {
        const payload = data as {
          participants: { userId: number; username: string }[];
        };
        setParticipantCounts((prev) => ({
          ...prev,
          [channelId]: payload.participants?.length ?? 0,
        }));
      };
      handlers.push({ topic, handler });

      // 구독만 등록 (PING은 아래 별도 send로 처리)
      subscribe(topic, handler);
    });

    // 구독 완료 후 즉시 PING 전송 (onOpen 타이밍 의존 제거)
    channelIds.forEach((channelId) => {
      const topic = `meeting-participants/${channelId}`;
      send({ type: "PING", topic, data: {} });
    });

    return () => {
      handlers.forEach(({ topic, handler }) => {
        unsubscribe(topic, handler);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, username, channelIdsKey, subscribe, unsubscribe, send]);

  return { participantCounts };
}
