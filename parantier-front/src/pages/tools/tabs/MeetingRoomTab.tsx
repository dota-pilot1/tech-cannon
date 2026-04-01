import { useEffect, useRef, useMemo, useState } from "react";
import {
  WifiOff,
  Loader2,
  Users,
  Hash,
  Star,
  ExternalLink,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useStore } from "@tanstack/react-store";
import { authStore } from "@/entities/user/model/authStore";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChatInput } from "@/features/issue/components/ChatInput";
import {
  useMeetingChat,
  useMeetingChatHistory,
  useMeetingChannels,
  type Participant,
} from "@/features/meeting/hooks/useMeetingChat";
import type { MeetingChatMessageWithUser } from "@/entities/meeting/types/meetingChat";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  useBookmarks,
  useCreateBookmark,
  useDeleteBookmark,
} from "@/features/bookmark/hooks/useBookmarks";
import type { CreateBookmarkRequest } from "@/entities/bookmark/types/bookmark";

function ParticipantAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(name.length - 1).toUpperCase() : "?";
  return (
    <div
      className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0"
      title={name}
    >
      {initial}
    </div>
  );
}

function ParticipantItem({ participant }: { participant: Participant }) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors">
      <ParticipantAvatar name={participant.username} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {participant.username}
        </p>
      </div>
      <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
    </div>
  );
}

function ChatMessageItem({
  message,
  myUserId,
}: {
  message: MeetingChatMessageWithUser;
  myUserId: number | undefined;
}) {
  const isMe = myUserId === message.userId;

  const toUtcDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    return new Date(dateStr);
  };

  const timeStr = formatDistanceToNow(toUtcDate(message.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  if (isMe) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[72%]">
          <div className="flex items-baseline justify-end gap-1.5 mb-1">
            <span className="text-xs text-muted-foreground">{timeStr}</span>
            <span className="text-xs font-semibold text-foreground">나</span>
          </div>
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2">
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
        {message.username
          ? message.username.charAt(message.username.length - 1).toUpperCase()
          : "?"}
      </div>
      <div className="flex-1 max-w-[72%]">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-xs font-semibold text-foreground">
            {message.username}
          </span>
          <span className="text-xs text-muted-foreground">{timeStr}</span>
        </div>
        <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2">
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChannelSidebarSkeleton() {
  return (
    <div className="space-y-1 px-2 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg">
          <div className="w-3.5 h-3.5 bg-muted rounded shrink-0" />
          <div className="h-3 bg-muted rounded flex-1" />
        </div>
      ))}
    </div>
  );
}

