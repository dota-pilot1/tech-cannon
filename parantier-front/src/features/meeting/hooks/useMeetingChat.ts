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
  enabled?: boolean;
  userId?: number;
  username?: string;
  channelId: number;
}

export function useMeetingChat({
  enabled = true,
  userId,
  username,
  channelId,
}: UseMeetingChatOptions) {
  const [messages, setMessages] = useState<MeetingChatMessageWithUser[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { isConnected, send, subscribe, unsubscribe } = usePureWebSocket({
    enabled: enabled && !!userId && !!username,
  });

  const isConnecting = !isConnected;

  // 채널 구독 (isConnected 의존 제거 - subscribe 내부에서 OPEN 체크)
  useEffect(() => {
    if (!channelId) return;
    const topic = `meeting/${channelId}`;

    subscribe(topic, (data) => {
      const raw = data as MeetingChatMessageWithUser & { senderName?: string };
      setMessages((prev) => [
        ...prev,
        {
          ...raw,
          username: raw.username ?? raw.senderName ?? "알 수 없음",
          createdAt: raw.createdAt ?? new Date().toISOString(),
        },
      ]);
    });

    return () => unsubscribe(topic);
  }, [channelId, subscribe, unsubscribe]);

  // 참여자 구독 + JOIN (onOpen으로 등록해서 재연결 시에도 자동 재참여)
  useEffect(() => {
    if (!userId || !username) return;

    subscribe(
      "meeting-participants",
      (data) => {
        const payload = data as { participants: Participant[] };
        setParticipants(payload.participants ?? []);
      },
      // onOpen: 연결/재연결 시 자동으로 JOIN 전송
      () => {
        send({
          type: "JOIN",
          topic: "meeting-participants",
          data: { userId, username },
        });
      },
    );

    return () => {
      send({
        type: "LEAVE",
        topic: "meeting-participants",
        data: { userId, username },
      });
      unsubscribe("meeting-participants");
    };
  }, [userId, username, send, subscribe, unsubscribe]);

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
}: {
  userId?: number;
  username?: string;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { send, subscribe, unsubscribe } = usePureWebSocket({
    enabled: !!userId && !!username,
  });

  useEffect(() => {
    if (!userId || !username) return;

    subscribe(
      "meeting-participants",
      (data) => {
        const payload = data as { participants: Participant[] };
        setParticipants(payload.participants ?? []);
      },
      () => {
        send({
          type: "JOIN",
          topic: "meeting-participants",
          data: { userId, username },
        });
      },
    );

    return () => {
      send({
        type: "LEAVE",
        topic: "meeting-participants",
        data: { userId, username },
      });
      unsubscribe("meeting-participants");
      setParticipants([]);
    };
  }, [userId, username, send, subscribe, unsubscribe]);

  return { participants };
}
