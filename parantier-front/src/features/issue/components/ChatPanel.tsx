import { useEffect, useRef, useMemo } from 'react'
import { useIssueMessages } from '../hooks/useIssueMessages'
import { useIssueChat } from '../hooks/useIssueChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { Loader2, WifiOff, AlertCircle } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/entities/user/model/authStore'

interface ChatPanelProps {
  issueId: number
}

export function ChatPanel({ issueId }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useStore(authStore, (state) => state.user)

  // REST API: 과거 메시지 가져오기
  const { data: history = [], isLoading } = useIssueMessages(issueId)

  // WebSocket: 실시간 메시지
  const { messages: realtime, isConnected, sendMessage } = useIssueChat({ issueId })

  // 과거 + 실시간 메시지 합치기
  const allMessages = useMemo(() => {
    return [...history, ...realtime]
  }, [history, realtime])

  // 새 메시지가 추가되면 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  const handleSend = (message: string) => {
    if (!user?.id) {
      console.error('User not logged in')
      return
    }
    sendMessage(message, user.id, user.username)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">메시지를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">채팅</h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">연결됨</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">연결 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">아직 메시지가 없습니다.</p>
          </div>
        ) : (
          <>
            {allMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* WebSocket 연결 상태 경고 */}
      {!isConnected && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive">실시간 연결이 끊어졌습니다. 재연결 중...</p>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={!isConnected} />
    </div>
  )
}
