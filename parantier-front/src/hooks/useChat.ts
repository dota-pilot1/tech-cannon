import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/api/chatApi";
import { toast } from "sonner";

// 모든 활성 채팅방 목록
export function useChatRooms() {
  return useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => chatApi.getAllRooms(),
  });
}

// 채팅방 상세
export function useChatRoom(roomId: number | null) {
  return useQuery({
    queryKey: ["chatRoom", roomId],
    queryFn: () => chatApi.getRoom(roomId!),
    enabled: !!roomId,
  });
}

// 채팅방 참가자 목록
export function useRoomMembers(roomId: number | null) {
  return useQuery({
    queryKey: ["roomMembers", roomId],
    queryFn: () => chatApi.getRoomMembers(roomId!),
    enabled: !!roomId,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

// 채팅방 생성
export function useCreateRoom(onSuccess?: (roomId: number) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createRoom,
    onSuccess: (roomId) => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      toast.success("채팅방이 생성되었습니다");
      if (onSuccess) onSuccess(roomId);
    },
  });
}

// 채팅방 수정
export function useUpdateRoom(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      room,
    }: {
      id: number;
      room: Partial<import("@/types/chat").ChatRoom>;
    }) => chatApi.updateRoom(id, room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      toast.success("채팅방 정보가 수정되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

// 채팅방 삭제
export function useDeleteRoom(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      toast.success("채팅방이 삭제되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

// 모든 채팅방 삭제 (관리자 전용)
export function useDeleteAllRooms(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteAllRooms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      toast.success("모든 채팅방이 삭제되었습니다");
      if (onSuccess) onSuccess();
    },
  });
}

// 채팅방 참가
export function useJoinRoom(onSuccess?: (roomId: number) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.joinRoom,
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomMembers", roomId] });
      toast.success("채팅방에 참가했습니다");
      if (onSuccess) onSuccess(roomId);
    },
  });
}

// 채팅방 나가기
export function useLeaveRoom(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.leaveRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomMembers"] });
      toast.success("채팅방에서 나갔습니다");
      if (onSuccess) onSuccess();
    },
  });
}
