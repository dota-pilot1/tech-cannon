import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Send } from 'lucide-react'

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

interface ChatMessage {
  id?: number
  roomId?: number
  senderId?: number
  senderName: string
  content: string
  messageType?: string
  createdAt?: string
}

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState('')
  const clientRef = useRef<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 사용자 이름 설정 (임시)
    const storedUsername = localStorage.getItem('username') || `User${Math.floor(Math.random() * 1000)}`
    setUsername(storedUsername)
    localStorage.setItem('username', storedUsername)

    // WebSocket 연결 설정
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket Connected')
        setIsConnected(true)

        // /topic/messages 구독
        client.subscribe('/topic/messages', (message) => {
          const receivedMessage = JSON.parse(message.body) as ChatMessage
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
    }
  }, [])

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected || !clientRef.current) return

    const message: ChatMessage = {
      senderId: 1, // 임시 ID
      senderName: username,
      content: inputMessage,
      messageType: 'TEXT',
    }

    // /app/chat.send 로 메시지 전송
    clientRef.current.publish({
      destination: '/app/chat.send',
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
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">채팅</h1>
          <p className="text-sm text-muted-foreground">사용자: {username}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-sm">{isConnected ? '연결됨' : '연결 끊김'}</span>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

      {/* 메시지 입력 */}
      <div className="border-t p-4">
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
  )
}