export function MeetingRoomTab() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useStore(authStore, (state) => state.user);
  const isAuthenticated = useStore(authStore, (state) => state.isAuthenticated);
  const isRestored = useStore(authStore, (state) => state.isRestored);

  const [selectedChannelId, setSelectedChannelId] = useState(1);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  const [bookmarkForm, setBookmarkForm] = useState<CreateBookmarkRequest>({
    title: "",
    url: "",
    description: "",
    category: "",
  });

  const { data: bookmarks = [], isLoading: isBookmarksLoading } =
    useBookmarks();
  const { mutate: createBookmark, isPending: isCreating } = useCreateBookmark();
  const { mutate: deleteBookmark } = useDeleteBookmark();

  const handleAddBookmark = () => {
    const title = bookmarkForm.title.trim();
    const url = bookmarkForm.url.trim();
    if (!title || !url) return;

    createBookmark(
      {
        title,
        url,
        description: bookmarkForm.description?.trim() || undefined,
        category: bookmarkForm.category?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setBookmarkForm({
            title: "",
            url: "",
            description: "",
            category: "",
          });
          setIsAddingBookmark(false);
        },
      },
    );
  };

  const { data: channels = [], isLoading: isChannelsLoading } =
    useMeetingChannels();

  const { data: history = [], isLoading } =
    useMeetingChatHistory(selectedChannelId);

  const {
    messages: realtime,
    isConnected,
    participants,
    sendMessage,
  } = useMeetingChat({
    enabled: isRestored && !!user,
    userId: user?.id,
    username: user?.username,
    channelId: selectedChannelId,
  });

  const allMessages = useMemo(() => {
    const map = new Map<number, MeetingChatMessageWithUser>();
    [...history, ...realtime].forEach((m) => map.set(m.id, m));
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [history, realtime]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = (message: string) => {
    if (!user?.id) return;
    sendMessage(message, user.id, user.username);
  };

  const isUserReady = isRestored && isAuthenticated && !!user?.id;
  const today = format(new Date(), "yyyy년 M월 d일 (EEE)", { locale: ko });

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);
  const currentChannelName = selectedChannel?.name ?? "채널";

  if (!isRestored) {
    return (
      <div className="flex items-center justify-center h-full gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-muted/30 p-8 flex gap-5">
      {/* 채널 사이드바 */}
      <div className="w-44 shrink-0 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 py-3.5 border-b border-border shrink-0">
          <span className="text-sm font-semibold text-foreground">채널</span>
        </div>

        {/* 채널 목록 */}
        <div className="flex-1 overflow-y-auto p-2">
          {isChannelsLoading ? (
            <ChannelSidebarSkeleton />
          ) : channels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
              <p className="text-xs text-muted-foreground">채널이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {channels.map((channel) => {
                const isSelected = channel.id === selectedChannelId;
                return (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors text-sm ${
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 채팅 카드 */}
      <div className="flex-1 min-w-0 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="shrink-0 px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {currentChannelName}
            </span>
            <span className="text-xs text-muted-foreground">- {today}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 연결 상태 인디케이터 (텍스트 없이 점만 표시) */}
            <span
              className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                isConnected
                  ? "bg-green-500 animate-pulse"
                  : "bg-muted-foreground"
              }`}
              title={isConnected ? "연결됨" : "연결 중..."}
            />

            {/* 즐겨찾기 팝오버 버튼 */}
            <Popover
              onOpenChange={(open) => {
                if (!open) setIsAddingBookmark(false);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title="팀 즐겨찾기"
                >
                  <Star className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
                {/* 팝업 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  {isAddingBookmark ? (
                    <>
                      <span className="text-sm font-semibold text-foreground">
                        즐겨찾기 추가
                      </span>
                      <button
                        onClick={() => setIsAddingBookmark(false)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          팀 즐겨찾기
                        </span>
                        {bookmarks.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({bookmarks.length})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setIsAddingBookmark(true)}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        추가
                      </button>
                    </>
                  )}
                </div>

                {isAddingBookmark ? (
                  /* 추가 폼 */
                  <div className="px-4 py-4 space-y-2.5">
                    <input
                      type="text"
                      placeholder="사이트명 *"
                      value={bookmarkForm.title}
                      onChange={(e) =>
                        setBookmarkForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      type="url"
                      placeholder="URL * (https://...)"
                      value={bookmarkForm.url}
                      onChange={(e) =>
                        setBookmarkForm((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      type="text"
                      placeholder="설명 (선택)"
                      value={bookmarkForm.description}
                      onChange={(e) =>
                        setBookmarkForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      type="text"
                      placeholder="카테고리 (선택)"
                      value={bookmarkForm.category}
                      onChange={(e) =>
                        setBookmarkForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={handleAddBookmark}
                      disabled={
                        isCreating ||
                        !bookmarkForm.title.trim() ||
                        !bookmarkForm.url.trim()
                      }
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      {isCreating ? "추가 중..." : "추가하기"}
                    </button>
                  </div>
                ) : (
                  /* 즐겨찾기 목록 */
                  <div className="max-h-80 overflow-y-auto">
                    {isBookmarksLoading ? (
                      <div className="flex items-center justify-center py-8 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          불러오는 중...
                        </span>
                      </div>
                    ) : bookmarks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <Star className="w-8 h-8 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-foreground">
                          아직 즐겨찾기가 없습니다
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          위의 추가 버튼으로 링크를 공유해보세요
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-border">
                        {bookmarks.map((bookmark) => (
                          <li
                            key={bookmark.id}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <a
                                  href={bookmark.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-primary hover:underline truncate flex items-center gap-1"
                                >
                                  {bookmark.title}
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                {bookmark.category && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {bookmark.category}
                                  </span>
                                )}
                              </div>
                              {bookmark.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {bookmark.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground/60 mt-0.5">
                                {bookmark.createdByName}
                              </p>
                            </div>
                            {bookmark.createdBy === user?.id && (
                              <button
                                onClick={() => deleteBookmark(bookmark.id)}
                                className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${i % 2 === 0 ? "" : "justify-end"}`}
                >
                  {i % 2 === 0 && (
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                  )}
                  <div className="space-y-1.5 max-w-[60%]">
                    <div className="h-3 bg-muted rounded w-16" />
                    <div className="h-9 bg-muted rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span>&#128172;</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                아직 메시지가 없습니다
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                회의를 시작해보세요!
              </p>
            </div>
          ) : (
            <>
              {allMessages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  myUserId={user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 연결 경고 */}
        {!isConnected && !isLoading && (
          <div className="shrink-0 px-5 py-2">
            <div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
              <WifiOff className="w-3.5 h-3.5 text-destructive shrink-0" />
              <p className="text-xs text-destructive">
                실시간 연결이 끊어졌습니다. 재연결 중...
              </p>
            </div>
          </div>
        )}

        {/* 입력창 */}
        <div className="shrink-0">
          <ChatInput
            onSend={handleSend}
            disabled={!isConnected || !isUserReady}
          />
        </div>
      </div>

      {/* 참가자 카드 */}
      <div className="w-48 shrink-0 rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                참가자
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {participants.length}명
            </span>
          </div>
        </div>

        {/* 참가자 목록 */}
        <div className="flex-1 overflow-y-auto p-2">
          {participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                아직 참가자가 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {participants.map((p) => (
                <ParticipantItem key={p.userId} participant={p} />
              ))}
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="shrink-0 border-t border-border px-4 py-3.5">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              - 회의 내용은 실시간 동기화됩니다.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              - 탭을 벗어나면 자동 퇴장됩니다.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              - Ctrl+Enter로 전송하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
