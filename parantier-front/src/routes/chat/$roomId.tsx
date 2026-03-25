import { useState, useEffect, useRef } from 'react'
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
  const clientRef = useRef<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentRoomIdRef = useRef<string | null>(null)

  // 로그인한 사용자 정보 가져오기
  const authState = useStore(authStore, (state) => state)
  const username = authState.user?.username || authState.user?.email || 'Anonymous'
  const currentUserId = authState.user?.id

  // 채팅방 정보 로드
  const { data: chatRoom } = useChatRoom(roomId ? Number(roomId) : null)

  // 채팅방 참가자 목록 로드
  const { data: participants = [], isLoading: participantsLoading, error: participantsError } = useRoomMembers(
    roomId ? Number(roomId) : null
  )

  // 채팅방 나가기
  const leaveRoomMutation = useLeaveRoom(() => {
    navigate({ to: '/chat' })
  })

  // 현재 roomId 추적
  useEffect(() => {
    currentRoomIdRef.current = roomId
  }, [roomId])

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

    // 페이지 이탈/새로고침 시 자동 나가기 처리
    const handleBeforeUnload = () => {
      // WebSocket 연결 끊기
      client.deactivate()

      // Beacon API로 나가기 요청 (페이지 unload 시에도 안전하게 전송)
      if (currentRoomIdRef.current) {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const url = `http://localhost:8080/api/chat/rooms/${currentRoomIdRef.current}/leave`
          const data = new FormData()

          // Beacon으로 POST 요청 보내기
          fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            keepalive: true, // 페이지가 unload 되어도 요청 완료 보장
          }).catch(() => {}) // 에러 무시 (페이지가 닫히는 중이므로)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      client.deactivate()

      // 정상적인 컴포넌트 unmount 시에도 나가기 (라우팅 이동 등)
      if (currentRoomIdRef.current) {
        const token = localStorage.getItem('accessToken')
        if (token) {
          fetch(`http://localhost:8080/api/chat/rooms/${currentRoomIdRef.current}/leave`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }).catch(console.error)
        }
      }
    }
  }, [roomId])

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              메시지가 없습니다. 첫 메시지를 보내보세요!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
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
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 (하단 고정) */}
        <div className="border-t px-6 py-4 bg-background">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
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
