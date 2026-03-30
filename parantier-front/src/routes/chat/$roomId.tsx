import { useState, useEffect, useRef, useMemo } from 'react'
import { Client } from '@stomp/stompjs'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Send, LogOut } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/entities/user/model/authStore'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useRoomMembers, useLeaveRoom, useChatRoom } from '@/hooks/useChat'
import { chatApi } from '@/api/chatApi'
import type { ChatMessage } from '@/types/chat'

export function ChatRoomPage() {
  const { roomId } = useParams({ from: '/chat/$roomId' })
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const clientRef = useRef<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesTopRef = useRef<HTMLDivElement>(null)
  const currentRoomIdRef = useRef<string | null>(null)

  // 로그인한 사용자 정보 가져오기
  const authState = useStore(authStore, (state) => state)
  const username = authState.user?.username || authState.user?.email || 'Anonymous'
  const currentUserId = authState.user?.id

  // 채팅방 정보 로드
  const { data: chatRoom } = useChatRoom(roomId ? Number(roomId) : null)

  // 채팅방 참가자 목록 로드
  const { data: participants = [], refetch: refetchParticipants } = useRoomMembers(
    roomId ? Number(roomId) : null
  )

  // 채팅방 나가기
  const leaveRoomMutation = useLeaveRoom(() => {
    navigate({ to: '/chat' })
  })

  // 1. 참여자 목록 실시간 동기화 (10초 주기) - 어설프게 혼자만 멈춰있지 않도록
  useEffect(() => {
    if (!roomId) return
    const interval = setInterval(() => {
      refetchParticipants()
    }, 10000)
    return () => clearInterval(interval)
  }, [roomId, refetchParticipants])

  // 2. 브라우저 종료/다른 페이지 이동 시 자동 방 나가기 처리 (Transient Chat 방식 적용)
  useEffect(() => {
    if (!roomId) return

    // 브라우저 탭 닫힘 감지용 핸들러 (동기적 fetch + keepalive 방식 사용)
    const handleBeforeUnload = () => {
      const state = authStore.state
      if (state.accessToken) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
        fetch(`${API_URL}/chat/rooms/${roomId}/leave`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${state.accessToken}`,
            'Content-Type': 'application/json',
          },
          keepalive: true,
        }).catch(() => {})
      }
    }

    // 마운트 시 자동 입장 처리 (URL 직접 접근 등) 
    chatApi.joinRoom(Number(roomId)).then(() => refetchParticipants()).catch(() => {})

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // 컴포넌트 언마운트 시 자동으로 방 나가기 처리
      chatApi.leaveRoom(Number(roomId)).catch(() => {})
    }
  }, [roomId, refetchParticipants])

  // 현재 roomId 추적
  useEffect(() => {
    currentRoomIdRef.current = roomId
  }, [roomId])

  // 채팅방 입장 시 최근 메시지만 로드 (30개 = 약 1일치)
  useEffect(() => {
    if (!roomId) return

    chatApi
      .getRoomMessages(Number(roomId), 30)
      .then((history) => {
        // 최신순으로 받았으므로 역순으로 표시 (오래된 것부터)
        setMessages(history.reverse())
        setHasMore(history.length === 30) // 30개 가득 채워졌으면 더 있을 수 있음
      })
      .catch((error) => {
        console.error('Failed to load message history:', error)
      })
  }, [roomId])

  // 과거 메시지 로드 (무한 스크롤)
  const loadMoreMessages = async () => {
    if (!roomId || isLoadingMore || !hasMore || messages.length === 0) return

    setIsLoadingMore(true)
    try {
      const oldestMessageId = messages[0]?.id
      const olderMessages = await chatApi.getRoomMessages(Number(roomId), 30, oldestMessageId)

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages.reverse(), ...prev])
        setHasMore(olderMessages.length === 30)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 스크롤 최상단 감지 (무한 스크롤)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreMessages()
        }
      },
      { threshold: 1.0 }
    )

    if (messagesTopRef.current) {
      observer.observe(messagesTopRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, messages])

  // 명시적 나가기 버튼 핸들러
  const handleLeaveRoom = () => {
    if (currentRoomIdRef.current) {
      // WebSocket 연결 먼저 끊기
      if (clientRef.current) {
        clientRef.current.deactivate()
      }
      leaveRoomMutation.mutate(Number(currentRoomIdRef.current))
    }
  }

  useEffect(() => {
    if (!roomId) return

    // WebSocket 연결 설정
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log(`WebSocket Connected - Room ${roomId}`)
        setIsConnected(true)

        // 채팅방별 토픽 구독: /topic/room/{roomId}
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body) as ChatMessage
          console.log('Received message in room', roomId, receivedMessage)
          setMessages((prev) => [...prev, receivedMessage])
        })
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        setIsConnected(false)
      },

      onWebSocketClose: () => {
        console.log('WebSocket Disconnected')
        setIsConnected(false)
      },
    })

    clientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      // 새로고침 시에는 나가기 처리하지 않음
      // 명시적으로 "나가기" 버튼을 누르거나 다른 페이지로 이동할 때만 나가기
    }
  }, [roomId])

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 날짜 구분선이 포함된 메시지 목록 (메모이제이션)
  const messagesWithSeparators = useMemo(() => {
    return messages.map((msg, index) => {
      const currentDate = msg.createdAt
        ? new Date(msg.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })
        : null

      const prevDate =
        index > 0 && messages[index - 1].createdAt
          ? new Date(messages[index - 1].createdAt!).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })
          : null

      return {
        ...msg,
        dateLabel: currentDate,
        showDateSeparator: currentDate && currentDate !== prevDate,
      }
    })
  }, [messages])

  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected || !clientRef.current || !roomId) return

    const message: ChatMessage = {
      senderId: currentUserId || 1,
      senderName: username,
      content: inputMessage,
      messageType: 'TEXT',
    }

    // 채팅방별 메시지 전송: /app/chat/{roomId}/send
    clientRef.current.publish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify(message),
    })

    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* 왼쪽: 채팅 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 채팅 헤더 */}
        <div className="border-b px-6 py-4 flex items-center justify-between min-h-[73px]">
          <div>
            <h1 className="text-xl font-bold">{chatRoom?.name || `채팅방 #${roomId}`}</h1>
            <p className="text-sm text-muted-foreground">
              {chatRoom?.roomType === 'TEAM' && '팀'}
              {chatRoom?.roomType === 'PROJECT' && '프로젝트'}
              {chatRoom?.roomType === 'DIRECT' && '1:1'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm">{isConnected ? '연결됨' : '연결 끊김'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveRoom}
              disabled={leaveRoomMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              나가기
            </Button>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messagesWithSeparators.length === 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              메시지가 없습니다. 첫 메시지를 보내보세요!
            </div>
          ) : (
            <>
              {/* 무한 스크롤 트리거 (최상단) */}
              <div ref={messagesTopRef} className="h-1" />

              {/* 로딩 인디케이터 */}
              {isLoadingMore && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground">과거 메시지 불러오는 중...</span>
                </div>
              )}

              {messagesWithSeparators.map((msg, index) => (
                <div key={index}>
                  {/* 날짜 구분선 */}
                  {msg.showDateSeparator && (
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 border-t border-border" />
                      <div className="text-xs text-muted-foreground font-medium px-3">
                        {msg.dateLabel}
                      </div>
                      <div className="flex-1 border-t border-border" />
                    </div>
                  )}

                  {/* 메시지 */}
                  <div
                    className={`flex ${msg.senderName === username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderName === username
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">{msg.senderName}</div>
                      <div className="break-words">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 메시지 입력 (하단 고정) */}
        <div className="border-t px-6 py-4 bg-background">
          <div className="flex gap-2">
            <Input
              autoFocus
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Enter로 전송)"
              disabled={!isConnected}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!isConnected || !inputMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 오른쪽: 참가자 목록 */}
      <div className="w-64 border-l flex flex-col">
        {/* 참가자 헤더 */}
        <div className="border-b px-6 py-4 flex flex-col justify-center min-h-[73px]">
          <h2 className="font-semibold">참가자</h2>
          <p className="text-sm text-muted-foreground">온라인 {participants.length}명</p>
        </div>

        {/* 참가자 목록 */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {participants.map((participant, index) => {
            const isCurrentUser = participant.userId === currentUserId
            return (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded ${
                  isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {participant.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {participant.username}
                    {isCurrentUser && <span className="ml-1 text-xs text-primary">(나)</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">온라인</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
