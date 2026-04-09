import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  X,
  Plus,
  Send,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { chatApi } from "@/api/chatApi";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { usePureWebSocket } from "@/shared/hooks/usePureWebSocket";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { ChatRoom, ChatMessage, RoomMember } from "@/types/chat";

interface DirectChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function DirectChatDrawer({ open, onClose }: DirectChatDrawerProps) {
  const auth = useStore(authStore, (s) => s);
  const currentUserId = auth.user?.id;

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);

  // 새 대화 시작용 사용자 목록
  const [showUserList, setShowUserList] = useState(false);
  const [allUsers, setAllUsers] = useState<
    { id: number; username: string; email: string; profileImageUrl?: string }[]
  >([]);

  // 선택된 채팅방
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // WebSocket
  const { send, subscribe, unsubscribe } = usePureWebSocket();

  // 방 목록 로드
  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const myRooms = await chatApi.getMyRooms();
      setRooms(myRooms.filter((r) => r.roomType === "DIRECT" && r.isActive));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadRooms();
  }, [open, loadRooms]);

  // 사용자 목록 로드
  const loadUsers = useCallback(async () => {
    try {
      const { apiClient } = await import("@/shared/api/client");
      const { data } = await apiClient.get("/users");
      setAllUsers(
        data.filter(
          (u: { id: number; isActive?: boolean }) =>
            u.id !== currentUserId && u.isActive !== false,
        ),
      );
    } catch {
      // ignore
    }
  }, [currentUserId]);

  // 채팅방 선택 시 메시지 로드 + WebSocket 구독
  useEffect(() => {
    if (!selectedRoom) return;

    const loadMessages = async () => {
      try {
        const msgs = await chatApi.getRoomMessages(selectedRoom.id, 100);
        setMessages(msgs);
        const members = await chatApi.getRoomMembers(selectedRoom.id);
        setRoomMembers(members);
      } catch {
        // ignore
      }
    };

    loadMessages();

    const topic = `chat/${selectedRoom.id}`;
    const handler = (data: unknown) => {
      const msg = data as ChatMessage;
      setMessages((prev) => [...prev, msg]);
    };

    subscribe(topic, handler);
    return () => unsubscribe(topic, handler);
  }, [selectedRoom, subscribe, unsubscribe]);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송
  const handleSend = () => {
    if (!inputValue.trim() || !selectedRoom) return;
    send({
      type: "CHAT",
      topic: `chat/${selectedRoom.id}`,
      data: {
        roomId: selectedRoom.id,
        senderId: currentUserId,
        senderName: auth.user?.username ?? "",
        content: inputValue.trim(),
        messageType: "TALK",
      },
    });
    setInputValue("");
    inputRef.current?.focus();
  };

  // 1:1 방 생성 또는 기존 방 열기
  const startDirectChat = async (
    targetUser: { id: number; username: string },
  ) => {
    // 기존 DIRECT 방 검색
    const existing = rooms.find((r) => {
      // 방 이름에 상대방 이름이 포함되어 있는지 확인
      return r.roomType === "DIRECT" && r.name.includes(targetUser.username);
    });

    if (existing) {
      setSelectedRoom(existing);
      setShowUserList(false);
      return;
    }

    // 새 방 생성
    try {
      const roomId = await chatApi.createRoom({
        name: `${auth.user?.username}, ${targetUser.username}`,
        roomType: "DIRECT",
      });
      // 상대방 초대
      await chatApi.joinRoom(roomId);
      // TODO: 상대방 자동 참가 로직 필요 (백엔드에서 처리)
      await loadRooms();
      const newRooms = await chatApi.getMyRooms();
      const newRoom = newRooms.find((r) => r.id === roomId);
      if (newRoom) setSelectedRoom(newRoom);
      setShowUserList(false);
    } catch {
      // ignore
    }
  };

  // 상대방 이름 가져오기
  const getPartnerName = (room: ChatRoom) => {
    const names = room.name.split(",").map((n) => n.trim());
    return names.find((n) => n !== auth.user?.username) || room.name;
  };

  if (!open) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* 드로워 */}
      <div className="fixed right-0 top-0 bottom-0 w-[360px] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          {selectedRoom ? (
            <>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-semibold flex-1 text-center truncate px-2">
                {getPartnerName(selectedRoom)}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                메시지
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowUserList(!showUserList);
                    if (!showUserList) loadUsers();
                  }}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  title="새 대화"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 본문 */}
        {selectedRoom ? (
          // 채팅 화면
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  메시지가 없습니다. 대화를 시작하세요!
                </p>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id ?? i}
                    className={cn(
                      "flex gap-2",
                      isMe ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-1">
                        {msg.senderName?.[0]}
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm",
                      )}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-medium opacity-60 mb-0.5">
                          {msg.senderName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                      {msg.createdAt && (
                        <p
                          className={cn(
                            "text-[10px] mt-1 opacity-40",
                            isMe ? "text-right" : "",
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 */}
            <div className="px-3 py-2.5 border-t border-border shrink-0">
              <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="메시지 입력..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="p-1.5 rounded-full bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : showUserList ? (
          // 사용자 목록 (새 대화 시작)
          <div className="flex-1 overflow-y-auto">
            <p className="px-4 py-2 text-xs text-muted-foreground font-medium">
              대화할 사용자 선택
            </p>
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => startDirectChat(user)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </button>
            ))}
            {allUsers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                사용자가 없습니다
              </p>
            )}
          </div>
        ) : (
          // 채팅방 목록
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                로딩 중...
              </p>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <MessageSquare className="w-10 h-10 opacity-20" />
                <p className="text-sm">아직 대화가 없습니다</p>
                <button
                  onClick={() => {
                    setShowUserList(true);
                    loadUsers();
                  }}
                  className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  새 대화 시작
                </button>
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                    {getPartnerName(room)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getPartnerName(room)}과의 대화
                    </p>
                    <p className="text-xs text-muted-foreground">
                      멤버 {room.memberCount}명
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
